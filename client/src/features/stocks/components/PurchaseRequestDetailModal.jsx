import React from 'react';

import {
  formatPurchaseRequestDate,
  getPurchaseRequestItemName,
  getPurchaseRequestStatusClassName,
} from './purchaseRequestViewUtils';
import './PurchaseRequestDetailModal.css';

const getAllowedActions = (status) => {
  switch (status) {
    case 'PENDING':
      return ['Print', 'Edit', 'Cancel', 'Reject', 'Approve'];
    case 'APPROVED':
    case 'REJECTED':
      return ['Print'];
    case 'CANCELLED':
    default:
      return [];
  }
};

const PurchaseRequestDetailModal = ({
  open,
  request = null,
  onClose,
  onAction,
}) => {
  if (!open || !request) return null;

  const items = request.items ?? [];
  const actions = getAllowedActions(request.status);

  return (
    <div className="purchase-request-detail-modal" role="dialog" aria-modal="true">
      <div className="purchase-request-detail-modal__backdrop" onClick={onClose} />

      <section className="purchase-request-detail-modal__paper">
        <header className="purchase-request-detail-modal__header">
          <div>
            <p className="purchase-request-eyebrow">Request detail</p>
            <h3>បណ្ណស្នើរទិញសម្ភារៈ</h3>
            <span>{request.requestNo}</span>
          </div>

          <button
            type="button"
            className="purchase-request-icon-button"
            onClick={onClose}
            aria-label="Close request detail"
          >
            x
          </button>
        </header>

        <div className="purchase-request-detail-status-row">
          <span className={getPurchaseRequestStatusClassName(request.status)}>
            {request.status}
          </span>
          <strong>{formatPurchaseRequestDate(request.requestedDate)}</strong>
        </div>

        <section className="purchase-request-detail-grid">
          <div className="purchase-request-detail-card">
            <span>Requested By</span>
            <strong>{request.requestedBy || '-'}</strong>
          </div>

          <div className="purchase-request-detail-card">
            <span>Total Items</span>
            <strong>{request.totalItems ?? items.length}</strong>
          </div>

          <div className="purchase-request-detail-card">
            <span>Total Requested Qty</span>
            <strong>{request.totalRequestedQty ?? '-'}</strong>
          </div>
        </section>

        <section className="purchase-request-detail-section">
          <p className="purchase-request-eyebrow">Purpose</p>
          <p className="purchase-request-detail-purpose">
            {request.purpose || 'No purpose provided.'}
          </p>
        </section>

        <section className="purchase-request-detail-section">
          <div className="purchase-request-detail-section__header">
            <div>
              <p className="purchase-request-eyebrow">Items</p>
              <h4>Requested materials</h4>
            </div>
            <span>{items.length} rows</span>
          </div>

          <div className="purchase-request-detail-table-wrap">
            <table className="purchase-request-detail-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id ?? `${item.productId}-${index}`}>
                    <td>{index + 1}</td>
                    <td>{getPurchaseRequestItemName(item)}</td>
                    <td>{item.requestedQty ?? item.qty ?? 0}</td>
                    <td>{item.reason || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="purchase-request-detail-section">
          <p className="purchase-request-eyebrow">Timeline</p>
          <div className="purchase-request-timeline">
            <div>
              <strong>Created</strong>
              <span>{formatPurchaseRequestDate(request.createdAt ?? request.requestedDate)}</span>
            </div>
            <div>
              <strong>Current status</strong>
              <span>{request.status}</span>
            </div>
          </div>
        </section>

        <footer className="purchase-request-detail-actions">
          <button
            type="button"
            className="purchase-request-secondary-button"
            onClick={onClose}
          >
            Close
          </button>

          <div>
            {actions.map((action) => (
              <button
                key={action}
                type="button"
                className={`purchase-request-action-button purchase-request-action-button--${action.toLowerCase()}`}
                onClick={() => onAction?.(action, request)}
              >
                {action}
              </button>
            ))}
          </div>
        </footer>
      </section>
    </div>
  );
};

export default PurchaseRequestDetailModal;
