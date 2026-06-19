import api from '../../../lib/api';

const normalizeLoanItem = (item) => {
  const qty = Number(item.qty ?? 0);
  const returnedQty = Number(item.returned_qty ?? 0);

  return {
    id: item.loan_item_id,
    productId: item.product_id,
    productCode: item.product_code ?? '',
    productName: item.product_name ?? '',
    qty,
    returnedQty,
    remainingQty: Math.max(qty - returnedQty, 0),
    itemStatus: item.item_status,
    notes: item.notes ?? '',
  };
};

const normalizeLoanRow = (row) => {
  const items = (row.items ?? []).map(normalizeLoanItem);
  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
  const returnedQty = items.reduce((sum, item) => sum + item.returnedQty, 0);

  return {
    id: row.loan_id,
    code: row.loan_code,
    workerId: row.worker_id,
    workerCode: row.worker_code ?? '',
    workerName: row.worker_name ?? '—',
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

export const fetchLoans = async () => {
  const response = await api.get('/loans');
  return (response.data.data ?? []).map(normalizeLoanRow);
};

export const fetchWorkersForLoan = async () => {
  const response = await api.get('/workers');
  return (response.data.data ?? []).map((row) => ({
    id: row.worker_id,
    code: row.worker_code,
    name: row.worker_name,
    positionTitle: row.position_title ?? '',
    department: row.department ?? '',
    label: `${row.worker_code} - ${row.worker_name}`,
  }));
};

export const fetchProductsForLoan = async () => {
  const response = await api.get('/products');
  return (response.data.data ?? []).map((row) => {
    const onHandQty = Number(row.on_hand_qty ?? 0);
    const reservedQty = Number(row.reserved_qty ?? 0);

    return {
      id: row.product_id,
      code: row.product_code,
      name: row.product_name,
      categoryId: row.category_id,
      category: row.category_name ?? '—',
      onHandQty,
      reservedQty,
      availableQty: onHandQty - reservedQty,
      label: `${row.product_code} - ${row.product_name}`,
    };
  });
};

export const createLoan = async (data) => {
  const response = await api.post('/loans', {
    workerId: data.workerId,
    code: data.code,
    loanDate: data.loanDate,
    dueDate: data.dueDate,
    notes: data.notes,
    items: data.items.map((item) => ({
      productId: Number(item.productId),
      qty: Number(item.qty),
    })),
  });
  return response.data.data.loan_id;
};

export const returnLoanItem = async ({ loanItemId, qty, notes }) => {
  const response = await api.post('/loans/return', {
    loanItemId: Number(loanItemId),
    qty: Number(qty),
    notes,
  });
  return response.data.data;
};
