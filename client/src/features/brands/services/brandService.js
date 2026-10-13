import api from '../../../lib/api';
import cacheService, { CACHE_TTL } from '../../../services/cacheService';

export const BRANDS_CACHE_KEY = 'brands_list';

export const getCachedBrands = () => cacheService.get(BRANDS_CACHE_KEY);

const normalizeBrandRow = (row) => ({
  id: row.brand_id,
  name: row.brand_name,
  description: row.description ?? '',
  imageUrl: row.image_url ?? '',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const fetchBrands = async (forceRefresh = false) => {
  if (!forceRefresh) {
    const cached = cacheService.get(BRANDS_CACHE_KEY);
    if (cached) return cached;
  }
  const response = await api.get('/brands');
  const data = (response.data.data ?? []).map(normalizeBrandRow);
  cacheService.set(BRANDS_CACHE_KEY, data, CACHE_TTL.METADATA);
  return data;
};

export const addBrand = async (data) => {
  const formData = new FormData();
  formData.append('brand_name', data.name.trim());
  if (data.description) formData.append('description', data.description.trim());
  
  let currentImageUrl = data.imageUrl ?? data.image ?? null;
  if (currentImageUrl) formData.append('image_url', currentImageUrl);
  if (data.imageFile) formData.append('imageFile', data.imageFile);

  await api.post('/brands', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  cacheService.invalidate('brands');
  cacheService.invalidate('products');
  cacheService.invalidate('dashboard');
};

export const updateBrand = async (id, data) => {
  const formData = new FormData();
  formData.append('brand_name', data.name.trim());
  if (data.description) formData.append('description', data.description.trim());
  
  let currentImageUrl = data.imageUrl ?? data.image ?? null;
  if (currentImageUrl) formData.append('image_url', currentImageUrl);
  if (data.imageFile) formData.append('imageFile', data.imageFile);

  await api.put(`/brands/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  cacheService.invalidate('brands');
  cacheService.invalidate('products');
  cacheService.invalidate('dashboard');
};

export const deleteBrand = async (id) => {
  await api.delete(`/brands/${id}`);
  cacheService.invalidate('brands');
  cacheService.invalidate('products');
  cacheService.invalidate('dashboard');
};
