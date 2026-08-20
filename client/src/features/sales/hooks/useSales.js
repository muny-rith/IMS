import { useState, useEffect, useCallback } from 'react';
import * as saleService from '../services/saleService';

export const useSales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSales = useCallback(async () => {
    setLoading(true);
    try {
      const data = await saleService.fetchSales();
      setSales(data);
    } catch (err) {
      console.error('Failed to load sales', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const handleCreate = async (data) => {
    try {
      await saleService.createSale(data);
      await loadSales();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  return {
    sales,
    loading,
    handleCreate,
    refresh: loadSales,
  };
};
