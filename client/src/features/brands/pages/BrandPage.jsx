import React, { useMemo, useState ,useCallback} from 'react';
import './brand.css';

import {
  Alert,
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Tooltip,
  Avatar,
} from '@mui/material';

import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

import DataTable from '../../../components/ui/DataTable/DataTable';
import Button from '../../../components/ui/Button/Button';
import Input from '../../../components/ui/Input/Input';
import BrandModal from './BrandModal';
import { useBrands } from '../hooks/useBrands';
import BrandMobileCardList from '../components/BrandMobileCardList';

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

const SummaryCard = ({ icon, title, value, helper }) => (
  <div className="brand-summary-card">
    <div className="brand-summary-card__icon">{icon}</div>
    <div className="brand-summary-card__content">
      <div className="brand-summary-card__title">{title}</div>
      <div className="brand-summary-card__value">{value}</div>
      <div className="brand-summary-card__helper">{helper}</div>
    </div>
  </div>
);

const BrandPage = () => {
  const {
    rows,
    loading,
    submitting,
    handleAdd,
    handleUpdate,
    handleDelete,
  } = useBrands();

  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(EMPTY_MODAL_STATE);
  const [toast, setToast] = useState(INITIAL_TOAST);
  const [deleting, setDeleting] = useState(null);

  const closeModal = () => {
    setModal(EMPTY_MODAL_STATE);
  };

  const showToast = (message, severity = 'success') => {
    setToast({
      open: true,
      message,
      severity,
    });
  };

  const filteredRows = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return rows;

    return rows.filter((row) =>
      [row.name, row.description]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q))
    );
  }, [rows, search]);

  const stats = useMemo(() => {
    const withDescription = rows.filter((row) =>
      row.description?.trim()
    ).length;

    const withoutDescription = rows.length - withDescription;

    return [
      {
        label: 'Total Brands',
        value: rows.length,
        helper: 'Catalog groups available',
        icon: <LocalOfferOutlinedIcon fontSize="small" />,
      },
      {
        label: 'With Description',
        value: withDescription,
        helper: 'Clearer brand details',
        icon: <DescriptionOutlinedIcon fontSize="small" />,
      },
      {
        label: 'Need Description',
        value: withoutDescription,
        helper: 'Should be completed',
        icon: <ChecklistOutlinedIcon fontSize="small" />,
      },
      {
        label: 'Visible Results',
        value: filteredRows.length,
        helper: 'Current search result',
        icon: <VisibilityOutlinedIcon fontSize="small" />,
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
      showToast(isEdit ? 'Brand updated.' : 'Brand added.');
      return;
    }

    showToast(result.message || 'Something went wrong.', 'error');
  };

  const confirmDelete = async () => {
    const result = await handleDelete(deleting);
    setDeleting(null);

    if (result.success) {
      showToast('Brand deleted.');
      return;
    }

    showToast(result.message || 'Delete failed.', 'error');
  };
  

  

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

  const columns = useMemo(
    () => [
      {
        field: 'brand',
        headerName: 'Brand',
        flex: 0.8,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Box className="brand-avatar-cell" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Avatar src={params.row.imageUrl ?? undefined} className="brand-avatar">
              {params.row.name?.[0]?.toUpperCase() ?? '?'}
            </Avatar>
          </Box>
        ),
      },
      {
        field: 'name',
        headerName: 'Brand Name',
        flex: 1.2,
        renderCell: (params) => (
          <Box className="brand-name-cell">
            <span className="brand-name-cell__title">
              {params.row.name || '—'}
            </span>
          </Box>
        ),
      },
      {
        field: 'description',
        headerName: 'Description',
        flex: 1.8,
        renderCell: (params) => (
          <Box className="brand-description-cell">
            {params.row.description || '—'}
          </Box>
        ),
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
                className="brand-action brand-action--view"
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
                className="brand-action brand-action--edit"
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
                className="brand-action brand-action--delete"
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
    <div className="brand-page">
      <section className="brand-page__hero">
        <div>
          <p className="brand-page__eyebrow">Catalog</p>
          <h4 className="brand-page__title">Brand List</h4>
          <p className="brand-page__subtitle">
            Manage brand names, organize descriptions, and keep product
            grouping clean across your admin workspace.
          </p>
        </div>

        <div className="brand-page__stats">
          {stats.map((item) => (
            <SummaryCard
              key={item.label}
              icon={item.icon}
              title={item.label}
              value={item.value}
              helper={item.helper}
            />
          ))}
        </div>
      </section>

      {loading === false && rows.length === 0 ? null : null}

      <section className="brand-panel">
        <section className="brand-toolbar">
          <div>
            <h6 className="brand-panel__title">Current Brands</h6>
            <p className="brand-panel__subtitle">
              Track brand names, review descriptions, and open management
              actions per record.
            </p>
          </div>

          <div className="brand-toolbar__controls">
            <Button
              value="Add brand"
              onClick={() =>
                setModal({
                  open: true,
                  mode: 'create',
                  editRow: null,
                })
              }
            />
            <div className="brand-toolbar__search">
              <Input
                leftIcon={<i className="fa-solid fa-magnifying-glass" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by brand name or description..."
              />
            </div>
          </div>
        </section>

        <div className="brand-panel__header">
          <div className="brand-panel__meta">
            <p className="brand-panel__eyebrow">Live brands</p>
            <div className="brand-panel__badge">
              {filteredRows.length} visible
            </div>
          </div>
        </div>

        <div className="brand-panel__body">
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress size={28} />
            </Box>
          ) : filteredRows.length === 0 ? (
            <div className="mobile-empty">No brands match this search.</div>
          ) : (
            <>
              <div className="brand-desktop-table">
                <DataTable rows={filteredRows} columns={columns} />
              </div>

              <div className="brand-mobile-cards">
                <BrandMobileCardList
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

      <BrandModal
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
        <DialogTitle>Delete brand?</DialogTitle>
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

export default BrandPage;
