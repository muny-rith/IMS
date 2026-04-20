// src/features/products/services/productService.js
import supabase from '../../../lib/supabaseClient';

const asObject = (value) => (Array.isArray(value) ? value[0] : value);

const normalizeProductRow = (row) => {
  const category = asObject(row.categories);
  const stockBalance = asObject(row.stock_balances);

  const onHandQty = Number(stockBalance?.on_hand_qty ?? 0);
  const reservedQty = Number(stockBalance?.reserved_qty ?? 0);

  return {
    id: row.product_id,
    code: row.product_code,
    name: row.product_name,
    categoryId: row.category_id,
    category: category?.category_name ?? '—',
    department: row.department ?? '',
    price: Number(row.unit_price ?? 0),
    qty: onHandQty,
    reservedQty,
    availableQty: onHandQty - reservedQty,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const buildProductPayload = (data) => ({
  product_code: data.code.trim(),
  product_name: data.name.trim(),
  category_id: Number(data.categoryId),
  department: data.department?.trim() || null,
  unit_price: Number(data.price ?? 0),
});

export const fetchProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      product_id,
      product_code,
      product_name,
      category_id,
      department,
      unit_price,
      is_active,
      created_at,
      updated_at,
      categories (
        category_id,
        category_name
      ),
      stock_balances (
        on_hand_qty,
        reserved_qty
      )
    `)
    .order('product_id', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(normalizeProductRow);
};

export const fetchCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('category_id, category_name')
    .order('category_name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((item) => ({
    id: item.category_id,
    name: item.category_name,
  }));
};

export const addProduct = async (data) => {
  const openingQty = Number(data.openingQty ?? 0);

  const { data: productRow, error: productError } = await supabase
    .from('products')
    .insert([buildProductPayload(data)])
    .select('product_id')
    .single();

  if (productError) {
    throw new Error(productError.message);
  }

  const productId = productRow.product_id;

  const { error: balanceError } = await supabase
    .from('stock_balances')
    .insert([
      {
        product_id: productId,
        on_hand_qty: openingQty,
        reserved_qty: 0,
      },
    ]);

  if (balanceError) {
    throw new Error(balanceError.message);
  }

  if (openingQty > 0) {
    const { error: movementError } = await supabase
      .from('stock_movements')
      .insert([
        {
          product_id: productId,
          movement_type: 'OPENING',
          qty: openingQty,
          notes: data.openingNote?.trim() || 'Opening stock',
          loan_item_id: null,
          sale_item_id: null,
          stock_issue_item_id: null,
        },
      ]);

    if (movementError) {
      throw new Error(movementError.message);
    }
  }

  return productId;
};

export const updateProduct = async (id, data) => {
  const { error } = await supabase
    .from('products')
    .update({
      ...buildProductPayload(data),
      updated_at: new Date().toISOString(),
    })
    .eq('product_id', id);

  if (error) {
    throw new Error(error.message);
  }
};

// Professional default: archive instead of hard delete
export const deleteProduct = async (id) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('product_id', id);

  if (error) {
    throw new Error(error.message);
  }
};
