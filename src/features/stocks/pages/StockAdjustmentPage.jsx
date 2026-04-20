import React, { useMemo, useState } from 'react';
import './stockAdjustment.css';

import { Alert, CircularProgress, Snackbar, Chip } from '@mui/material';

import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import RemoveShoppingCartOutlinedIcon from '@mui/icons-material/RemoveShoppingCartOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import Button from '../../../components/ui/Button/Button';
import Input from '../../../components/ui/Input/Input';
import StockAdjustmentModal from '../components/StockAdjustmentModal';
import StockBalanceTable from '../components/StockBalanceTable';
import StockHistoryDrawer from '../components/StockHistoryDrawer';
import { useStock } from '../hooks/useStock';
import { fetchStockMovementsByProduct } from '../services/stockService';

const LOW_STOCK_THRESHOLD = 5;

const INITIAL_TOAST = {
  open: false,
  message: '',
  severity: 'success',
};

const EMPTY_MODAL_STATE = {
  open: false,
  balance: null,
};

const EMPTY_HISTORY_STATE = {
  open: false,
  product: null,
  movements: [],
  loading: false,
  error: null,
};

const FILTERS = ['ALL', 'LOW_STOCK', 'OUT_OF_STOCK'];

const SummaryCard = ({ icon, title, value, tone = 'default' }) => (
  <div className={`stock-summary-card stock-summary-card--${tone}`}>
    <div className="stock-summary-card__icon">{icon}</div>
    <div className="stock-summary-card__content">
      <div className="stock-summary-card__title">{title}</div>
      <div className="stock-summary-card__value">{value}</div>
    </div>
  </div>
);

const EmptyState = ({ title, description }) => (
  <div className="stock-empty-state">
    <div className="stock-empty-state__title">{title}</div>
    <div className="stock-empty-state__description">{description}</div>
  </div>
);

