import supabase from '../../../lib/supabaseClient';

const normalizeWorkerRow = (row) => ({
  id: row.worker_id,
  code: row.worker_code,
  name: row.worker_name,
  positionTitle: row.position_title ?? '',
  department: row.department ?? '',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const buildWorkerPayload = (data) => ({
  worker_code: data.code.trim(),
  worker_name: data.name.trim(),
  position_title: data.positionTitle?.trim() || null,
  department: data.department?.trim() || null,
});

export const fetchWorkers = async () => {
  const { data, error } = await supabase
    .from('workers')
    .select(`
      worker_id,
      worker_code,
      worker_name,
      position_title,
      department,
      created_at,
      updated_at
    `)
    .order('worker_id', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(normalizeWorkerRow);
};

export const addWorker = async (data) => {
  const { error } = await supabase
    .from('workers')
    .insert([buildWorkerPayload(data)]);

  if (error) {
    throw new Error(error.message);
  }
};

export const updateWorker = async (id, data) => {
  const { error } = await supabase
    .from('workers')
    .update({
      ...buildWorkerPayload(data),
      updated_at: new Date().toISOString(),
    })
    .eq('worker_id', id);

  if (error) {
    throw new Error(error.message);
  }
};

const ensureWorkerCanBeDeleted = async (id) => {
  const { count, error } = await supabase
    .from('loans')
    .select('loan_id', { count: 'exact', head: true })
    .eq('worker_id', id);

  if (error) {
    throw new Error(error.message);
  }

  if ((count ?? 0) > 0) {
    throw new Error('Cannot delete worker because loans are using this worker.');
  }
};

export const deleteWorker = async (id) => {
  await ensureWorkerCanBeDeleted(id);

  const { error } = await supabase
    .from('workers')
    .delete()
    .eq('worker_id', id);

  if (error) {
    throw new Error(error.message);
  }
};
