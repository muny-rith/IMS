import { useCallback, useEffect, useState } from 'react';

import {
  approvePurchaseRequest,
  cancelPurchaseRequest,
  createPurchaseRequest,
  fetchProductsForPurchaseRequest,
  fetchPurchaseRequests,
  rejectPurchaseRequest,
  updatePurchaseRequest,
} from '../services/purchaseRequestService';

const toResult = (callback) =>
  callback()
    .then((data) => ({
      success: true,
      data,
    }))
    .catch((error) => ({
      success: false,
      message: error.message,
    }));

const usePurchaseRequests = () => {
  const [rows, setRows] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [requestRows, productOptions] = await Promise.all([
        fetchPurchaseRequests(),
        fetchProductsForPurchaseRequest(),
      ]);

      setRows(requestRows);
      setProducts(productOptions);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const runMutation = async (callback) => {
    setSubmitting(true);

    const result = await toResult(async () => {
      const mutationResult = await callback();
      await load();
      return mutationResult;
    });

    setSubmitting(false);
    return result;
  };

  const handleCreate = (data) =>
    runMutation(() => createPurchaseRequest(data));

  const handleUpdate = (id, data) =>
    runMutation(() => updatePurchaseRequest(id, data));

  const handleApprove = (id, actor) =>
    runMutation(() => approvePurchaseRequest(id, actor));

  const handleReject = (id, actor) =>
    runMutation(() => rejectPurchaseRequest(id, actor));

  const handleCancel = (id, actor) =>
    runMutation(() => cancelPurchaseRequest(id, actor));

  return {
    rows,
    products,
    loading,
    submitting,
    error,
    refetch: load,
    handleCreate,
    handleUpdate,
    handleApprove,
    handleReject,
    handleCancel,
  };
};

export default usePurchaseRequests;
