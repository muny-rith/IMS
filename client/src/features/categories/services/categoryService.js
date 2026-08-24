import api from '../../../lib/api';

const normalizeCategoryRow = (row) => ({
  id: row.category_id,
  name: row.category_name,
  description: row.description ?? '',
  imageUrl: row.image_url ?? '',
  attributes: row.attributes ?? [],
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const fetchCategories = async () => {
  const response = await api.get('/categories');
  return (response.data.data ?? []).map(normalizeCategoryRow);
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
};

export const deleteCategory = async (id) => {
  await api.delete(`/categories/${id}`);
};
