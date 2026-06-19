import api from '../../../lib/api';

const normalizePurchaseRequestItem = (item) => {
  return {
    id: item.purchase_request_item_id,
    productId: item.product_id,
    productCode: item.product_code ?? '',
    productName: item.product_name ?? '',
    customItemName: item.custom_item_name ?? '',
    requestedQty: Number(item.requested_qty ?? 0),
    receivedQty: Number(item.received_qty ?? 0),
    reason: item.reason ?? '',
    notes: item.notes ?? '',
  };
};

const normalizePurchaseRequestRow = (row) => {
  const items = (row.items ?? []).map(normalizePurchaseRequestItem);

  return {
    id: row.purchase_request_id,
    requestNo: row.request_no,
    requestedBy: row.requested_by,
    requestedDate: row.requested_date,
    purpose: row.purpose ?? '',
    status: row.request_status,
    approvedBy: row.approved_by,
    approvedAt: row.approved_at,
    rejectedBy: row.rejected_by,
    rejectedAt: row.rejected_at,
    receivedBy: row.received_by,
    receivedAt: row.received_at,
    notes: row.notes ?? '',
    totalItems: items.length,
    totalRequestedQty: items.reduce((sum, item) => sum + item.requestedQty, 0),
    totalReceivedQty: items.reduce((sum, item) => sum + item.receivedQty, 0),
    items,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const normalizeCreateItems = (items) => {
  const normalized = (items ?? [])
    .map((item) => {
      const productId = item.productId ? Number(item.productId) : null;
      const customItemName = item.customItemName?.trim() || '';

      return {
        productId,
        customItemName: productId ? '' : customItemName,
        requestedQty: Number(item.requestedQty ?? item.qty),
        reason: item.reason?.trim() || '',
        notes: item.notes?.trim() || '',
      };
    })
    .filter(
      (item) => item.requestedQty > 0 && (item.productId || item.customItemName)
    );

  if (!normalized.length) {
    throw new Error('At least one requested item is required.');
  }

  return normalized;
};

export const fetchPurchaseRequests = async () => {
  const response = await api.get('/stocks/purchase-requests');
  return (response.data.data ?? []).map(normalizePurchaseRequestRow);
};

export const fetchProductsForPurchaseRequest = async () => {
  const response = await api.get('/products');
  return (response.data.data ?? []).map((row) => ({
    id: row.product_id,
    code: row.product_code,
    name: row.product_name,
    label: `${row.product_code} - ${row.product_name}`,
  }));
};

export const createPurchaseRequest = async (data) => {
  const response = await api.post('/stocks/purchase-requests', {
    requestNo: data.requestNo,
    requestedBy: data.requestedBy,
    requestedDate: data.requestedDate,
    purpose: data.purpose,
    notes: data.notes,
    items: normalizeCreateItems(data.items),
  });
  return response.data.data.purchase_request_id;
};

export const updatePurchaseRequest = async (id, data) => {
  const response = await api.put(`/stocks/purchase-requests/${id}`, {
    requestedBy: data.requestedBy,
    requestedDate: data.requestedDate,
    purpose: data.purpose,
    notes: data.notes,
    items: normalizeCreateItems(data.items),
  });
  return response.data.data.purchase_request_id;
};

export const approvePurchaseRequest = async (id, actor) => {
  const response = await api.post(`/stocks/purchase-requests/${id}/approve`, { actor });
  return response.data.data.purchase_request_id;
};

export const rejectPurchaseRequest = async (id, actor) => {
  const response = await api.post(`/stocks/purchase-requests/${id}/reject`, { actor });
  return response.data.data.purchase_request_id;
};

export const cancelPurchaseRequest = async (id, actor) => {
  const response = await api.post(`/stocks/purchase-requests/${id}/cancel`, { actor });
  return response.data.data.purchase_request_id;
};
