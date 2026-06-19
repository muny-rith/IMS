import { useCallback, useEffect, useState } from 'react';
import {
  fetchProducts,
  fetchCategories,
  addProduct,
  updateProduct,
  deleteProduct,
} from '../services/productService';

export const useProducts = () => {
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const loadProducts = useCallback(async () => {
    const data = await fetchProducts();
    setRows(data);
    return data;
  }, []);

  const loadCategories = useCallback(async () => {
    const data = await fetchCategories();
    setCategories(data);
    return data;
  }, []);

  useEffect(() => {
    let active = true;

    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [productRows, categoryRows] = await Promise.all([
          fetchProducts(),
          fetchCategories(),
        ]);

        if (!active) return;

        setRows(productRows);
        setCategories(categoryRows);
      } catch (err) {
        if (!active) return;
        setError(err.message || 'Failed to load products.');
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
      await addProduct(data);
      await loadProducts();
      return { success: true };
    } catch (err) {
      const message = err.message || 'Failed to add product.';
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
      await updateProduct(id, data);
      await loadProducts();
      return { success: true };
    } catch (err) {
      const message = err.message || 'Failed to update product.';
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
      await deleteProduct(id);
      setRows((prev) => prev.filter((row) => row.id !== id));
      return { success: true };
    } catch (err) {
      const message = err.message || 'Failed to delete product.';
      setError(message);
      return { success: false, message };
    } finally {
      setSubmitting(false);
    }
  };

  return {
    rows,
    categories,
    loading,
    submitting,
    error,
    handleAdd,
    handleUpdate,
    handleDelete,
    reload: loadProducts,
    reloadCategories: loadCategories,
  };
};
