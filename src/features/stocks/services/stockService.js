// src/features/stock/services/stockService.js
import supabase from '../../../lib/supabaseClient';

const asObject = (value) => (Array.isArray(value) ? value[0] : value);

const normalizeStockBalanceRow = (row) => {
  const product = asObject(row.products);
  const category = asObject(product?.categories);

  const onHandQty = Number(row.on_hand_qty ?? 0);
  const reservedQty = Number(row.reserved_qty ?? 0);

  return {
    id: row.stock_balance_id,
    productId: row.product_id,
    productCode: product?.product_code ?? '',
    productName: product?.product_name ?? '',
    category: category?.category_name ?? '—',
    onHandQty,
    reservedQty,
    availableQty: onHandQty - reservedQty,
    updatedAt: row.updated_at,
  };
};

const normalizeStockMovementRow = (row) => {
  const product = asObject(row.products);

  return {
    id: row.movement_id,
    productId: row.product_id,
    productCode: product?.product_code ?? '',
    productName: product?.product_name ?? '',
    movementType: row.movement_type,
    qty: Number(row.qty ?? 0),
    notes: row.notes ?? '',
    loanItemId: row.loan_item_id,
    saleItemId: row.sale_item_id,
    stockIssueItemId: row.stock_issue_item_id,
    createdAt: row.created_at,
  };
};

