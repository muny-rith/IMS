import api from '../../../lib/api';

export const fetchStockIssues = async () => {
  const response = await api.get('/stock-issues');
  return response.data.data;
};

export const fetchStockIssueById = async (id) => {
  const response = await api.get(`/stock-issues/${id}`);
  return response.data.data;
};

export const createStockIssue = async (data) => {
  const response = await api.post('/stock-issues', data);
  return response.data.data;
};
