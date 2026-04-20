// src/features/loans/hooks/useLoans.js
import { useCallback, useEffect, useState } from 'react';
import {
  createLoan,
  fetchLoans,
  fetchProductsForLoan,
  fetchWorkersForLoan,
  returnLoanItem,
} from '../services/loanService';

export const useLoans = () => {
  const [rows, setRows] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const loadLoans = useCallback(async () => {
    const data = await fetchLoans();
    setRows(data);
    return data;
  }, []);

  const loadWorkers = useCallback(async () => {
    const data = await fetchWorkersForLoan();
    setWorkers(data);
    return data;
  }, []);

  const loadProducts = useCallback(async () => {
    const data = await fetchProductsForLoan();
    setProducts(data);
    return data;
  }, []);

  const loadInitialData = useCallback(async () => {
    const [loanRows, workerRows, productRows] = await Promise.all([
      fetchLoans(),
      fetchWorkersForLoan(),
      fetchProductsForLoan(),
    ]);

    setRows(loanRows);
    setWorkers(workerRows);
    setProducts(productRows);

    return {
      loanRows,
      workerRows,
      productRows,
    };
  }, []);

  useEffect(() => {
    let active = true;

    const init = async () => {
      try {
        setLoading(true);
        setError(null);

        const [loanRows, workerRows, productRows] = await Promise.all([
          fetchLoans(),
          fetchWorkersForLoan(),
          fetchProductsForLoan(),
        ]);

        if (!active) return;

        setRows(loanRows);
        setWorkers(workerRows);
        setProducts(productRows);
      } catch (err) {
        if (!active) return;
        setError(err.message || 'Failed to load loans.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      active = false;
    };
  }, []);

  const handleCreate = async (data) => {
    setSubmitting(true);
    setError(null);

    try {
      await createLoan(data);
      await Promise.all([loadLoans(), loadProducts()]);
      return { success: true };
    } catch (err) {
      const message = err.message || 'Failed to create loan.';
      setError(message);
      return { success: false, message };
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturn = async (data) => {
    setSubmitting(true);
    setError(null);

    try {
      await returnLoanItem(data);
      await Promise.all([loadLoans(), loadProducts()]);
      return { success: true };
    } catch (err) {
      const message = err.message || 'Failed to return loan item.';
      setError(message);
      return { success: false, message };
    } finally {
      setSubmitting(false);
    }
  };

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await loadInitialData();
      return { success: true };
    } catch (err) {
      const message = err.message || 'Failed to reload loans.';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [loadInitialData]);

  return {
    rows,
    workers,
    products,
    loading,
    submitting,
    error,
    handleCreate,
    handleReturn,
    reload,
    reloadLoans: loadLoans,
    reloadWorkers: loadWorkers,
    reloadProducts: loadProducts,
  };
};
