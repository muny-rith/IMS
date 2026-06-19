import api from '../../../lib/api';

const normalizeStockBalanceRow = (row) => {
  const onHandQty = Number(row.on_hand_qty ?? 0);
  const reservedQty = Number(row.reserved_qty ?? 0);

  return {
    id: row.stock_balance_id,
    productId: row.product_id,
    productCode: row.product_code ?? '',
    productName: row.product_name ?? '',
    category: row.category_name ?? '—',
    onHandQty,
    reservedQty,
    availableQty: onHandQty - reservedQty,
    updatedAt: row.updated_at,
  };
};

const normalizeStockMovementRow = (row) => {
  return {
    id: row.movement_id,
    productId: row.product_id,
    productCode: row.product_code ?? '',
    productName: row.product_name ?? '',
    movementType: row.movement_type,
    qty: Number(row.qty ?? 0),
    notes: row.notes ?? '',
    loanItemId: row.loan_item_id,
    saleItemId: row.sale_item_id,
    stockIssueItemId: row.stock_issue_item_id,
    createdAt: row.created_at,
  };
};

export const fetchStockBalances = async () => {
  const response = await api.get('/stocks/balances');
  return (response.data.data ?? []).map(normalizeStockBalanceRow);
};

export const fetchStockMovements = async (limit = 30) => {
  const response = await api.get('/stocks/movements', { params: { limit } });
  return (response.data.data ?? []).map(normalizeStockMovementRow);
};

export const fetchStockMovementsByProduct = async (productId, limit = 50) => {
  if (!productId) {
    throw new Error('Product ID is required.');
  }
  const response = await api.get(`/stocks/movements/product/${productId}`, { params: { limit } });
  return (response.data.data ?? []).map(normalizeStockMovementRow);
};

export const applyAdjustment = async ({ productId, qty, type, adjustmentDate, notes }) => {
  const response = await api.post('/stocks/adjustment', {
    productId,
    qty,
    type,
    adjustmentDate,
    notes,
  });
  return response.data.data;
};
