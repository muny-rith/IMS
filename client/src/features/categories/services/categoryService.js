import api from '../../../lib/api';

const normalizeCategoryRow = (row) => ({
  id: row.category_id,
  name: row.category_name,
  description: row.description ?? '',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const fetchCategories = async () => {
  const response = await api.get('/categories');
  return (response.data.data ?? []).map(normalizeCategoryRow);
};

export const addCategory = async (data) => {
  await api.post('/categories', {
    category_name: data.name.trim(),
    description: data.description?.trim() || null,
  });
};

export const updateCategory = async (id, data) => {
  await api.put(`/categories/${id}`, {
    category_name: data.name.trim(),
    description: data.description?.trim() || null,
  });
};

export const deleteCategory = async (id) => {
  await api.delete(`/categories/${id}`);
};
