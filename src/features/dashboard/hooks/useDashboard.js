import { useCallback, useEffect, useState } from "react";
import { fetchDashboardData } from "../services/dashboardService";

const INITIAL_STATE = {
  hero: null,
  stats: [],
  alerts: [],
  quickActions: [],
  chartData: [],
};

export const useDashboard = () => {
  const [data, setData] = useState(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = useCallback(async () => {
    const nextState = await fetchDashboardData();
    setData(nextState);
    return nextState;
  }, []);

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      try {
        setLoading(true);
        setError(null);

        const nextState = await fetchDashboardData();

        if (!active) {
          return;
        }

        setData(nextState);
      } catch (err) {
        if (!active) {
          return;
        }

        setError(err.message || "Failed to load dashboard.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    initialize();

    return () => {
      active = false;
    };
  }, []);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await loadDashboard();
      return { success: true };
    } catch (err) {
      const message = err.message || "Failed to reload dashboard.";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [loadDashboard]);

  return {
    ...data,
    loading,
    error,
    reload,
  };
};
