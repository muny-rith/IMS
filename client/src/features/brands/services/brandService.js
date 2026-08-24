import api from '../../../lib/api';

const normalizeBrandRow = (row) => ({
  id: row.brand_id,
  name: row.brand_name,
  description: row.description ?? '',
  imageUrl: row.image_url ?? '',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const fetchBrands = async () => {
  const response = await api.get('/brands');
  return (response.data.data ?? []).map(normalizeBrandRow);
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
};

export const deleteBrand = async (id) => {
  await api.delete(`/brands/${id}`);
};
