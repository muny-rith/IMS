import React, { useMemo, useState,useCallback } from 'react';
import './worker.css';

import {
  Alert,
  Avatar,
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Tooltip,
} from '@mui/material';

import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

import DataTable from '../../../components/ui/DataTable/DataTable';
import Button from '../../../components/ui/Button/Button';
import Input from '../../../components/ui/Input/Input';
import WorkerModal from './WorkerModal';
import { useWorkers } from '../hooks/useWorkers';
import WorkerMobileCardList from '../components/WorkerMobileCardList';

const INITIAL_TOAST = {
  open: false,
  message: '',
  severity: 'success',
};

const EMPTY_MODAL_STATE = {
  open: false,
  mode: 'create',
  editRow: null,
};



const SummaryCard = ({ icon, title, value, helper, tone = 'default' }) => (
  <div className={`worker-summary-card worker-summary-card--${tone}`}>
    <div className="worker-summary-card__icon">{icon}</div>
    <div className="worker-summary-card__content">
      <div className="worker-summary-card__title">{title}</div>
      <div className="worker-summary-card__value">{value}</div>
      <div className="worker-summary-card__helper">{helper}</div>
    </div>
  </div>
);

const WorkerPage = () => {
  const {
    rows,
    loading,
    submitting,
    handleAdd,
    handleUpdate,
    handleDelete,
  } = useWorkers();

  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(EMPTY_MODAL_STATE);
  const [toast, setToast] = useState(INITIAL_TOAST);
  const [deleting, setDeleting] = useState(null);

  
  const closeModal = useCallback(() => {
    setModal(EMPTY_MODAL_STATE);
  }, []);


  const openCreateModal = useCallback(() => {
    setModal({
      open: true,
      mode: 'create',
      editRow: null,
    });
  }, []);

  const openViewModal = useCallback((row) => {
    setModal({
      open: true,
      mode: 'view',
      editRow: row,
    });
  }, []);

  const openEditModal = useCallback((row) => {
    setModal({
      open: true,
      mode: 'edit',
      editRow: row,
    });
  }, []);

  const requestDelete = useCallback((id) => {
    setDeleting(id);
  }, []);


  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };

  const filteredRows = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return rows;

    return rows.filter((row) =>
      [row.name, row.code, row.positionTitle, row.department]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q))
    );
  }, [rows, search]);

  const stats = useMemo(() => {
    const withPosition = rows.filter((row) => row.positionTitle?.trim()).length;
    const withDepartment = rows.filter((row) => row.department?.trim()).length;

    return [
      {
        label: 'Total Workers',
        value: rows.length,
        helper: 'People records available',
        icon: <BadgeOutlinedIcon fontSize="small" />,
        tone: 'default',
      },
      {
        label: 'With Position',
        value: withPosition,
        helper: 'Role title recorded',
        icon: <WorkOutlineOutlinedIcon fontSize="small" />,
        tone: 'info',
      },
      {
        label: 'With Department',
        value: withDepartment,
        helper: 'Assigned to department',
        icon: <ApartmentOutlinedIcon fontSize="small" />,
        tone: 'success',
      },
      {
        label: 'Visible Results',
        value: filteredRows.length,
        helper: 'Current search result',
        icon: <VisibilityOutlinedIcon fontSize="small" />,
        tone: 'default',
      },
    ];
  }, [rows, filteredRows.length]);

  const handleSubmit = async (data) => {
    const isEdit = modal.mode === 'edit' && modal.editRow?.id;

    const result = isEdit
      ? await handleUpdate(modal.editRow.id, data)
      : await handleAdd(data);

    if (result.success) {
      closeModal();
      showToast(isEdit ? 'Worker updated.' : 'Worker added.');
      return;
    }

    showToast(result.message || 'Something went wrong.', 'error');
  };

  const confirmDelete = async () => {
    const result = await handleDelete(deleting);
    setDeleting(null);

    if (result.success) {
      showToast('Worker deleted.');
      return;
    }

    showToast(result.message || 'Delete failed.', 'error');
  };

  const columns = useMemo(
    () => [
      {
        field: 'worker',
        headerName: 'Worker',
        flex: 0.85,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Avatar className="worker-avatar">
              {params.row.name?.[0]?.toUpperCase()}
            </Avatar>
          </Box>
        ),
      },
      {
        field: 'name',
        headerName: 'Name',
        flex: 1.25,
        renderCell: (params) => (
          <Box className="worker-name-cell">
            <span className="worker-name-cell__title">
              {params.row.name || '—'}
            </span>
            <span className="worker-name-cell__meta">
              {params.row.code ? `Code ${params.row.code}` : 'No code'}
            </span>
          </Box>
        ),
      },
      {
        field: 'code',
        headerName: 'Code',
        flex: 0.9,
      },
      {
        field: 'positionTitle',
        headerName: 'Position',
        flex: 1.1,
        renderCell: (params) => params.row.positionTitle || '—',
      },
      {
        field: 'department',
        headerName: 'Department',
        flex: 1.1,
        renderCell: (params) => params.row.department || '—',
      },
      {
        field: 'action',
        headerName: 'Actions',
        flex: 1,
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
                className="worker-action worker-action--view"
                onClick={() =>
                  setModal({
                    open: true,
                    mode: 'view',
                    editRow: params.row,
                  })
                }
              >
                <VisibilityIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Edit">
              <IconButton
                size="small"
                className="worker-action worker-action--edit"
                onClick={() =>
                  setModal({
                    open: true,
                    mode: 'edit',
                    editRow: params.row,
                  })
                }
              >
                <EditIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete">
              <IconButton
                size="small"
                className="worker-action worker-action--delete"
                onClick={() => setDeleting(params.row.id)}
              >
                <DeleteIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    []
  );

  return (
    <div className="worker-page">
      <section className="worker-page__hero">
        <div>
          <p className="worker-page__eyebrow">People</p>
          <h4 className="worker-page__title">Worker List</h4>
          <p className="worker-page__subtitle">
            Manage worker records, keep job roles organized, and maintain clean
            department ownership in one admin workspace.
          </p>
        </div>

        <div className="worker-page__stats">
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

      <section className="worker-panel">
        <section className="worker-toolbar">
          <div>
            <h6 className="worker-panel__title">Current Workers</h6>
            <p className="worker-panel__subtitle">
              Review people records, search by identity or role, and keep worker
              actions close to the table.
            </p>
          </div>

          <div className="worker-toolbar__controls">
            <Button
              value="Add worker"
              onClick={() =>
                setModal({
                  open: true,
                  mode: 'create',
                  editRow: null,
                })
              }
            />

            <div className="worker-toolbar__search">
              <Input
                leftIcon={<i className="fa-solid fa-magnifying-glass" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, code, position..."
              />
            </div>
          </div>
        </section>

        <div className="worker-panel__header">
          <div className="worker-panel__meta">
            <p className="worker-panel__eyebrow">Live workers</p>
            <div className="worker-panel__badge">
              {filteredRows.length} visible
            </div>
          </div>
        </div>

        <div className="worker-panel__body">
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress size={28} />
            </Box>
          ) : filteredRows.length === 0 ? (
            <div className="mobile-empty">No workers match this search.</div>
          ) : (
            <>
              <div className="worker-desktop-table">
                <DataTable rows={filteredRows} columns={columns} />
              </div>

              <div className="worker-mobile-cards">
                <WorkerMobileCardList
                  rows={filteredRows}
                  onView={openViewModal}
                  onEdit={openEditModal}
                  onDelete={requestDelete}
                />
              </div>
            </>
          )}
        </div>

      </section>

      <WorkerModal
        open={modal.open}
        onClose={closeModal}
        onSubmit={handleSubmit}
        submitting={submitting}
        defaultValues={modal.mode === 'create' ? null : modal.editRow}
        mode={modal.mode}
      />

      <Dialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete worker?</DialogTitle>
        <DialogContent>This action cannot be undone.</DialogContent>
        <DialogActions>
          <Button
            value="Cancel"
            variant="text"
            onClick={() => setDeleting(null)}
          />
          <Button
            value="Delete"
            onClick={confirmDelete}
            sx={{ color: '#ef5350' }}
          />
        </DialogActions>
      </Dialog>

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

export default WorkerPage;
