import { useState, useEffect, useCallback } from 'react';
import * as stockIssueService from '../services/stockIssueService';

export const useStockIssues = () => {
  const [stockIssues, setStockIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadStockIssues = useCallback(async () => {
    setLoading(true);
    try {
      const data = await stockIssueService.fetchStockIssues();
      setStockIssues(data);
    } catch (err) {
      console.error('Failed to load stock issues', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStockIssues();
  }, [loadStockIssues]);

  const handleCreate = async (data) => {
    try {
      await stockIssueService.createStockIssue(data);
      await loadStockIssues();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  return {
    stockIssues,
    loading,
    handleCreate,
    refresh: loadStockIssues,
  };
};
