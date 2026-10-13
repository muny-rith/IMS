import { useCallback, useEffect, useState } from "react";
import { fetchDashboardData, getCachedDashboardData } from "../services/dashboardService";

const INITIAL_STATE = {
  hero: null,
  stats: [],
  alerts: [],
  quickActions: [],
  chartData: [],
};

export const useDashboard = () => {
  const cached = getCachedDashboardData();
  const [data, setData] = useState(() => cached || INITIAL_STATE);
  const [loading, setLoading] = useState(() => !cached);
  const [error, setError] = useState(null);

  const loadDashboard = useCallback(async (force = false) => {
    const nextState = await fetchDashboardData(force);
    setData(nextState);
    return nextState;
  }, []);

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      try {
        if (!cached) {
          setLoading(true);
        }
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
  }, [cached]);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await loadDashboard(true);
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
