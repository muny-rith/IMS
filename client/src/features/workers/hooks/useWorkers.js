import { useCallback, useEffect, useState } from 'react';
import {
  addWorker,
  deleteWorker,
  fetchWorkers,
  updateWorker,
} from '../services/workerService';

export const useWorkers = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const loadWorkers = useCallback(async () => {
    const data = await fetchWorkers();
    setRows(data);
    return data;
  }, []);

  useEffect(() => {
    let active = true;

    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchWorkers();

        if (!active) return;
        setRows(data);
      } catch (err) {
        if (!active) return;
        setError(err.message || 'Failed to load workers.');
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
      await addWorker(data);
      await loadWorkers();
      return { success: true };
    } catch (err) {
      const message = err.message || 'Failed to add worker.';
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
      await updateWorker(id, data);
      await loadWorkers();
      return { success: true };
    } catch (err) {
      const message = err.message || 'Failed to update worker.';
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
      await deleteWorker(id);
      setRows((prev) => prev.filter((row) => row.id !== id));
      return { success: true };
    } catch (err) {
      const message = err.message || 'Failed to delete worker.';
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
    reload: loadWorkers,
  };
};
