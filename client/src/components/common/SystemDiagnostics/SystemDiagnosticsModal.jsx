import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';

import { fetchDiagnostics, clearServerCache } from '../../../services/diagnosticsService';
import './SystemDiagnosticsModal.css';

const SystemDiagnosticsModal = ({ open, onClose, isAdmin = false }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchDiagnostics();
      setData(res);
    } catch (err) {
      console.error('Failed to load diagnostics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, loadData]);

  const handleClearCache = async () => {
    try {
      setClearingCache(true);
      await clearServerCache();
      setActionMessage('Cache successfully cleared!');
      await loadData();
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      setActionMessage('Failed to clear cache.');
      setTimeout(() => setActionMessage(null), 3000);
    } finally {
      setClearingCache(false);
    }
  };

  const isHealthy = data?.status === 'healthy';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        className: 'diagnostics-dialog',
      }}
    >
      <DialogTitle className="diagnostics-header">
        <div className="diagnostics-header__left">
          <div className={`diagnostics-status-dot ${isHealthy ? 'diagnostics-status-dot--green' : 'diagnostics-status-dot--yellow'}`} />
          <div>
            <h2 className="diagnostics-title">System Diagnostics & Telemetry</h2>
            <p className="diagnostics-subtitle">
              Live server vitals, database latency, and cache hit-rates
            </p>
          </div>
        </div>
        <div className="diagnostics-header__actions">
          <Tooltip title="Refresh telemetry">
            <IconButton size="small" onClick={loadData} disabled={loading} className="diagnostics-icon-btn">
              <RefreshIcon sx={{ fontSize: 20 }} className={loading ? 'diagnostics-spin' : ''} />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={onClose} className="diagnostics-icon-btn">
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </div>
      </DialogTitle>

      <DialogContent className="diagnostics-content">
        {loading && !data ? (
          <div className="diagnostics-loading">
            <CircularProgress size={36} />
            <span>Collecting system vitals...</span>
          </div>
        ) : (
          <>
            {actionMessage && (
              <div className="diagnostics-banner">
                <CheckCircleOutlinedIcon sx={{ fontSize: 18 }} />
                <span>{actionMessage}</span>
              </div>
            )}

            {/* 1. Metric Cards Grid */}
            <div className="diagnostics-grid">
              {/* Database */}
              <div className="diagnostics-card">
                <div className="diagnostics-card__header">
                  <StorageOutlinedIcon sx={{ fontSize: 20, color: '#3b82f6' }} />
                  <span className="diagnostics-card__title">PostgreSQL Database</span>
                  <span className={`diagnostics-badge ${isHealthy ? 'diagnostics-badge--ok' : 'diagnostics-badge--warn'}`}>
                    {data?.database?.status || 'Unknown'}
                  </span>
                </div>
                <div className="diagnostics-card__metrics">
                  <div className="diagnostics-metric">
                    <span className="diagnostics-metric__label">Query Latency</span>
                    <span className="diagnostics-metric__value">{data?.database?.latencyMs ?? 0} ms</span>
                  </div>
                  <div className="diagnostics-metric">
                    <span className="diagnostics-metric__label">Pool (Total / Idle)</span>
                    <span className="diagnostics-metric__value">
                      {data?.database?.pool?.totalClients ?? 0} / {data?.database?.pool?.idleClients ?? 0}
                    </span>
                  </div>
                  <div className="diagnostics-metric">
                    <span className="diagnostics-metric__label">Catalog Products</span>
                    <span className="diagnostics-metric__value">{data?.database?.counts?.products ?? 0}</span>
                  </div>
                  <div className="diagnostics-metric">
                    <span className="diagnostics-metric__label">Active Variants</span>
                    <span className="diagnostics-metric__value">{data?.database?.counts?.variants ?? 0}</span>
                  </div>
                </div>
              </div>

              {/* Cache */}
              <div className="diagnostics-card">
                <div className="diagnostics-card__header">
                  <SpeedOutlinedIcon sx={{ fontSize: 20, color: '#10b981' }} />
                  <span className="diagnostics-card__title">In-Memory Cache (RAM)</span>
                  <span className="diagnostics-badge diagnostics-badge--ok">Active</span>
                </div>
                <div className="diagnostics-card__metrics">
                  <div className="diagnostics-metric">
                    <span className="diagnostics-metric__label">Hit Rate</span>
                    <span className="diagnostics-metric__value">{data?.cache?.hitRate ?? '0%'}</span>
                  </div>
                  <div className="diagnostics-metric">
                    <span className="diagnostics-metric__label">Cached Entities</span>
                    <span className="diagnostics-metric__value">{data?.cache?.cachedKeys ?? 0} keys</span>
                  </div>
                  <div className="diagnostics-metric">
                    <span className="diagnostics-metric__label">Hits / Misses</span>
                    <span className="diagnostics-metric__value">
                      {data?.cache?.hits ?? 0} / {data?.cache?.misses ?? 0}
                    </span>
                  </div>
                  <div className="diagnostics-metric">
                    <span className="diagnostics-metric__label">Rate Limited IPs</span>
                    <span className="diagnostics-metric__value">{data?.rateLimiting?.activeTrackedIps ?? 0}</span>
                  </div>
                </div>
              </div>

              {/* Server Vitals */}
              <div className="diagnostics-card">
                <div className="diagnostics-card__header">
                  <MemoryOutlinedIcon sx={{ fontSize: 20, color: '#8b5cf6' }} />
                  <span className="diagnostics-card__title">Node.js Process</span>
                  <span className="diagnostics-badge diagnostics-badge--ok">{data?.server?.nodeVersion}</span>
                </div>
                <div className="diagnostics-card__metrics">
                  <div className="diagnostics-metric">
                    <span className="diagnostics-metric__label">Process Uptime</span>
                    <span className="diagnostics-metric__value">{data?.server?.uptime ?? '—'}</span>
                  </div>
                  <div className="diagnostics-metric">
                    <span className="diagnostics-metric__label">Heap Memory Used</span>
                    <span className="diagnostics-metric__value">
                      {data?.server?.memory?.heapUsedMb ?? 0} MB / {data?.server?.memory?.heapTotalMb ?? 0} MB
                    </span>
                  </div>
                  <div className="diagnostics-metric">
                    <span className="diagnostics-metric__label">RSS Memory</span>
                    <span className="diagnostics-metric__value">{data?.server?.memory?.rssMb ?? 0} MB</span>
                  </div>
                  <div className="diagnostics-metric">
                    <span className="diagnostics-metric__label">Environment</span>
                    <span className="diagnostics-metric__value">{data?.server?.env ?? 'development'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Admin Actions */}
            {isAdmin && (
              <div className="diagnostics-footer">
                <div className="diagnostics-footer__info">
                  <WarningAmberOutlinedIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                  <span>Flushing cache will clear all RAM cached queries across server and client.</span>
                </div>
                <button
                  type="button"
                  className="diagnostics-flush-btn"
                  onClick={handleClearCache}
                  disabled={clearingCache}
                >
                  {clearingCache ? (
                    <CircularProgress size={16} sx={{ color: '#ffffff' }} />
                  ) : (
                    <DeleteSweepOutlinedIcon sx={{ fontSize: 18 }} />
                  )}
                  <span>Flush Cache</span>
                </button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SystemDiagnosticsModal;
