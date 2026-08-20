import { useState, useEffect, useCallback } from 'react';
import * as purchaseRequestService from '../services/purchaseRequestService';

export const usePurchaseRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await purchaseRequestService.fetchPurchaseRequests();
      setRequests(data);
    } catch (err) {
      console.error('Failed to load purchase requests', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleCreate = async (data) => {
    try {
      await purchaseRequestService.createPurchaseRequest(data);
      await loadRequests();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await purchaseRequestService.updatePurchaseRequestStatus(id, status);
      await loadRequests();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  const handleReceive = async (id, receivedItems) => {
    try {
      await purchaseRequestService.receivePurchaseRequest(id, receivedItems);
      await loadRequests();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  return {
    requests,
    loading,
    handleCreate,
    handleUpdateStatus,
    handleReceive,
    refresh: loadRequests,
  };
};
