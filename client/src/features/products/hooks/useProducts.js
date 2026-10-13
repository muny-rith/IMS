import { useCallback, useEffect, useState } from 'react';
import {
  fetchProducts,
  fetchProductById,
  fetchCategories,
  fetchBrands,
  addProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
  bulkUpdateProductStatus,
  getCachedProducts,
  getCachedCategories,
  getCachedBrands,
} from '../services/productService';

export const useProducts = () => {
  const cachedProducts = getCachedProducts();
  const cachedCategories = getCachedCategories();
  const cachedBrands = getCachedBrands();
  const hasCached = !!(cachedProducts && cachedCategories && cachedBrands);

  const [rows, setRows] = useState(() => cachedProducts || []);
  const [categories, setCategories] = useState(() => cachedCategories || []);
  const [brands, setBrands] = useState(() => cachedBrands || []);
  const [loading, setLoading] = useState(() => !hasCached);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const loadProducts = useCallback(async (force = false) => {
    const data = await fetchProducts(force);
    setRows(data);
    return data;
  }, []);

  const loadCategories = useCallback(async (force = false) => {
    const data = await fetchCategories(force);
    setCategories(data);
    return data;
  }, []);

  const loadProductDetail = useCallback(async (id, force = false) => {
    return fetchProductById(id, force);
  }, []);

  useEffect(() => {
    let active = true;

    const loadInitialData = async () => {
      try {
        if (!hasCached) {
          setLoading(true);
        }
        setError(null);

        const [productRows, categoryRows, brandRows] = await Promise.all([
          fetchProducts(),
          fetchCategories(),
          fetchBrands(),
        ]);

        if (!active) return;

        setRows(productRows);
        setCategories(categoryRows);
        setBrands(brandRows);
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
  }, [hasCached]);

  const handleAdd = async (data) => {
    setSubmitting(true);
    setError(null);

    try {
      await addProduct(data);
      await loadProducts(true);
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
      await loadProducts(true);
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

  const handleBulkDelete = async (ids) => {
    if (!ids || ids.length === 0) return { success: false, message: 'No items selected.' };
    setSubmitting(true);
    setError(null);

    try {
      const res = await bulkDeleteProducts(ids);
      const idSet = new Set(ids);
      setRows((prev) => prev.filter((row) => !idSet.has(row.id)));
      return { success: true, count: res?.data?.deletedCount ?? ids.length };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to delete selected products.';
      setError(message);
      return { success: false, message };
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkStatus = async (ids, isActive) => {
    if (!ids || ids.length === 0) return { success: false, message: 'No items selected.' };
    setSubmitting(true);
    setError(null);

    try {
      await bulkUpdateProductStatus(ids, isActive);
      const idSet = new Set(ids);
      setRows((prev) =>
        prev.map((row) => (idSet.has(row.id) ? { ...row, isActive } : row))
      );
      return { success: true, count: ids.length, isActive };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to update product status.';
      setError(message);
      return { success: false, message };
    } finally {
      setSubmitting(false);
    }
  };

  return {
    rows,
    categories,
    brands,
    loading,
    submitting,
    error,
    handleAdd,
    handleUpdate,
    handleDelete,
    handleBulkDelete,
    handleBulkStatus,
    reload: (force = true) => loadProducts(force),
    reloadCategories: (force = true) => loadCategories(force),
    fetchProductDetail: loadProductDetail,
  };
};

