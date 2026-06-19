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
import StockMobileCardList from '../components/StockMobileCardList'


import PurchaseRequestPanel from '../components/PurchaseRequestPanel';

import { useStock } from '../hooks/useStock';
import { fetchStockMovementsByProduct } from '../services/stockService';


const STOCK_TABS = [
  { id: 'balances', label: 'Stock Balances' },
  { id: 'requests', label: 'Purchase Requests' },
];



const LOW_STOCK_THRESHOLD = 10;

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

const getFilterLabel = (value) => {
  if (value === 'LOW_STOCK') return 'Low Stock';
  if (value === 'OUT_OF_STOCK') return 'Out of Stock';
  return 'All';
};

const SummaryCard = ({
  icon,
  title,
  value,
  helper,
  tone = 'default',
  compact = false,
}) => (
  <div
    className={`stock-summary-card stock-summary-card--${tone}${compact ? ' stock-summary-card--compact' : ''
      }`}
  >
    <div className="stock-summary-card__icon">{icon}</div>
    <div className="stock-summary-card__content">
      <div className="stock-summary-card__title">{title}</div>
      <div className="stock-summary-card__value">{value}</div>
      <div className="stock-summary-card__helper">{helper}</div>
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

  const [activeTab, setActiveTab] = useState('balances');
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
      <section className="stock-page__hero">
        <div>
          <p className="stock-page__eyebrow">Inventory</p>
          <h4 className="stock-page__title">Stock Control</h4>
          <p className="stock-page__subtitle">
            Review live balances, catch low-stock problems early, and inspect
            movement history without changing your existing stock components.
          </p>
        </div>

        <div className="stock-page__hero-card">
          <div className="stock-page__hero-summary-grid">
            <SummaryCard
              icon={<Inventory2OutlinedIcon fontSize="small" />}
              title="Total SKUs"
              value={summary.totalSkus}
              helper="Tracked inventory items"
              compact
            />
            <SummaryCard
              icon={<WarningAmberOutlinedIcon fontSize="small" />}
              title="Low Stock"
              value={summary.lowStock}
              helper={`On hand at ${LOW_STOCK_THRESHOLD} or below`}
              tone="warning"
              compact
            />
            <SummaryCard
              icon={<RemoveShoppingCartOutlinedIcon fontSize="small" />}
              title="Out of Stock"
              value={summary.outOfStock}
              helper="Needs replenishment"
              tone="danger"
              compact
            />
            <SummaryCard
              icon={<LockOutlinedIcon fontSize="small" />}
              title="Reserved Qty"
              value={summary.reserved}
              helper="Locked for orders"
              tone="info"
              compact
            />
          </div>
        </div>
      </section>

      {error && (
        <Alert severity="error" className="stock-page__alert">
          {error}
        </Alert>
      )}





      <section className="stock-panel">
        <div className="stock-tabs">
          {STOCK_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`stock-tab${activeTab === tab.id ? ' stock-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'balances' && (
          // balance
          <div>
            <section className="stock-toolbar">
              <div>
                <h6 className="stock-panel__title">Current Stock Balances</h6>
                <p className="stock-panel__subtitle">
                  Track availability, identify low stock, and open adjustment or
                  history actions per product.
                </p>
              </div>

              <div className="stock-toolbar__controls">
                <Button value="Refresh" onClick={handleRefresh} />
                <div className="stock-toolbar__search">
                  <Input
                    leftIcon={<i className="fa-solid fa-magnifying-glass" />}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by code, product, category..."
                  />
                </div>
              </div>
            </section>

            <div className="stock-panel__header">
              <div style={{ display: "flex", alignItems: 'center', gap: '9px' }}>
                <p className="stock-panel__eyebrow">Live balances</p>
                <div className="stock-panel__badge">
                  {filteredBalances.length} visible
                </div>
              </div>
              <div className="stock-panel__header-side">
                <div className="stock-panel__filters">
                  {FILTERS.map((item) => (
                    <Chip
                      key={item}
                      label={getFilterLabel(item)}
                      clickable
                      variant="outlined"
                      className={`stock-filter-chip${filter === item ? ' stock-filter-chip--active' : ''
                        }`}
                      onClick={() => setFilter(item)}
                    />
                  ))}
                </div>
              </div>

            </div>

            <div className="stock-panel__body">


              <>
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
                  <>
                    <div className="stock-desktop-table">
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
                    </div>

                    <div className="stock-mobile-cards">
                      <StockMobileCardList
                        rows={filteredBalances}
                        onAdjust={(row) =>
                          setModal({
                            open: true,
                            balance: row,
                          })
                        }
                        onViewHistory={loadHistory}
                      />
                    </div>


                  </>
                )}
              </>
            </div>

          </div>
        )}
          
        {activeTab === 'requests' && (
          // request
          <PurchaseRequestPanel />
        )}




      </section>

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