const StockAdjustmentPage = () => {
  const { balances, loading, submitting, error, handleAdjust, reload } = useStock();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [modal, setModal] = useState(EMPTY_MODAL_STATE);
  const [historyDrawer, setHistoryDrawer] = useState(EMPTY_HISTORY_STATE);
  const [toast, setToast] = useState(INITIAL_TOAST);

  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };

  const closeModal = () => {
    setModal(EMPTY_MODAL_STATE);
  };

  const closeHistoryDrawer = () => {
    setHistoryDrawer(EMPTY_HISTORY_STATE);
  };

  const summary = useMemo(() => {
    const totalSkus = balances.length;
    const lowStock = balances.filter((item) => {
      const onHand = Number(item.onHandQty ?? 0);
      return onHand > 0 && onHand <= LOW_STOCK_THRESHOLD;
    }).length;
    const outOfStock = balances.filter(
      (item) => Number(item.onHandQty ?? 0) <= 0
    ).length;
    const reserved = balances.filter(
      (item) => Number(item.reservedQty ?? 0) > 0
    ).length;

    return {
      totalSkus,
      lowStock,
      outOfStock,
      reserved,
    };
  }, [balances]);

  const filteredBalances = useMemo(() => {
    const q = search.toLowerCase().trim();

    return balances.filter((row) => {
      const matchesSearch =
        !q ||
        [row.productCode, row.productName, row.category]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (filter === 'LOW_STOCK') {
        const onHand = Number(row.onHandQty ?? 0);
        return onHand > 0 && onHand <= LOW_STOCK_THRESHOLD;
      }

      if (filter === 'OUT_OF_STOCK') {
        return Number(row.onHandQty ?? 0) <= 0;
      }

      return true;
    });
  }, [balances, filter, search]);

  const loadHistory = async (product) => {
    setHistoryDrawer({
      open: true,
      product,
      movements: [],
      loading: true,
      error: null,
    });

    try {
      const movements = await fetchStockMovementsByProduct(product.productId);

      setHistoryDrawer({
        open: true,
        product,
        movements,
        loading: false,
        error: null,
      });
    } catch (err) {
      setHistoryDrawer({
        open: true,
        product,
        movements: [],
        loading: false,
        error: err.message || 'Failed to load product history.',
      });
    }
  };

  const handleRefresh = async () => {
    const result = await reload();

    if (!result.success) {
      showToast(result.message || 'Failed to refresh stock data.', 'error');
      return;
    }

    if (historyDrawer.open && historyDrawer.product) {
      await loadHistory(historyDrawer.product);
    }

    showToast('Stock data refreshed.');
  };

  const handleAdjustSubmit = async (data) => {
    const result = await handleAdjust(data);

    if (!result.success) {
      showToast(result.message || 'Failed to adjust stock.', 'error');
      return;
    }

    closeModal();
    showToast('Stock adjusted successfully.');

    if (
      historyDrawer.open &&
      historyDrawer.product &&
      historyDrawer.product.productId === data.productId
    ) {
      await loadHistory(historyDrawer.product);
    }
  };

  return (
    <div className="stock-page">
      <div className="stock-page__header">
        <div className="stock-page__header-content">
          <h4 className="stock-page__title">Stock Control</h4>
          <p className="stock-page__subtitle">
            Review current balances, spot stock issues quickly, and inspect
            movement history by product.
          </p>
        </div>

        <div className="stock-page__header-actions">
          <Button value="Refresh" onClick={handleRefresh} />
          <Input
            leftIcon={<i className="fa-solid fa-magnifying-glass" />}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by code, product, category..."
          />
        </div>
      </div>

      <div className="stock-summary-grid">
        <SummaryCard
          icon={<Inventory2OutlinedIcon fontSize="small" />}
          title="Total SKUs"
          value={summary.totalSkus}
        />
        <SummaryCard
          icon={<WarningAmberOutlinedIcon fontSize="small" />}
          title="Low Stock"
          value={summary.lowStock}
          tone="warning"
        />
        <SummaryCard
          icon={<RemoveShoppingCartOutlinedIcon fontSize="small" />}
          title="Out of Stock"
          value={summary.outOfStock}
          tone="danger"
        />
        <SummaryCard
          icon={<LockOutlinedIcon fontSize="small" />}
          title="With Reserved Qty"
          value={summary.reserved}
          tone="info"
        />
      </div>

      {error && (
        <Alert severity="error" className="stock-page__alert">
          {error}
        </Alert>
      )}

      <div className="stock-panel">
        <div className="stock-panel__header">
          <div>
            <h6 className="stock-panel__title">Current Stock Balances</h6>
            <p className="stock-panel__subtitle">
              Track availability, identify low stock, and open adjustment or
              history actions per product.
            </p>
          </div>

          <div className="stock-panel__filters">
            {FILTERS.map((item) => (
              <Chip
                key={item}
                label={
                  item === 'ALL'
                    ? 'All'
                    : item === 'LOW_STOCK'
                    ? 'Low Stock'
                    : 'Out of Stock'
                }
                clickable
                color={filter === item ? 'primary' : 'default'}
                variant={filter === item ? 'filled' : 'outlined'}
                onClick={() => setFilter(item)}
              />
            ))}
          </div>
        </div>

        {loading ? (
          <div className="stock-page__loading">
            <CircularProgress size={30} />
          </div>
        ) : balances.length === 0 ? (
          <EmptyState
            title="No stock balances yet"
            description="Create products with opening stock or use stock adjustment to begin tracking inventory."
          />
        ) : filteredBalances.length === 0 ? (
          <EmptyState
            title="No matching products"
            description="Try a different search or switch filters to view more stock items."
          />
        ) : (
          <StockBalanceTable
            rows={filteredBalances}
            onAdjust={(row) =>
              setModal({
                open: true,
                balance: row,
              })
            }
            onViewHistory={loadHistory}
          />
        )}
      </div>

      <StockAdjustmentModal
        open={modal.open}
        onClose={closeModal}
        onSubmit={handleAdjustSubmit}
        submitting={submitting}
        selectedBalance={modal.balance}
      />

      <StockHistoryDrawer
        open={historyDrawer.open}
        onClose={closeHistoryDrawer}
        product={historyDrawer.product}
        movements={historyDrawer.movements}
        loading={historyDrawer.loading}
        error={historyDrawer.error}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast(INITIAL_TOAST)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast(INITIAL_TOAST)}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default StockAdjustmentPage;
