import { useCallback, useEffect, useState } from 'react';
import {
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from '../services/categoryService';

export const useCategories = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const loadCategories = useCallback(async () => {
    const data = await fetchCategories();
    setRows(data);
    return data;
  }, []);

  useEffect(() => {
    let active = true;

    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchCategories();

        if (!active) return;
        setRows(data);
      } catch (err) {
        if (!active) return;
        setError(err.message || 'Failed to load categories.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      active = false;
    };
  }, []);

  const handleAdd = async (data) => {
    setSubmitting(true);
    setError(null);

    try {
      await addCategory(data);
      await loadCategories();
      return { success: true };
    } catch (err) {
      const message = err.message || 'Failed to add category.';
      setError(message);
      return { success: false, message };
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (id, data) => {
    setSubmitting(true);
    setError(null);

    try {
      await updateCategory(id, data);
      await loadCategories();
      return { success: true };
    } catch (err) {
      const message = err.message || 'Failed to update category.';
      setError(message);
      return { success: false, message };
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setSubmitting(true);
    setError(null);

    try {
      await deleteCategory(id);
      setRows((prev) => prev.filter((row) => row.id !== id));
      return { success: true };
    } catch (err) {
      const message = err.message || 'Failed to delete category.';
      setError(message);
      return { success: false, message };
    } finally {
      setSubmitting(false);
    }
  };

  return {
    rows,
    loading,
    submitting,
    error,
    handleAdd,
    handleUpdate,
    handleDelete,
    reload: loadCategories,
  };
};
