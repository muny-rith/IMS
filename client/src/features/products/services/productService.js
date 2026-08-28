import api from '../../../lib/api';
const normalizeProductRow = (row) => {
  const onHandQty = Number(row.on_hand_qty ?? 0);
  const reservedQty = Number(row.reserved_qty ?? 0);

  return {
    id: row.product_id,
    name: row.product_name,
    categoryId: row.category_id,
    brandId: row.brand_id,
    category: row.category_name ?? '—',
    brand: row.brand_name ?? '—',
    department: row.department ?? '',
    price: Number(row.unit_price ?? 0),
    qty: onHandQty,
    reservedQty,
    availableQty: onHandQty - reservedQty,
    image: row.image_url ?? '',
    imageUrl: row.image_url ?? '',
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const fetchProducts = async () => {
  const response = await api.get('/products');
  return (response.data.data ?? []).map(normalizeProductRow);
};

export const fetchCategories = async () => {
  const response = await api.get('/categories');
  return (response.data.data ?? []).map((item) => ({
    id: item.category_id,
    name: item.category_name,
    attributes: item.attributes || [],
  }));
};

export const fetchBrands = async () => {
  const response = await api.get('/brands');
  return (response.data.data ?? []).map((item) => ({
    id: item.brand_id,
    name: item.brand_name,
  }));
};

export const addProduct = async (data) => {
  const formData = new FormData();
  formData.append('name', data.name.trim());
  formData.append('categoryId', data.categoryId);
  
  if (data.brandId) formData.append('brandId', data.brandId);
  if (data.department) formData.append('department', data.department.trim());
  if (data.imageUrl) formData.append('imageUrl', data.imageUrl);
  if (data.imageFile) formData.append('imageFile', data.imageFile);
  
  if (data.variants && data.variants.length > 0) {
    formData.append('variants', JSON.stringify(data.variants));
  }
  if (data.productAttributes && data.productAttributes.length > 0) {
    formData.append('productAttributes', JSON.stringify(data.productAttributes));
  }

  const response = await api.post('/products', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data.product_id;
};

export const updateProduct = async (id, data) => {
  const formData = new FormData();
  formData.append('name', data.name.trim());
  formData.append('categoryId', data.categoryId);
  
  if (data.brandId !== undefined && data.brandId !== null) formData.append('brandId', data.brandId);
  if (data.department !== undefined && data.department !== null) formData.append('department', data.department.trim());
  if (data.price !== undefined) formData.append('price', data.price);
  if (data.isActive !== undefined) formData.append('isActive', data.isActive);
  
  let currentImageUrl = data.imageUrl ?? data.image ?? null;
  if (currentImageUrl) formData.append('imageUrl', currentImageUrl);
  if (data.imageFile) formData.append('imageFile', data.imageFile);

  const response = await api.put(`/products/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data.product_id;
};

export const deleteProduct = async (id) => {
  await api.delete(`/products/${id}`);
};



