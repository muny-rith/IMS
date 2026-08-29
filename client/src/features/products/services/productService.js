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

const normalizeVariantRow = (row) => ({
  id: row.variant_id,
  variant_id: row.variant_id,
  sku: row.sku ?? '',
  unit_price: Number(row.unit_price ?? 0),
  openingQty: Number(row.on_hand_qty ?? 0),
  reservedQty: Number(row.reserved_qty ?? 0),
  imageUrl: row.image_url ?? '',
  imagePreview: row.image_url ?? '',
  isActive: row.is_active,
  attributes: row.attributes ?? {},
  attributeValues: row.attribute_values ?? [],
});

const normalizeProductDetail = (row) => ({
  ...normalizeProductRow(row),
  variants: (row.variants ?? []).map(normalizeVariantRow),
  productAttributes: row.product_attributes ?? row.productAttributes ?? [],
});

export const fetchProducts = async () => {
  const response = await api.get('/products');
  return (response.data.data ?? []).map(normalizeProductRow);
};

export const fetchProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return normalizeProductDetail(response.data.data);
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
    // File objects can't survive JSON.stringify — send each variant's image as
    // its own form field (matched by index) and strip it out of the JSON body.
    // A variant with no image simply gets no image_url and falls back to the
    // product-level photo on display.
    const variantsPayload = data.variants.map((variant, index) => {
      const { imageFile, imagePreview, ...rest } = variant;
      if (imageFile) {
        formData.append(`variantImage_${index}`, imageFile);
      }
      return rest;
    });
    formData.append('variants', JSON.stringify(variantsPayload));
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

  if (data.variants && data.variants.length > 0) {
    const variantsPayload = data.variants.map((variant, index) => {
      const { imageFile, imagePreview, attributeValues, imageUrl, ...rest } = variant;
      if (imageFile) {
        formData.append(`variantImage_${index}`, imageFile);
      }
      return {
        ...rest,
        image_url: imageUrl ?? rest.image_url ?? '',
      };
    });
    formData.append('variants', JSON.stringify(variantsPayload));
  } else if (data.variants && data.variants.length === 0) {
    formData.append('variants', JSON.stringify([]));
  }

  if (data.deletedVariantIds && data.deletedVariantIds.length > 0) {
    formData.append('deletedVariantIds', JSON.stringify(data.deletedVariantIds));
  }
  
  if (data.productAttributes !== undefined) {
    formData.append('productAttributes', JSON.stringify(data.productAttributes));
  }

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
