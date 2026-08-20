import api from '../../../lib/api';

export const fetchPurchaseRequests = async () => {
  const response = await api.get('/purchase-requests');
  return response.data.data;
};

export const fetchPurchaseRequestById = async (id) => {
  const response = await api.get(`/purchase-requests/${id}`);
  return response.data.data;
};

export const createPurchaseRequest = async (data) => {
  const response = await api.post('/purchase-requests', data);
  return response.data.data;
};

export const updatePurchaseRequestStatus = async (id, status) => {
  const response = await api.patch(`/purchase-requests/${id}/status`, { status });
  return response.data.data;
};

export const receivePurchaseRequest = async (id, receivedItems) => {
  const response = await api.post(`/purchase-requests/${id}/receive`, { received_items: receivedItems });
  return response.data;
};
