import React, { useState, useMemo } from 'react';
import './product.css';


import DataTable from '../../../components/ui/DataTable/DataTable';
import Button from '../../../components/ui/Button/Button';
import Input from '../../../components/ui/Input/Input';
import ProductModal from './ProductModal';   // ← imported from same folder


import {
  Box, Avatar, Tooltip, Snackbar, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress,
} from '@mui/material';


import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { useProducts } from '../hooks/useProducts';

const INITIAL_TOAST = { open: false, message: '', severity: 'success' };

const ProductPage = () => {
  const { rows, categories, loading, submitting, handleAdd, handleUpdate, handleDelete } =
    useProducts();

  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ open: false, editRow: null, viewOnly: false });
  const [toast, setToast] = useState(INITIAL_TOAST);
  const [deleting, setDeleting] = useState(null);

  const filteredRows = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.name?.toLowerCase().includes(q) ||
        r.code?.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q) ||
        r.department?.toLowerCase().includes(q),
    );
  }, [rows, search]);

  const showToast = (message, severity = 'success') =>
    setToast({ open: true, message, severity });

  const handleSubmit = async (data) => {
    const result = modal.editRow
      ? await handleUpdate(modal.editRow.id, data)
      : await handleAdd(data);

    if (result.success) {
      setModal({ open: false, editRow: null });
      showToast(modal.editRow ? 'Product updated.' : 'Product added.');
    } else {
      showToast(result.message, 'error');
    }
  };

  const confirmDelete = async () => {
    const result = await handleDelete(deleting);
    setDeleting(null);
    if (result.success) showToast('Product deleted.');
    else showToast(result.message, 'error');
  };

  const columns = useMemo(
    () => [
      {
        field: 'product',
        headerName: 'Product',
        flex: 1.2,
        renderCell: (params) => (
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar src={params.row.image ?? undefined} sx={{ width: 32, height: 32, fontSize: 13 }}>
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
            ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
            : '—',
      },
      { field: 'qty', headerName: 'Qty', flex: 0.7, type: 'number',  align: 'left', headerAlign: 'left', },
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
                onClick={() => setModal({ open: true, editRow: params.row, viewOnly: true })}
              />
            </Tooltip>
            <Tooltip title="Edit">
              <EditIcon
                sx={{ color: '#66bb6a', cursor: 'pointer', fontSize: 20 }}
                onClick={() => setModal({ open: true, editRow: params.row, viewOnly: false })}
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
    [],
  );

  return (
    <div className="container-fluid">
      <h5 style={{ alignSelf: 'flex-start' }}>Product list</h5>

      <div className="filter">
        <Button onClick={() => setModal({ open: true, editRow: null, viewOnly: false })} value="Add product" />
        <Input
          leftIcon={<i className="fa-solid fa-magnifying-glass" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, code, category…"
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
        onClose={() => setModal({ open: false, editRow: null })}
        onSubmit={handleSubmit}
        submitting={submitting}
        categories={categories}
        defaultValues={modal.editRow}
        viewOnly={modal.viewOnly}
      />

      <Dialog open={Boolean(deleting)} onClose={() => setDeleting(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete product?</DialogTitle>
        <DialogContent>This action cannot be undone.</DialogContent>
        <DialogActions>
          <Button value = "Cancel" variant="text" onClick={() => setDeleting(null)} ></Button>
          <Button value="Delete" onClick={confirmDelete} sx={{ color: '#ef5350' }} />
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast(INITIAL_TOAST)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={toast.severity} onClose={() => setToast(INITIAL_TOAST)}>
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ProductPage;