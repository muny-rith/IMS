import React, { useMemo, useState } from 'react';
import './loan.css';

import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Snackbar,
  Tooltip,
} from '@mui/material';

import VisibilityIcon from '@mui/icons-material/Visibility';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import DoneAllOutlinedIcon from '@mui/icons-material/DoneAllOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';

import DataTable from '../../../components/ui/DataTable/DataTable';
import Button from '../../../components/ui/Button/Button';
import Input from '../../../components/ui/Input/Input';
import LoanModal from './LoanModal';
import ReturnLoanModal from './ReturnLoanModal';
import { useLoans } from '../hooks/useLoans';

const INITIAL_TOAST = {
  open: false,
  message: '',
  severity: 'success',
};

const EMPTY_MODAL_STATE = {
  open: false,
  mode: 'create',
  loan: null,
};

const EMPTY_RETURN_MODAL_STATE = {
  open: false,
  loan: null,
};

const getStatusClass = (status) => {
  switch (status) {
    case 'RETURNED':
      return 'loan-status-chip loan-status-chip--returned';
    case 'PARTIAL':
      return 'loan-status-chip loan-status-chip--partial';
    case 'CANCELLED':
      return 'loan-status-chip loan-status-chip--cancelled';
    default:
      return 'loan-status-chip loan-status-chip--active';
  }
};

const SummaryCard = ({ icon, title, value, helper, tone = 'default' }) => (
  <div className={`loan-summary-card loan-summary-card--${tone}`}>
    <div className="loan-summary-card__icon">{icon}</div>
    <div className="loan-summary-card__content">
      <div className="loan-summary-card__title">{title}</div>
      <div className="loan-summary-card__value">{value}</div>
      <div className="loan-summary-card__helper">{helper}</div>
    </div>
  </div>
);

