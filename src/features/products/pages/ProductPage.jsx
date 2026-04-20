import React, { useMemo, useState } from 'react';
import './product.css';

import {
  Alert,
  Avatar,
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Tooltip,
} from '@mui/material';

import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import DataTable from '../../../components/ui/DataTable/DataTable';
import Button from '../../../components/ui/Button/Button';
import Input from '../../../components/ui/Input/Input';
import ProductModal from './ProductModal';
import { useProducts } from '../hooks/useProducts';

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

const ProductPage = () => {
  const {
    rows,
    categories,
    loading,
    submitting,
    handleAdd,
    handleUpdate,
    handleDelete,
  } = useProducts();

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
      [row.name, row.code, row.category, row.department]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q))
    );
  }, [rows, search]);

  const handleSubmit = async (data) => {
    const isEdit = modal.mode === 'edit' && modal.editRow?.id;

    const result = isEdit
      ? await handleUpdate(modal.editRow.id, data)
      : await handleAdd(data);

    if (result.success) {
      closeModal();
      showToast(isEdit ? 'Product updated.' : 'Product added.');
      return;
    }

    showToast(result.message || 'Something went wrong.', 'error');
  };

  const confirmDelete = async () => {
    const result = await handleDelete(deleting);
    setDeleting(null);

    if (result.success) {
      showToast('Product deleted.');
      return;
    }

    showToast(result.message || 'Delete failed.', 'error');
  };

  const columns = useMemo(
    () => [
      {
        field: 'product',
        headerName: 'Product',
        flex: 1.2,
        renderCell: (params) => (
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar
              src={params.row.image ?? undefined}
              sx={{ width: 32, height: 32, fontSize: 13 }}
            >
              {params.row.name?.[0]?.toUpperCase()}
            </Avatar>
            {params.row.name}
          </Box>
        ),
      },
      { field: 'name', headerName: 'Name', flex: 1 },
      { field: 'code', headerName: 'Code', flex: 1 },
      { field: 'category', headerName: 'Category', flex: 1 },
      { field: 'department', headerName: 'Department', flex: 1.2 },
      {
        field: 'price',
        headerName: 'Price',
        flex: 1,
        valueFormatter: (value) =>
          value != null
            ? new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(value)
            : '—',
      },
      {
        field: 'qty',
        headerName: 'Qty',
        flex: 0.7,
        type: 'number',
        align: 'left',
        headerAlign: 'left',
      },
      {
        field: 'action',
        headerName: 'Actions',
        flex: 1.2,
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
                    editRow: params.row,
                  })
                }
              />
            </Tooltip>

            <Tooltip title="Edit">
              <EditIcon
                sx={{ color: '#66bb6a', cursor: 'pointer', fontSize: 20 }}
                onClick={() =>
                  setModal({
                    open: true,
                    mode: 'edit',
                    editRow: params.row,
                  })
                }
              />
            </Tooltip>

            <Tooltip title="Delete">
              <DeleteIcon
                sx={{ color: '#ef5350', cursor: 'pointer', fontSize: 20 }}
                onClick={() => setDeleting(params.row.id)}
              />
            </Tooltip>
          </Box>
        ),
      },
    ],
    []
  );

  return (
    <div className="container-fluid">
      <h5 style={{ alignSelf: 'flex-start' }}>Product list</h5>

      <div className="filter">
        <Button
          value="Add product"
          onClick={() =>
            setModal({
              open: true,
              mode: 'create',
              editRow: null,
            })
          }
        />

        <Input
          leftIcon={<i className="fa-solid fa-magnifying-glass" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, code, category..."
        />
      </div>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <DataTable rows={filteredRows} columns={columns} />
      )}

      <ProductModal
        open={modal.open}
        onClose={closeModal}
        onSubmit={handleSubmit}
        submitting={submitting}
        categories={categories}
        defaultValues={modal.mode === 'create' ? null : modal.editRow}
        mode={modal.mode}
      />

      <Dialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete product?</DialogTitle>
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

export default ProductPage;
