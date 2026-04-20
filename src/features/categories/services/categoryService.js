import supabase from '../../../lib/supabaseClient';

const normalizeCategoryRow = (row) => ({
  id: row.category_id,
  name: row.category_name,
  description: row.description ?? '',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const buildCategoryPayload = (data) => ({
  category_name: data.name.trim(),
  description: data.description?.trim() || null,
});

export const fetchCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select(`
      category_id,
      category_name,
      description,
      created_at,
      updated_at
    `)
    .order('category_name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(normalizeCategoryRow);
};

export const addCategory = async (data) => {
  const { error } = await supabase
    .from('categories')
    .insert([buildCategoryPayload(data)]);

  if (error) {
    throw new Error(error.message);
  }
};

export const updateCategory = async (id, data) => {
  const { error } = await supabase
    .from('categories')
    .update({
      ...buildCategoryPayload(data),
      updated_at: new Date().toISOString(),
    })
    .eq('category_id', id);

  if (error) {
    throw new Error(error.message);
  }
};

const ensureCategoryCanBeDeleted = async (id) => {
  const { count, error } = await supabase
    .from('products')
    .select('product_id', { count: 'exact', head: true })
    .eq('category_id', id);

  if (error) {
    throw new Error(error.message);
  }

  if ((count ?? 0) > 0) {
    throw new Error('Cannot delete category because products are using it.');
  }
};

export const deleteCategory = async (id) => {
  await ensureCategoryCanBeDeleted(id);

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('category_id', id);

  if (error) {
    throw new Error(error.message);
  }
};
