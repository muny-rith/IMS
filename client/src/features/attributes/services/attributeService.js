import api from '../../../lib/api';

export const fetchAttributes = async () => {
  const response = await api.get('/attributes');
  return response.data.data;
};

export const fetchAttributeById = async (id) => {
  const response = await api.get(`/attributes/${id}`);
  return response.data.data;
};

export const createAttribute = async (data) => {
  const response = await api.post('/attributes', data);
  return response.data.data;
};

export const updateAttribute = async (id, data) => {
  const response = await api.put(`/attributes/${id}`, data);
  return response.data.data;
};

export const deleteAttribute = async (id) => {
  const response = await api.delete(`/attributes/${id}`);
  return response.data;
};

// Attribute Values
export const fetchAttributeValues = async (attributeId) => {
  const response = await api.get(`/attributes/${attributeId}/values`);
  return response.data.data;
};

export const createAttributeValue = async (attributeId, data) => {
  const response = await api.post(`/attributes/${attributeId}/values`, data);
  return response.data.data;
};

export const deleteAttributeValue = async (valueId) => {
  const response = await api.delete(`/attributes/values/${valueId}`);
  return response.data;
};
