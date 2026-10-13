import api from '../lib/api';
import cacheService from './cacheService';

export const fetchDiagnostics = async () => {
  const response = await api.get('/diagnostics');
  return response.data.data;
};

export const clearServerCache = async () => {
  const response = await api.post('/diagnostics/cache/clear');
  // Also clear client-side cache for full sync
  cacheService.clear();
  return response.data;
};
