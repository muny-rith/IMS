import api from '../../../lib/api';

const normalizeProductRow = (row) => {
  const onHandQty = Number(row.on_hand_qty ?? 0);
  const reservedQty = Number(row.reserved_qty ?? 0);

  return {
    id: row.product_id,
    code: row.product_code,
    name: row.product_name,
    categoryId: row.category_id,
    category: row.category_name ?? '—',
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
  }));
};

export const addProduct = async (data) => {
  let imageUrl = data.imageUrl ?? null;

  if (data.imageFile) {
    imageUrl = await uploadProductImage({ file: data.imageFile });
  }

  const response = await api.post('/products', {
    code: data.code.trim(),
    name: data.name.trim(),
    categoryId: Number(data.categoryId),
    department: data.department?.trim() || null,
    price: Number(data.price ?? 0),
    imageUrl,
    openingQty: Number(data.openingQty ?? 0),
    openingNote: data.openingNote?.trim() || null,
  });

  return response.data.data.product_id;
};

export const updateProduct = async (id, data) => {
  let imageUrl = data.imageUrl ?? data.image ?? null;

  if (data.imageFile) {
    imageUrl = await uploadProductImage({ file: data.imageFile });
  }

  const response = await api.put(`/products/${id}`, {
    code: data.code.trim(),
    name: data.name.trim(),
    categoryId: Number(data.categoryId),
    department: data.department?.trim() || null,
    price: Number(data.price ?? 0),
    imageUrl,
    isActive: data.isActive,
  });

  return response.data.data.product_id;
};

export const deleteProduct = async (id) => {
  await api.delete(`/products/${id}`);
};

export const uploadProductImage = async ({ file }) => {
  if (!file) return null;

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('Product image must be 5MB or smaller.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
};
