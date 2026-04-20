
import { useState, useEffect, useCallback } from 'react';
import {
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    fetchCategories,
} from '../services/productService';

export const useProducts = () => {
    const [rows, setRows] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const loadProducts = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetchProducts();
            setRows(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadCategories = useCallback(async () => {
        try {
            const data = await fetchCategories();
            setCategories(data);
        } catch (err) {
            console.error('Failed to load categories:', err.message);
        }
    }, []);

    useEffect(() => {
        loadProducts();
        loadCategories();
    }, [loadProducts, loadCategories]);

    const handleAdd = async (data) => {
        setSubmitting(true);
        try {
            await addProduct(data);
            await loadProducts();          // refresh table
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message };
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async (id, data) => {
        setSubmitting(true);
        try {
            await updateProduct(id, data);
            await loadProducts();
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message };
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteProduct(id);
            setRows((prev) => prev.filter((r) => r.id !== id));
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message };
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
    };
};