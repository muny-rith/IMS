import React, { useMemo, useState } from 'react';

import DataTable from '../../../components/ui/DataTable/DataTable';
import { PURCHASE_REQUEST_STATUSES } from '../data/purchaseRequestMock';
import usePurchaseRequests from '../hooks/usePurchaseRequests';
import PurchaseRequestMobileCardList from './PurchaseRequestMobileCardList';
import PurchaseRequestModal from './PurchaseRequestModal';
import {
  formatPurchaseRequestDate,
  getPurchaseRequestItemLabel,
  getPurchaseRequestStatusClassName,
} from './purchaseRequestViewUtils';
import './purchaseRequest.css';

const statusLabel = {
  ALL: 'All',
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  RECEIVED: 'Received',
};

const columns = [
  {
    field: 'requestNo',
    headerName: 'Request No',
    minWidth: 140,
    flex: 1,
  },
  {
    field: 'requestedDate',
    headerName: 'Date',
    minWidth: 140,
    flex: 1,
    renderCell: ({ row }) => formatPurchaseRequestDate(row.requestedDate),
  },
  {
    field: 'requestedBy',
    headerName: 'Requested By',
    minWidth: 160,
    flex: 1,
  },
  {
    field: 'items',
    headerName: 'Items',
    minWidth: 240,
    flex: 1.4,
    sortable: false,
    renderCell: ({ row }) => {
      const items = row.items ?? [];

      return (
        <>
          <strong>{row.totalItems}</strong>
          <span className="purchase-request-table__muted">
            {items.map(getPurchaseRequestItemLabel).join(', ')}
          </span>
        </>
      );
    },
  },
  {
    field: 'status',
    headerName: 'Status',
    minWidth: 130,
    flex: 0.8,
    renderCell: ({ row }) => (
      <span className={getPurchaseRequestStatusClassName(row.status)}>
        {row.status}
      </span>
    ),
  },
  {
    field: 'purpose',
    headerName: 'Purpose',
    minWidth: 180,
    flex: 1,
    renderCell: ({ row }) => row.purpose || '-',
  },
  {
    field: 'actions',
    headerName: 'Action',
    minWidth: 150,
    flex: 0.8,
    sortable: false,
    filterable: false,
    renderCell: () => (
      <div className="purchase-request-actions">
        <button type="button">View</button>
        <button type="button">Print</button>
      </div>
    ),
  },
];

const PurchaseRequestPanel = () => {
  const {
    rows,
    products,
    loading,
    submitting,
    error,
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
          ...(row.items ?? []).map(getPurchaseRequestItemLabel),
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
          <button
            type="button"
            className="purchase-request-primary-button"
            onClick={() => setModalOpen(true)}
            disabled={loading || submitting}
          >
            Create Request
          </button>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search request, requester, item..."
            className="purchase-request-search"
          />

          {/* <button
            type="button"
            className="purchase-request-secondary-button"
            onClick={refetch}
            disabled={loading || submitting}
          >
            Refresh
          </button> */}


        </div>

      </div>

      {error && <div className="purchase-request-error">{error}</div>}

      <div className="purchase-request-filters">
        {PURCHASE_REQUEST_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            className={`purchase-request-filter${filter === status ? ' purchase-request-filter--active' : ''
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
          <div className="purchase-request-desktop-table">
            <DataTable rows={filteredRows} columns={columns} />
          </div>

          <div className="purchase-request-mobile-cards">
            <PurchaseRequestMobileCardList rows={filteredRows} />
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
