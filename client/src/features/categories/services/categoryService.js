import api from '../../../lib/api';
import cacheService, { CACHE_TTL } from '../../../services/cacheService';

export const CATEGORIES_CACHE_KEY = 'categories_list';

export const getCachedCategories = () => cacheService.get(CATEGORIES_CACHE_KEY);

const normalizeCategoryRow = (row) => ({
  id: row.category_id,
  name: row.category_name,
  description: row.description ?? '',
  imageUrl: row.image_url ?? '',
  attributes: row.attributes ?? [],
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const fetchCategories = async (forceRefresh = false) => {
  if (!forceRefresh) {
    const cached = cacheService.get(CATEGORIES_CACHE_KEY);
    if (cached) return cached;
  }
  const response = await api.get('/categories');
  const data = (response.data.data ?? []).map(normalizeCategoryRow);
  cacheService.set(CATEGORIES_CACHE_KEY, data, CACHE_TTL.METADATA);
  return data;
};

export const addCategory = async (data) => {
  const formData = new FormData();
  formData.append('category_name', data.name.trim());
  if (data.description) formData.append('description', data.description.trim());
  
  let currentImageUrl = data.imageUrl ?? data.image ?? null;
  if (currentImageUrl) formData.append('image_url', currentImageUrl);
  if (data.imageFile) formData.append('imageFile', data.imageFile);
  if (data.attributes) formData.append('attributes', JSON.stringify(data.attributes));

  await api.post('/categories', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  cacheService.invalidate('categories');
  cacheService.invalidate('products');
  cacheService.invalidate('dashboard');
};

export const updateCategory = async (id, data) => {
  const formData = new FormData();
  formData.append('category_name', data.name.trim());
  if (data.description) formData.append('description', data.description.trim());
  
  let currentImageUrl = data.imageUrl ?? data.image ?? null;
  if (currentImageUrl) formData.append('image_url', currentImageUrl);
  if (data.imageFile) formData.append('imageFile', data.imageFile);
  if (data.attributes) formData.append('attributes', JSON.stringify(data.attributes));

  await api.put(`/categories/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  cacheService.invalidate('categories');
  cacheService.invalidate('products');
  cacheService.invalidate('dashboard');
};

export const deleteCategory = async (id) => {
  await api.delete(`/categories/${id}`);
  cacheService.invalidate('categories');
  cacheService.invalidate('products');
  cacheService.invalidate('dashboard');
};
