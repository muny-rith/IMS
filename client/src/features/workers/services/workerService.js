import api from '../../../lib/api';

const normalizeWorkerRow = (row) => ({
  id: row.worker_id,
  code: row.worker_code,
  name: row.worker_name,
  positionTitle: row.position_title ?? '',
  department: row.department ?? '',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const fetchWorkers = async () => {
  const response = await api.get('/workers');
  return (response.data.data ?? []).map(normalizeWorkerRow);
};

export const addWorker = async (data) => {
  await api.post('/workers', {
    code: data.code.trim(),
    name: data.name.trim(),
    positionTitle: data.positionTitle?.trim() || null,
    department: data.department?.trim() || null,
  });
};

export const updateWorker = async (id, data) => {
  await api.put(`/workers/${id}`, {
    code: data.code.trim(),
    name: data.name.trim(),
    positionTitle: data.positionTitle?.trim() || null,
    department: data.department?.trim() || null,
  });
};

export const deleteWorker = async (id) => {
  await api.delete(`/workers/${id}`);
};
