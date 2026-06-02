import { useCallback, useEffect, useState } from 'react';

import {
  fetchReportRows,
  fetchReportSummary,
} from '../services/reportService';

export const useReports = ({
  reportId = 'stock',
  dateRange = 'Last 30 days',
  filters = {},
  reportMonth = '',
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
        fetchReportRows({ reportId, dateRange, filters, reportMonth }),
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
  }, [reportId, dateRange, filters, reportMonth]);

  useEffect(() => {
    let ignore = false;

    const run = async () => {
      setLoading(true);
      setError('');

      try {
        const [nextRows, nextSummaryMetrics] = await Promise.all([
          fetchReportRows({ reportId, dateRange, filters, reportMonth }),
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
  }, [reportId, dateRange, filters, reportMonth]);

  return {
    rows,
    summaryMetrics,
    loading,
    error,
    refetch: loadReports,
  };
};

export default useReports;
