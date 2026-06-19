// src/features/stock/hooks/useStock.js
import { useCallback, useEffect, useState } from 'react';
import {
  applyAdjustment,
  fetchStockBalances,
  fetchStockMovements,
} from '../services/stockService';

export const useStock = () => {
  const [balances, setBalances] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const loadBalances = useCallback(async () => {
    const data = await fetchStockBalances();
    setBalances(data);
    return data;
  }, []);

  const loadMovements = useCallback(async () => {
    const data = await fetchStockMovements();
    setMovements(data);
    return data;
  }, []);

  const loadInitialData = useCallback(async () => {
    const [balanceRows, movementRows] = await Promise.all([
      fetchStockBalances(),
      fetchStockMovements(),
    ]);

    setBalances(balanceRows);
    setMovements(movementRows);

    return {
      balanceRows,
      movementRows,
    };
  }, []);

  useEffect(() => {
    let active = true;

    const init = async () => {
      try {
        setLoading(true);
        setError(null);

        const [balanceRows, movementRows] = await Promise.all([
          fetchStockBalances(),
          fetchStockMovements(),
        ]);

        if (!active) return;

        setBalances(balanceRows);
        setMovements(movementRows);
      } catch (err) {
        if (!active) return;
        setError(err.message || 'Failed to load stock data.');
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

  const handleAdjust = async (data) => {
    setSubmitting(true);
    setError(null);

    try {
      await applyAdjustment(data);
      await Promise.all([loadBalances(), loadMovements()]);
      return { success: true };
    } catch (err) {
      const message = err.message || 'Failed to adjust stock.';
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
      const message = err.message || 'Failed to reload stock data.';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [loadInitialData]);

  return {
    balances,
    movements,
    loading,
    submitting,
    error,
    handleAdjust,
    reload,
    reloadBalances: loadBalances,
    reloadMovements: loadMovements,
  };
};
