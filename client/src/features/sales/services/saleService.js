import api from '../../../lib/api';

export const fetchSales = async () => {
  const response = await api.get('/sales');
  return response.data.data;
};

export const fetchSaleById = async (id) => {
  const response = await api.get(`/sales/${id}`);
  return response.data.data;
};

export const createSale = async (data) => {
  const response = await api.post('/sales', data);
  return response.data.data;
};