const getStockBalanceByProductId = async (productId) => {
  const { data, error } = await supabase
    .from('stock_balances')
    .select(`
      stock_balance_id,
      product_id,
      on_hand_qty,
      reserved_qty,
      updated_at
    `)
    .eq('product_id', productId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const getBalanceMap = async (productIds) => {
  const { data, error } = await supabase
    .from('stock_balances')
    .select('product_id, on_hand_qty, reserved_qty')
    .in('product_id', productIds);

  if (error) {
    throw new Error(error.message);
  }

  const map = new Map();

  (data ?? []).forEach((row) => {
    map.set(row.product_id, {
      onHandQty: Number(row.on_hand_qty ?? 0),
      reservedQty: Number(row.reserved_qty ?? 0),
    });
  });

  return map;
};

export const fetchStockBalances = async () => {
  const { data, error } = await supabase
    .from('stock_balances')
    .select(`
      stock_balance_id,
      product_id,
      on_hand_qty,
      reserved_qty,
      updated_at,
      products (
        product_id,
        product_code,
        product_name,
        categories (
          category_id,
          category_name
        )
      )
    `)
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(normalizeStockBalanceRow);
};

export const fetchStockMovements = async (limit = 30) => {
  const { data, error } = await supabase
    .from('stock_movements')
    .select(`
      movement_id,
      product_id,
      movement_type,
      qty,
      loan_item_id,
      sale_item_id,
      stock_issue_item_id,
      notes,
      created_at,
      products (
        product_id,
        product_code,
        product_name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(normalizeStockMovementRow);
};

export const assertAvailable = async (items) => {
  const normalizedItems = (items ?? [])
    .map((item) => ({
      productId: Number(item.productId),
      qty: Number(item.qty),
    }))
    .filter((item) => item.productId && item.qty > 0);

  if (!normalizedItems.length) {
    throw new Error('No stock items provided.');
  }

  const grouped = normalizedItems.reduce((map, item) => {
    const current = map.get(item.productId) ?? 0;
    map.set(item.productId, current + item.qty);
    return map;
  }, new Map());

  const productIds = [...grouped.keys()];
  const balanceMap = await getBalanceMap(productIds);

  for (const [productId, qtyNeeded] of grouped.entries()) {
    const balance = balanceMap.get(productId);
    const availableQty =
      Number(balance?.onHandQty ?? 0) - Number(balance?.reservedQty ?? 0);

    if (availableQty < qtyNeeded) {
      throw new Error(`Not enough stock for product ID ${productId}.`);
    }
  }

  return true;
};

export const applyLoanOut = async ({ loanItems, notes }) => {
  if (!loanItems?.length) {
    throw new Error('Loan items are required for stock out.');
  }

  const grouped = loanItems.reduce((map, item) => {
    const current = map.get(item.product_id) ?? 0;
    map.set(item.product_id, current + Number(item.qty ?? 0));
    return map;
  }, new Map());

  const productIds = [...grouped.keys()];
  const balanceMap = await getBalanceMap(productIds);

  for (const item of loanItems) {
    const { error: movementError } = await supabase
      .from('stock_movements')
      .insert([
        {
          product_id: item.product_id,
          loan_item_id: item.loan_item_id,
          movement_type: 'LOAN_OUT',
          qty: Number(item.qty),
          notes: notes?.trim() || null,
        },
      ]);

    if (movementError) {
      throw new Error(movementError.message);
    }
  }

  for (const [productId, totalQty] of grouped.entries()) {
    const current = balanceMap.get(productId);

    if (!current) {
      throw new Error(`Missing stock balance for product ID ${productId}.`);
    }

    const nextQty = current.onHandQty - totalQty;

    if (nextQty < 0) {
      throw new Error(`Stock cannot go negative for product ID ${productId}.`);
    }

    const { error: balanceError } = await supabase
      .from('stock_balances')
      .update({
        on_hand_qty: nextQty,
        updated_at: new Date().toISOString(),
      })
      .eq('product_id', productId);

    if (balanceError) {
      throw new Error(balanceError.message);
    }
  }
};

export const applyLoanReturn = async ({ loanItemId, productId, qty, notes }) => {
  const returnQty = Number(qty);

  if (!loanItemId || !productId || returnQty <= 0) {
    throw new Error('Valid loan return data is required.');
  }

  const balance = await getStockBalanceByProductId(productId);

  const { error: movementError } = await supabase
    .from('stock_movements')
    .insert([
      {
        product_id: productId,
        loan_item_id: loanItemId,
        movement_type: 'LOAN_RETURN',
        qty: returnQty,
        notes: notes?.trim() || null,
      },
    ]);

  if (movementError) {
    throw new Error(movementError.message);
  }

  const { error: balanceUpdateError } = await supabase
    .from('stock_balances')
    .update({
      on_hand_qty: Number(balance.on_hand_qty ?? 0) + returnQty,
      updated_at: new Date().toISOString(),
    })
    .eq('product_id', productId);

  if (balanceUpdateError) {
    throw new Error(balanceUpdateError.message);
  }
};

export const applyAdjustment = async ({ productId, qty, type,adjustmentDate, notes }) => {
  const amount = Number(qty);

  if (!productId || amount <= 0) {
    throw new Error('Valid stock adjustment is required.');
  }

  if (!['ADJUSTMENT_IN', 'ADJUSTMENT_OUT'].includes(type)) {
    throw new Error('Invalid stock adjustment type.');
  }

  if (!notes?.trim()) {
    throw new Error('Notes are required for stock adjustment.');
  }
  const movementDate = adjustmentDate
    ? new Date(`${adjustmentDate}T00:00:00`).toISOString()
    : new Date().toISOString();

  const balance = await getStockBalanceByProductId(productId);

  const currentQty = Number(balance.on_hand_qty ?? 0);
  const nextQty =
    type === 'ADJUSTMENT_IN' ? currentQty + amount : currentQty - amount;

  if (nextQty < 0) {
    throw new Error('Stock cannot go negative.');
  }

  const { error: movementError } = await supabase
    .from('stock_movements')
    .insert([
      {
        product_id: productId,
        movement_type: type,
        qty: amount,
        notes: notes.trim(),
        created_at: movementDate,
        loan_item_id: null,
        sale_item_id: null,
        stock_issue_item_id: null,
      },
    ]);

  if (movementError) {
    throw new Error(movementError.message);
  }

  const { error: balanceUpdateError } = await supabase
    .from('stock_balances')
    .update({
      on_hand_qty: nextQty,
      updated_at: new Date().toISOString(),
    })
    .eq('product_id', productId);

  if (balanceUpdateError) {
    throw new Error(balanceUpdateError.message);
  }

  return {
    productId,
    previousQty: currentQty,
    nextQty,
    qty: amount,
    type,
    adjustmentDate: movementDate,
  };
};
export const fetchStockMovementsByProduct = async (productId, limit = 50) => {
  if (!productId) {
    throw new Error('Product ID is required.');
  }

  const { data, error } = await supabase
    .from('stock_movements')
    .select(`
      movement_id,
      product_id,
      movement_type,
      qty,
      loan_item_id,
      sale_item_id,
      stock_issue_item_id,
      notes,
      created_at,
      products (
        product_id,
        product_code,
        product_name
      )
    `)
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(normalizeStockMovementRow);
};
