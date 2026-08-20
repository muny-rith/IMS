import { useState, useEffect, useCallback } from 'react';
import * as attributeService from '../services/attributeService';

export const useAttributes = () => {
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAttributes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await attributeService.fetchAttributes();
      setAttributes(data);
    } catch (err) {
      console.error('Failed to load attributes', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAttributes();
  }, [loadAttributes]);

  const handleAdd = async (data) => {
    try {
      await attributeService.createAttribute(data);
      await loadAttributes();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      await attributeService.updateAttribute(id, data);
      await loadAttributes();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  const handleDelete = async (id) => {
    try {
      await attributeService.deleteAttribute(id);
      await loadAttributes();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  return {
    attributes,
    loading,
    handleAdd,
    handleUpdate,
    handleDelete,
    refresh: loadAttributes,
  };
};

export const useAttributeValues = (attributeId) => {
  const [values, setValues] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadValues = useCallback(async () => {
    if (!attributeId) return;
    setLoading(true);
    try {
      const data = await attributeService.fetchAttributeValues(attributeId);
      setValues(data);
    } catch (err) {
      console.error('Failed to load attribute values', err);
    } finally {
      setLoading(false);
    }
  }, [attributeId]);

  useEffect(() => {
    loadValues();
  }, [loadValues]);

  const handleAddValue = async (value) => {
    try {
      await attributeService.createAttributeValue(attributeId, { value });
      await loadValues();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  const handleDeleteValue = async (valueId) => {
    try {
      await attributeService.deleteAttributeValue(valueId);
      await loadValues();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  return {
    values,
    loading,
    handleAddValue,
    handleDeleteValue,
    refresh: loadValues,
  };
};
