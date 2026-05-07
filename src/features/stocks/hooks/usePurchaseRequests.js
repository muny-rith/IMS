import { useCallback, useEffect, useState } from 'react';

import {
  createPurchaseRequest,
  fetchProductsForPurchaseRequest,
  fetchPurchaseRequests,
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

  const handleCreate = async (data) => {
    setSubmitting(true);

    const result = await toResult(async () => {
      const requestId = await createPurchaseRequest(data);
      await load();
      return requestId;
    });

    setSubmitting(false);
    return result;
  };

  return {
    rows,
    products,
    loading,
    submitting,
    error,
    refetch: load,
    handleCreate,
  };
};

export default usePurchaseRequests;
