import React, { useCallback, useMemo, useState } from 'react';

import DataTable from '../../../components/ui/DataTable/DataTable';
import { PURCHASE_REQUEST_STATUSES } from '../data/purchaseRequestMock';
import usePurchaseRequests from '../hooks/usePurchaseRequests';
import PurchaseRequestDetailModal from './PurchaseRequestDetailModal';
import PurchaseRequestMobileCardList from './PurchaseRequestMobileCardList';
import PurchaseRequestModal from './PurchaseRequestModal';
import PurchaseRequestPrintModal from './PurchaseRequestPrintModal';

import { Box, IconButton, Tooltip } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

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
  CANCELLED: 'Cancelled',
};

const EMPTY_CREATE_MODAL = {
  open: false,
  mode: 'create',
  request: null,
};

const EMPTY_DETAIL_MODAL = {
  open: false,
  request: null,
};

const EMPTY_PRINT_MODAL = {
  open: false,
  request: null,
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
    handleUpdate,
    handleApprove,
    handleReject,
    handleCancel,
  } = usePurchaseRequests();

  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [createModal, setCreateModal] = useState(EMPTY_CREATE_MODAL);
  const [detailModal, setDetailModal] = useState(EMPTY_DETAIL_MODAL);
  const [printModal, setPrintModal] = useState(EMPTY_PRINT_MODAL);

  const openDetail = useCallback((request) => {
    setDetailModal({
      open: true,
      request,
    });
  }, []);

  const closeDetail = useCallback(() => {
    setDetailModal(EMPTY_DETAIL_MODAL);
  }, []);

  const openCreateModal = useCallback(() => {
    setCreateModal({
      open: true,
      mode: 'create',
      request: null,
    });
  }, []);

  const openEditModal = useCallback((request) => {
    setCreateModal({
      open: true,
      mode: 'edit',
      request,
    });
  }, []);

  const openPrintModal = useCallback((request) => {
    setPrintModal({
      open: true,
      request,
    });
  }, []);

  const columns = useMemo(
    () => [
      {
        field: 'requestNo',
        headerName: 'Request No',
        flex: 1,
      },
      {
        field: 'requestedDate',
        headerName: 'Date',
        flex: 1,
        renderCell: ({ row }) => formatPurchaseRequestDate(row.requestedDate),
      },
      {
        field: 'requestedBy',
        headerName: 'Requested By',
        flex: 1,
      },
      {
        field: 'items',
        headerName: 'Items',
        flex: 0.6,
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
        flex: 1,
        renderCell: ({ row }) => row.purpose || '-',
      },
      {
        field: 'action',
        headerName: 'Actions',
        flex: 0.6,
        minWidth: 70,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Box className="purchase-request-action-cell">
            <Tooltip title="View detail">
              <IconButton
                size="small"
                className="purchase-request-icon-action purchase-request-icon-action--view"
                onClick={() => openDetail(params.row)}
              >
                <MoreHorizIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    [openDetail]
  );

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

  const handleFormSubmit = async (data) => {
    const isEdit = createModal.mode === 'edit' && createModal.request?.id;
    const result = isEdit
      ? await handleUpdate(createModal.request.id, data)
      : await handleCreate(data);

    if (result.success) {
      setCreateModal(EMPTY_CREATE_MODAL);
      return;
    }

    window.alert(
      result.message ||
        (isEdit
          ? 'Failed to update purchase request.'
          : 'Failed to create purchase request.')
    );
  };

  const handleDetailAction = async (action, request) => {
    if (action === 'Print') {
      closeDetail();
      openPrintModal(request);
      return;
    }

    if (action === 'Edit') {
      if (request.status !== 'PENDING') {
        window.alert('Only pending purchase requests can be edited.');
        return;
      }

      closeDetail();
      openEditModal(request);
      return;
    }

    const actor = 'Admin';
    let result = null;

    if (action === 'Approve') {
      result = await handleApprove(request.id, actor);
    }

    if (action === 'Reject') {
      result = await handleReject(request.id, actor);
    }

    if (action === 'Cancel') {
      result = await handleCancel(request.id, actor);
    }

    if (!result) {
      return;
    }

    if (!result.success) {
      window.alert(result.message || `Failed to ${action.toLowerCase()} request.`);
      return;
    }

    closeDetail();
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
            onClick={openCreateModal}
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
          <div className="purchase-request-desktop-table">
            <DataTable rows={filteredRows} columns={columns} />
          </div>

          <div className="purchase-request-mobile-cards">
            <PurchaseRequestMobileCardList
              rows={filteredRows}
              onView={openDetail}
              onPrint={openPrintModal}
            />
          </div>
        </>
      )}

      <PurchaseRequestModal
        open={createModal.open}
        onClose={() => setCreateModal(EMPTY_CREATE_MODAL)}
        onSubmit={handleFormSubmit}
        products={products}
        submitting={submitting}
        mode={createModal.mode}
        defaultValues={createModal.request}
      />

      <PurchaseRequestDetailModal
        open={detailModal.open}
        request={detailModal.request}
        onClose={closeDetail}
        onAction={handleDetailAction}
      />

      <PurchaseRequestPrintModal
        open={printModal.open}
        request={printModal.request}
        onClose={() => setPrintModal(EMPTY_PRINT_MODAL)}
      />
    </section>
  );
};

export default PurchaseRequestPanel;
