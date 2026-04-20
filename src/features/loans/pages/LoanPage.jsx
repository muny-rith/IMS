import React, { useMemo, useState } from 'react';
import './loan.css';

import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Snackbar,
  Tooltip,
} from '@mui/material';

import VisibilityIcon from '@mui/icons-material/Visibility';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';

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

const getStatusColor = (status) => {
  switch (status) {
    case 'RETURNED':
      return 'success';
    case 'PARTIAL':
      return 'warning';
    case 'CANCELLED':
      return 'default';
    default:
      return 'info';
  }
};

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
      { field: 'code', headerName: 'Loan Code', flex: 1.1 },
      { field: 'workerName', headerName: 'Worker', flex: 1.2 },
      { field: 'loanDate', headerName: 'Loan Date', flex: 1 },
      { field: 'dueDate', headerName: 'Due Date', flex: 1, renderCell: (params) => params.row.dueDate || '—' },
      {
        field: 'status',
        headerName: 'Status',
        flex: 0.9,
        renderCell: (params) => (
          <Chip
            size="small"
            label={params.row.status}
            color={getStatusColor(params.row.status)}
            variant="outlined"
          />
        ),
      },
      { field: 'totalQty', headerName: 'Borrowed Qty', flex: 0.8, type: 'number' },
      { field: 'returnedQty', headerName: 'Returned Qty', flex: 0.8, type: 'number' },
      { field: 'outstandingQty', headerName: 'Remaining Qty', flex: 0.9, type: 'number' },
      {
        field: 'action',
        headerName: 'Actions',
        flex: 1,
        sortable: false,
        renderCell: (params) => (
          <Box display="flex" gap={1} alignItems="center" height="100%">
            <Tooltip title="View">
              <VisibilityIcon
                sx={{ color: '#29b6f6', cursor: 'pointer', fontSize: 20 }}
                onClick={() =>
                  setModal({
                    open: true,
                    mode: 'view',
                    loan: params.row,
                  })
                }
              />
            </Tooltip>

            {params.row.outstandingQty > 0 && (
              <Tooltip title="Return item">
                <KeyboardReturnIcon
                  sx={{ color: '#66bb6a', cursor: 'pointer', fontSize: 20 }}
                  onClick={() =>
                    setReturnModal({
                      open: true,
                      loan: params.row,
                    })
                  }
                />
              </Tooltip>
            )}
          </Box>
        ),
      },
    ],
    []
  );

  return (
    <div className="container-fluid">
      <h5 style={{ alignSelf: 'flex-start' }}>Loan list</h5>

      <div className="filter">
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

        <Input
          leftIcon={<i className="fa-solid fa-magnifying-glass" />}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by loan code, worker, status..."
        />
      </div>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <DataTable rows={filteredRows} columns={columns} />
      )}

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
