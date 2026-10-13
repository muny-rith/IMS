import { useCallback, useEffect, useState } from 'react';
import {
  fetchBrands,
  addBrand,
  updateBrand,
  deleteBrand,
  getCachedBrands,
} from '../services/brandService';

export const useBrands = () => {
  const cached = getCachedBrands();
  const [rows, setRows] = useState(() => cached || []);
  const [loading, setLoading] = useState(() => !cached);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const loadBrands = useCallback(async (force = false) => {
    const data = await fetchBrands(force);
    setRows(data);
    return data;
  }, []);

  useEffect(() => {
    let active = true;

    const loadInitialData = async () => {
      try {
        if (!cached) {
          setLoading(true);
        }
        setError(null);

        const data = await fetchBrands();

        if (!active) return;
        setRows(data);
      } catch (err) {
        if (!active) return;
        setError(err.message || 'Failed to load brands.');
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
  }, [cached]);

  const handleAdd = async (data) => {
    setSubmitting(true);
    setError(null);

    try {
      await addBrand(data);
      await loadBrands(true);
      return { success: true };
    } catch (err) {
      const message = err.message || 'Failed to add brand.';
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
      await updateBrand(id, data);
      await loadBrands(true);
      return { success: true };
    } catch (err) {
      const message = err.message || 'Failed to update brand.';
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
      await deleteBrand(id);
      setRows((prev) => prev.filter((row) => row.id !== id));
      return { success: true };
    } catch (err) {
      const message = err.message || 'Failed to delete brand.';
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
    reload: (force = true) => loadBrands(force),
  };
};
