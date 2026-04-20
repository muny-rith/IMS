// src/features/loans/services/loanService.js
import supabase from '../../../lib/supabaseClient';
import {
  assertAvailable,
  applyLoanOut,
  applyLoanReturn,
} from '../../stocks/services/stockService';

const generateLoanCode = () =>
  `LN-${new Date().toISOString().replace(/\D/g, '').slice(0, 14)}`;

const asObject = (value) => (Array.isArray(value) ? value[0] : value);

const deriveItemStatus = (qty, returnedQty) => {
  if (returnedQty <= 0) return 'OPEN';
  if (returnedQty >= qty) return 'RETURNED';
  return 'PARTIAL';
};

const deriveLoanStatus = (items) => {
  const totalQty = items.reduce((sum, item) => sum + Number(item.qty ?? 0), 0);
  const totalReturned = items.reduce(
    (sum, item) => sum + Number(item.returned_qty ?? 0),
    0
  );

  if (totalReturned <= 0) return 'OPEN';
  if (totalReturned >= totalQty) return 'RETURNED';
  return 'PARTIAL';
};

const normalizeLoanItem = (item) => {
  const product = asObject(item.products);
  const qty = Number(item.qty ?? 0);
  const returnedQty = Number(item.returned_qty ?? 0);

  return {
    id: item.loan_item_id,
    productId: item.product_id,
    productCode: product?.product_code ?? '',
    productName: product?.product_name ?? '',
    qty,
    returnedQty,
    remainingQty: Math.max(qty - returnedQty, 0),
    itemStatus: item.item_status,
    notes: item.notes ?? '',
  };
};

