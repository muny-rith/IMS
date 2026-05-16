import { useCallback, useEffect, useState } from 'react';

import {
  fetchReportRows,
  fetchReportSummary,
} from '../services/reportService';

export const useReports = ({
  reportId = 'stock',
  dateRange = 'Last 30 days',
  filters = {},
} = {}) => {
  const [rows, setRows] = useState([]);
  const [summaryMetrics, setSummaryMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [nextRows, nextSummaryMetrics] = await Promise.all([
        fetchReportRows({ reportId, dateRange, filters }),
        fetchReportSummary(),
      ]);

      setRows(nextRows);
      setSummaryMetrics(nextSummaryMetrics);
    } catch (err) {
      setError(err.message || 'Failed to load reports.');
      setRows([]);
      setSummaryMetrics([]);
    } finally {
      setLoading(false);
    }
  }, [reportId, dateRange, filters]);

  useEffect(() => {
    let ignore = false;

    const run = async () => {
      setLoading(true);
      setError('');

      try {
        const [nextRows, nextSummaryMetrics] = await Promise.all([
          fetchReportRows({ reportId, dateRange, filters }),
          fetchReportSummary(),
        ]);

        if (ignore) return;

        setRows(nextRows);
        setSummaryMetrics(nextSummaryMetrics);
      } catch (err) {
        if (ignore) return;

        setError(err.message || 'Failed to load reports.');
        setRows([]);
        setSummaryMetrics([]);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      ignore = true;
    };
  }, [reportId, dateRange, filters]);

  return {
    rows,
    summaryMetrics,
    loading,
    error,
    refetch: loadReports,
  };
};

export default useReports;