const LoanPage = () => {
  const {
    rows,
    workers,
    products,
    loading,
    submitting,
    error,
    handleCreate,
    handleReturn,
  } = useLoans();

  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(EMPTY_MODAL_STATE);
  const [returnModal, setReturnModal] = useState(EMPTY_RETURN_MODAL_STATE);
  const [toast, setToast] = useState(INITIAL_TOAST);

  const closeModal = () => {
    setModal(EMPTY_MODAL_STATE);
  };

  const closeReturnModal = () => {
    setReturnModal(EMPTY_RETURN_MODAL_STATE);
  };

  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };

  const filteredRows = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return rows;

    return rows.filter((row) =>
      [row.code, row.workerName, row.workerCode, row.status]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q))
    );
  }, [rows, search]);

  const stats = useMemo(() => {
    const outstandingLoans = rows.filter(
      (row) => Number(row.outstandingQty ?? 0) > 0 && row.status !== 'CANCELLED'
    ).length;

    const returnedLoans = rows.filter(
      (row) => row.status === 'RETURNED'
    ).length;

    // const partialLoans = rows.filter(
    //   (row) => row.status === 'PARTIAL'
    // ).length;
    // console.log(partialLoans)

    const itemsOut = rows.reduce(
      (sum, row) => sum + Number(row.outstandingQty ?? 0),
      0
    );

    return [
      {
        label: 'Total Loans',
        value: rows.length,
        helper: 'Loan records created',
        icon: <AssignmentOutlinedIcon fontSize="small" />,
        tone: 'default',
      },
      {
        label: 'Outstanding',
        value: outstandingLoans,
        helper: 'Still waiting for return',
        icon: <PendingActionsOutlinedIcon fontSize="small" />,
        tone: 'warning',
      },
      {
        label: 'Returned',
        value: returnedLoans,
        helper: 'Completed loan cycles',
        icon: <DoneAllOutlinedIcon fontSize="small" />,
        tone: 'success',
      },
      {
        label: 'Items Out',
        value: itemsOut,
        helper: 'Current outstanding quantity',
        icon: <Inventory2OutlinedIcon fontSize="small" />,
        tone: 'info',
      },
    ];
  }, [rows]);

  const handleCreateSubmit = async (data) => {
    const result = await handleCreate(data);

    if (result.success) {
      closeModal();
      showToast('Loan created.');
      return;
    }

    showToast(result.message || 'Failed to create loan.', 'error');
  };

  const handleReturnSubmit = async (data) => {
    const result = await handleReturn(data);

    if (result.success) {
      closeReturnModal();
      showToast('Loan item returned.');
      return;
    }

    showToast(result.message || 'Failed to return item.', 'error');
  };

  const columns = useMemo(
    () => [
      {
        field: 'code',
        headerName: 'Loan Code',
        flex: 1.05,
        renderCell: (params) => (
          <Box className="loan-code-cell">
            <span className="loan-code-cell__title">{params.row.code || '—'}</span>
            <span className="loan-code-cell__meta">Loan reference</span>
          </Box>
        ),
      },
      {
        field: 'workerName',
        headerName: 'Worker',
        flex: 1.2,
        renderCell: (params) => (
          <Box className="loan-worker-cell">
            <span className="loan-worker-cell__title">
              {params.row.workerName || '—'}
            </span>
            <span className="loan-worker-cell__meta">
              {params.row.workerCode || 'No worker code'}
            </span>
          </Box>
        ),
      },
      {
        field: 'loanDate',
        headerName: 'Loan Date',
        flex: 0.95,
        align: 'center',
        headerAlign: 'center',
      },
      {
        field: 'dueDate',
        headerName: 'Due Date',
        flex: 0.95,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => params.row.dueDate || '—',
      },
      {
        field: 'status',
        headerName: 'Status',
        flex: 0.9,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Chip
            size="small"
            label={params.row.status}
            variant="outlined"
            className={getStatusClass(params.row.status)}
          />
        ),
      },
      {
        field: 'totalQty',
        headerName: 'Borrowed Qty',
        flex: 0.8,
        type: 'number',
        align: 'center',
        headerAlign: 'center',
      },
      {
        field: 'returnedQty',
        headerName: 'Returned Qty',
        flex: 0.8,
        type: 'number',
        align: 'center',
        headerAlign: 'center',
      },
      {
        field: 'outstandingQty',
        headerName: 'Remaining Qty',
        flex: 0.9,
        type: 'number',
        align: 'center',
        headerAlign: 'center',
      },
      {
        field: 'action',
        headerName: 'Actions',
        flex: 0.95,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 0.5,
              flexWrap: 'nowrap',
            }}
          >
            <Tooltip title="View">
              <IconButton
                size="small"
                className="loan-action loan-action--view"
                onClick={() =>
                  setModal({
                    open: true,
                    mode: 'view',
                    loan: params.row,
                  })
                }
              >
                <VisibilityIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>

            {params.row.outstandingQty > 0 && (
              <Tooltip title="Return item">
                <IconButton
                  size="small"
                  className="loan-action loan-action--return"
                  onClick={() =>
                    setReturnModal({
                      open: true,
                      loan: params.row,
                    })
                  }
                >
                  <KeyboardReturnIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ),
      },
    ],
    []
  );

  return (
    <div className="loan-page">
      <section className="loan-page__hero">
        <div>
          <p className="loan-page__eyebrow">Operations</p>
          <h4 className="loan-page__title">Loan List</h4>
          <p className="loan-page__subtitle">
            Track borrower activity, monitor outstanding quantities, and process
            returns from one clean admin workspace.
          </p>
        </div>

        <div className="loan-page__stats">
          {stats.map((item) => (
            <SummaryCard
              key={item.label}
              icon={item.icon}
              title={item.label}
              value={item.value}
              helper={item.helper}
              tone={item.tone}
            />
          ))}
        </div>
      </section>

      {error && (
        <Alert severity="error" className="loan-page__alert">
          {error}
        </Alert>
      )}

      <section className="loan-panel">
        <section className="loan-toolbar">
          <div>
            <h6 className="loan-panel__title">Current Loans</h6>
            <p className="loan-panel__subtitle">
              Review loan activity, search workers or codes, and open return
              actions when items are still outstanding.
            </p>
          </div>

          <div className="loan-toolbar__controls">
            <Button
              value="Create loan"
              onClick={() =>
                setModal({
                  open: true,
                  mode: 'create',
                  loan: null,
                })
              }
            />

            <div className="loan-toolbar__search">
              <Input
                leftIcon={<i className="fa-solid fa-magnifying-glass" />}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by loan code, worker, status..."
              />
            </div>
          </div>
        </section>

        <div className="loan-panel__header">
          <div className="loan-panel__meta">
            <p className="loan-panel__eyebrow">Live loans</p>
            <div className="loan-panel__badge">
              {filteredRows.length} visible
            </div>
          </div>
        </div>

        <div className="loan-panel__body">
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress size={28} />
            </Box>
          ) : (
            <DataTable rows={filteredRows} columns={columns} />
          )}
        </div>
      </section>

      <LoanModal
        open={modal.open}
        onClose={closeModal}
        onSubmit={handleCreateSubmit}
        submitting={submitting}
        workers={workers}
        products={products}
        defaultValues={modal.mode === 'create' ? null : modal.loan}
        mode={modal.mode}
      />

      <ReturnLoanModal
        open={returnModal.open}
        onClose={closeReturnModal}
        onSubmit={handleReturnSubmit}
        submitting={submitting}
        loan={returnModal.loan}
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

export default LoanPage;