const normalizeLoanRow = (row) => {
  const worker = asObject(row.workers);
  const items = (row.loan_items ?? []).map(normalizeLoanItem);
  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
  const returnedQty = items.reduce((sum, item) => sum + item.returnedQty, 0);

  return {
    id: row.loan_id,
    code: row.loan_code,
    workerId: row.worker_id,
    workerCode: worker?.worker_code ?? '',
    workerName: worker?.worker_name ?? '—',
    loanDate: row.loan_date,
    dueDate: row.due_date,
    returnedAt: row.returned_at,
    status: row.loan_status,
    notes: row.notes ?? '',
    totalItems: items.length,
    totalQty,
    returnedQty,
    outstandingQty: totalQty - returnedQty,
    items,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const normalizeWorkerOption = (row) => ({
  id: row.worker_id,
  code: row.worker_code,
  name: row.worker_name,
  positionTitle: row.position_title ?? '',
  department: row.department ?? '',
  label: `${row.worker_code} - ${row.worker_name}`,
});

const normalizeProductOption = (row) => {
  const category = asObject(row.categories);
  const stock = asObject(row.stock_balances);

  const onHandQty = Number(stock?.on_hand_qty ?? 0);
  const reservedQty = Number(stock?.reserved_qty ?? 0);

  return {
    id: row.product_id,
    code: row.product_code,
    name: row.product_name,
    categoryId: row.category_id,
    category: category?.category_name ?? '—',
    onHandQty,
    reservedQty,
    availableQty: onHandQty - reservedQty,
    label: `${row.product_code} - ${row.product_name}`,
  };
};

const normalizeCreateItems = (items) => {
  const normalized = (items ?? [])
    .map((item) => ({
      productId: Number(item.productId),
      qty: Number(item.qty),
    }))
    .filter((item) => item.productId && item.qty > 0);

  if (!normalized.length) {
    throw new Error('At least one loan item is required.');
  }

  return normalized;
};

export const syncLoanStatus = async (loanId) => {
  const { data, error } = await supabase
    .from('loan_items')
    .select('qty, returned_qty')
    .eq('loan_id', loanId);

  if (error) {
    throw new Error(error.message);
  }

  const status = deriveLoanStatus(data ?? []);
  const payload = {
    loan_status: status,
    updated_at: new Date().toISOString(),
    returned_at: status === 'RETURNED' ? new Date().toISOString() : null,
  };

  const { error: updateError } = await supabase
    .from('loans')
    .update(payload)
    .eq('loan_id', loanId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return status;
};

export const fetchLoans = async () => {
  const { data, error } = await supabase
    .from('loans')
    .select(`
      loan_id,
      loan_code,
      worker_id,
      loan_date,
      due_date,
      returned_at,
      loan_status,
      notes,
      created_at,
      updated_at,
      workers (
        worker_id,
        worker_code,
        worker_name
      ),
      loan_items (
        loan_item_id,
        product_id,
        qty,
        returned_qty,
        item_status,
        notes,
        products (
          product_id,
          product_code,
          product_name
        )
      )
    `)
    .order('loan_id', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(normalizeLoanRow);
};

export const fetchWorkersForLoan = async () => {
  const { data, error } = await supabase
    .from('workers')
    .select(`
      worker_id,
      worker_code,
      worker_name,
      position_title,
      department
    `)
    .order('worker_name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(normalizeWorkerOption);
};

export const fetchProductsForLoan = async () => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      product_id,
      product_code,
      product_name,
      category_id,
      categories (
        category_id,
        category_name
      ),
      stock_balances (
        on_hand_qty,
        reserved_qty
      )
    `)
    .order('product_name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(normalizeProductOption);
};

export const createLoan = async (data) => {
  if (!data.workerId) {
    throw new Error('Worker is required.');
  }

  const items = normalizeCreateItems(data.items);

  await assertAvailable(items);

  const { data: loanRow, error: loanError } = await supabase
    .from('loans')
    .insert([
      {
        loan_code: data.code?.trim() || generateLoanCode(),
        worker_id: Number(data.workerId),
        loan_date: data.loanDate || new Date().toISOString().slice(0, 10),
        due_date: data.dueDate || null,
        loan_status: 'OPEN',
        notes: data.notes?.trim() || null,
      },
    ])
    .select('loan_id')
    .single();

  if (loanError) {
    throw new Error(loanError.message);
  }

  const { data: createdItems, error: itemError } = await supabase
    .from('loan_items')
    .insert(
      items.map((item) => ({
        loan_id: loanRow.loan_id,
        product_id: item.productId,
        qty: item.qty,
        returned_qty: 0,
        item_status: 'OPEN',
        notes: null,
      }))
    )
    .select('loan_item_id, product_id, qty');

  if (itemError) {
    throw new Error(itemError.message);
  }

  await applyLoanOut({
    loanItems: createdItems,
    notes: data.notes,
  });

  return loanRow.loan_id;
};

export const returnLoanItem = async ({ loanItemId, qty, notes }) => {
  const returnQty = Number(qty);

  if (!loanItemId || returnQty <= 0) {
    throw new Error('Valid loan item and return quantity are required.');
  }

  const { data: loanItem, error: loanItemError } = await supabase
    .from('loan_items')
    .select(`
      loan_item_id,
      loan_id,
      product_id,
      qty,
      returned_qty,
      item_status
    `)
    .eq('loan_item_id', loanItemId)
    .single();

  if (loanItemError) {
    throw new Error(loanItemError.message);
  }

  const totalQty = Number(loanItem.qty ?? 0);
  const currentReturnedQty = Number(loanItem.returned_qty ?? 0);
  const remainingQty = totalQty - currentReturnedQty;

  if (returnQty > remainingQty) {
    throw new Error('Return quantity cannot exceed remaining quantity.');
  }

  const newReturnedQty = currentReturnedQty + returnQty;
  const newItemStatus = deriveItemStatus(totalQty, newReturnedQty);

  const { error: updateItemError } = await supabase
    .from('loan_items')
    .update({
      returned_qty: newReturnedQty,
      item_status: newItemStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('loan_item_id', loanItemId);

  if (updateItemError) {
    throw new Error(updateItemError.message);
  }

  await applyLoanReturn({
    loanItemId,
    productId: loanItem.product_id,
    qty: returnQty,
    notes,
  });

  await syncLoanStatus(loanItem.loan_id);

  return {
    loanId: loanItem.loan_id,
    loanItemId,
    returnedQty: returnQty,
  };
};
