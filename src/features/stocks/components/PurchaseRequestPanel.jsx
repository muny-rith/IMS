import React, { useMemo, useState } from 'react';

import { PURCHASE_REQUEST_STATUSES } from '../data/purchaseRequestMock';
import usePurchaseRequests from '../hooks/usePurchaseRequests';
import PurchaseRequestModal from './PurchaseRequestModal';
import './purchaseRequest.css';

const statusLabel = {
  ALL: 'All',
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  RECEIVED: 'Received',
};

const formatDate = (value) => {
  if (!value) return '-';

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
  }).format(new Date(value));
};

const getItemLabel = (item) => {
  const productLabel = [item.productCode, item.productName]
    .filter(Boolean)
    .join(' - ');

  return `${productLabel || 'Unknown product'} x${item.requestedQty}`;
};

const PurchaseRequestPanel = () => {
  const {
    rows,
    products,
    loading,
    submitting,
    error,
    refetch,
    handleCreate,
  } = usePurchaseRequests();

  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const filteredRows = useMemo(() => {
    const q = search.toLowerCase().trim();

    return rows.filter((row) => {
      const matchesStatus = filter === 'ALL' || row.status === filter;
      const matchesSearch =
        !q ||
        [
          row.requestNo,
          row.requestedBy,
          row.purpose,
          row.status,
          ...(row.items ?? []).map(getItemLabel),
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [rows, filter, search]);

  const handleCreateSubmit = async (data) => {
    const result = await handleCreate(data);

    if (result.success) {
      setModalOpen(false);
      return;
    }

    window.alert(result.message || 'Failed to create purchase request.');
  };

  return (
    <section className="purchase-request-panel">
      <div className="purchase-request-toolbar">
        <div>
          <p className="purchase-request-eyebrow">Material requests</p>
          <h6 className="purchase-request-title">បណ្ណស្នើរទិញសម្ភារៈ</h6>
          <p className="purchase-request-subtitle">
            Create, review, approve, and print purchase requests before stock is
            received.
          </p>
        </div>

        <div className="purchase-request-toolbar__actions">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search request, requester, item..."
            className="purchase-request-search"
          />

          <button
            type="button"
            className="purchase-request-secondary-button"
            onClick={refetch}
            disabled={loading || submitting}
          >
            Refresh
          </button>

          <button
            type="button"
            className="purchase-request-primary-button"
            onClick={() => setModalOpen(true)}
            disabled={loading || submitting}
          >
            Create Request
          </button>
        </div>
      </div>

      {error && <div className="purchase-request-error">{error}</div>}

      <div className="purchase-request-filters">
        {PURCHASE_REQUEST_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            className={`purchase-request-filter${
              filter === status ? ' purchase-request-filter--active' : ''
            }`}
            onClick={() => setFilter(status)}
          >
            {statusLabel[status]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="purchase-request-empty">
          <strong>Loading purchase requests...</strong>
          <span>Please wait while the latest request records load.</span>
        </div>
      ) : filteredRows.length === 0 ? (
        <div className="purchase-request-empty">
          <strong>No purchase requests yet</strong>
          <span>
            Start by creating a request for low-stock or needed materials.
          </span>
        </div>
      ) : (
        <>
          <div className="purchase-request-table-wrap">
            <table className="purchase-request-table">
              <thead>
                <tr>
                  <th>Request No</th>
                  <th>Date</th>
                  <th>Requested By</th>
                  <th>Items</th>
                  <th>Status</th>
                  <th>Purpose</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.requestNo}</td>
                    <td>{formatDate(row.requestedDate)}</td>
                    <td>{row.requestedBy}</td>
                    <td>
                      <strong>{row.totalItems}</strong>
                      <span className="purchase-request-table__muted">
                        {row.items.map(getItemLabel).join(', ')}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`purchase-request-status purchase-request-status--${row.status.toLowerCase()}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td>{row.purpose || '-'}</td>
                    <td>
                      <div className="purchase-request-actions">
                        <button type="button">View</button>
                        <button type="button">Print</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="purchase-request-card-list">
            {filteredRows.map((row) => (
              <article className="purchase-request-card" key={row.id}>
                <div className="purchase-request-card__top">
                  <div>
                    <strong>{row.requestNo}</strong>
                    <span>{formatDate(row.requestedDate)}</span>
                  </div>
                  <span
                    className={`purchase-request-status purchase-request-status--${row.status.toLowerCase()}`}
                  >
                    {row.status}
                  </span>
                </div>

                <div className="purchase-request-card__meta">
                  <span>Requested by</span>
                  <strong>{row.requestedBy}</strong>
                </div>

                <div className="purchase-request-card__meta">
                  <span>Items</span>
                  <strong>{row.items.map(getItemLabel).join(', ')}</strong>
                </div>

                <p>{row.purpose || 'No purpose provided.'}</p>

                <div className="purchase-request-actions">
                  <button type="button">View</button>
                  <button type="button">Print</button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      <PurchaseRequestModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateSubmit}
        products={products}
        submitting={submitting}
      />
    </section>
  );
};

export default PurchaseRequestPanel;
