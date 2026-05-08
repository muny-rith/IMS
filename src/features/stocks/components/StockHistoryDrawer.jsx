import React from 'react';
import {
  Alert,
  CircularProgress,
  Drawer,
  IconButton,
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import './StockHistoryDrawer.css';

const formatDateTime = (value) => {
  if (!value) return '—';

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

const formatDate = (value) => {
  if (!value) return '—';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
};

const getMovementLabel = (type) => {
  switch (type) {
    case 'ADJUSTMENT_IN':
      return 'Adjust In';
    case 'ADJUSTMENT_OUT':
      return 'Adjust Out';
    case 'LOAN_OUT':
      return 'Loan Out';
    case 'LOAN_RETURN':
      return 'Loan Return';
    case 'OPENING':
      return 'Opening';
    default:
      return type || 'Unknown';
  }
};

const getMovementClass = (type) =>
  `stock-history-type stock-history-type--${String(type || 'default')
    .toLowerCase()
    .replaceAll('_', '-')}`;

const StockHistoryDrawer = ({
  open,
  onClose,
  product,
  movements = [],
  loading = false,
  error = null,
}) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          className: 'stock-history-drawer',
        },
      }}
    >
      <div className="stock-history">
        <header className="stock-history__header">
          <div>
            <p className="stock-history__eyebrow">Movement audit</p>
            <h3 className="stock-history__title">Product History</h3>
            <p className="stock-history__subtitle">
              Review every stock change recorded for this product.
            </p>
          </div>

          <IconButton className="stock-history__close" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </header>

        {product && (
          <>
            <section className="stock-history-product">
              <div className="stock-history-product__avatar">
                {product.productName?.[0]?.toUpperCase() ?? '?'}
              </div>

              <div className="stock-history-product__main">
                <strong>{product.productName || 'Unknown product'}</strong>
                <span>Code: {product.productCode || '—'}</span>
              </div>
            </section>

            <section className="stock-history-summary">
              <div className="stock-history-summary__item">
                <span>Category</span>
                <strong>{product.category ?? '—'}</strong>
              </div>

              <div className="stock-history-summary__item">
                <span>On Hand</span>
                <strong>{product.onHandQty ?? 0}</strong>
              </div>

              <div className="stock-history-summary__item">
                <span>Reserved</span>
                <strong>{product.reservedQty ?? 0}</strong>
              </div>

              <div className="stock-history-summary__item">
                <span>Available</span>
                <strong>{product.availableQty ?? 0}</strong>
              </div>

              <div className="stock-history-summary__item stock-history-summary__item--wide">
                <span>Updated At</span>
                <strong>{formatDateTime(product.updatedAt)}</strong>
              </div>
            </section>
          </>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        <section className="stock-history-table-panel">
          <div className="stock-history-table-panel__header">
            <div>
              <p className="stock-history__eyebrow">Movements</p>
              <h4>Stock movement records</h4>
            </div>
            <span>{movements.length} records</span>
          </div>

          {loading ? (
            <div className="stock-history-loading">
              <CircularProgress size={28} />
            </div>
          ) : movements.length === 0 ? (
            <div className="stock-history-empty">
              <strong>No stock movements found</strong>
              <p>
                Adjustments, loan actions, and returns for this product will
                appear here.
              </p>
            </div>
          ) : (
            <div className="stock-history-compact-table-wrap">
              <table className="stock-history-compact-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Qty</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((item) => (
                    <tr key={item.id}>
                      <td>{formatDate(item.createdAt)}</td>
                      <td>
                        <span className={getMovementClass(item.movementType)}>
                          {getMovementLabel(item.movementType)}
                        </span>
                      </td>
                      <td>{item.qty}</td>
                      <td>{item.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </Drawer>
  );
};

export default StockHistoryDrawer;
