import supabase from '../../../lib/supabaseClient'

export const fetchProducts = async () => {
  const { data, error } = await supabase
    .from('tb_product')
    .select('*, tb_category(cate_name)')
    .order('pro_id', { ascending: false });

  if (error) throw new Error(error.message);

  return data.map((item) => ({
    id:         item.pro_id,
    code:       item.pro_code,
    name:       item.pro_name,
    category:   item.tb_category?.cate_name ?? '—',
    department: item.pro_department,
    price:      item.pro_price,
    qty:        item.pro_qty,
    image:      item.pro_image ?? null,
  }));
};

export const addProduct = async (data) => {
  const { error } = await supabase.from('tb_product').insert([
    {
      pro_code:       data.code,
      pro_name:       data.name,
      cate_id:        data.categoryId,
      pro_department: data.department,
      pro_price:      Number(data.price),
      pro_qty:        Number(data.qty),
    },
  ]);

  if (error) throw new Error(error.message);
};

export const updateProduct = async (id, data) => {
  const { error } = await supabase
    .from('tb_product')
    .update({
      pro_code:       data.code,
      pro_name:       data.name,
      cate_id:        data.categoryId,
      pro_department: data.department,
      pro_price:      Number(data.price),
      pro_qty:        Number(data.qty),
    })
    .eq('pro_id', id);

  if (error) throw new Error(error.message);
};

export const deleteProduct = async (id) => {
  const { error } = await supabase
    .from('tb_product')
    .delete()
    .eq('pro_id', id);

  if (error) throw new Error(error.message);
};

export const fetchCategories = async () => {
  const { data, error } = await supabase
    .from('tb_category')
    .select('cate_id, cate_name')
    .order('cate_name');

  if (error) throw new Error(error.message);
  return data;
};