import React, { useCallback, useMemo, useState } from 'react';
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
  IconButton,
  Snackbar,
  Tooltip,
} from '@mui/material';

import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';

import Button from '../../../components/ui/Button/Button';
import DataTable from '../../../components/ui/DataTable/DataTable';
import Input from '../../../components/ui/Input/Input';
import { useProducts } from '../hooks/useProducts';
import ProductModal from './ProductModal';
import ProductMobileCardList from '../components/ProductMobileCardList';

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

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const SummaryCard = ({ icon, title, value, helper, tone = 'default' }) => (
  <div className={`product-summary-card product-summary-card--${tone}`}>
    <div className="product-summary-card__icon">{icon}</div>
    <div className="product-summary-card__content">
      <div className="product-summary-card__title">{title}</div>
      <div className="product-summary-card__value">{value}</div>
      <div className="product-summary-card__helper">{helper}</div>
    </div>
  </div>
);

const ProductPage = () => {
  const {
    rows = [],
    categories = [],
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

  const closeModal = useCallback(() => {
    setModal(EMPTY_MODAL_STATE);
  }, []);

  const showToast = useCallback((message, severity = 'success') => {
    setToast({
      open: true,
      message,
      severity,
    });
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

  const filteredRows = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return rows;

    return rows.filter((row) =>
      [row.name, row.code, row.category, row.department]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q))
    );
  }, [rows, search]);

  const stats = useMemo(() => {
    const lowStockCount = rows.filter((row) => {
      const qty = Number(row.qty ?? 0);
      return qty > 0 && qty <= 10;
    }).length;

    const outOfStockCount = rows.filter(
      (row) => Number(row.qty ?? 0) <= 0
    ).length;

    const stockValue = rows.reduce((sum, row) => {
      const qty = Number(row.qty ?? 0);
      const price = Number(row.price ?? 0);
      return sum + qty * price;
    }, 0);

    return [
      {
        label: 'Products',
        value: rows.length,
        helper: `${filteredRows.length} visible in table`,
        icon: <Inventory2OutlinedIcon fontSize="small" />,
        tone: 'default',
      },
      {
        label: 'Categories',
        value: categories.length,
        helper: 'Organized groups',
        icon: <CategoryOutlinedIcon fontSize="small" />,
        tone: 'info',
      },
      {
        label: 'Low Stock',
        value: lowStockCount,
        helper: `${outOfStockCount} out of stock`,
        icon: <WarningAmberOutlinedIcon fontSize="small" />,
        tone: 'warning',
      },
      {
        label: 'Stock Value',
        value: currencyFormatter.format(stockValue),
        helper: 'Visible inventory value',
        icon: <PaymentsOutlinedIcon fontSize="small" />,
        tone: 'success',
      },
    ];
  }, [rows, categories, filteredRows.length]);

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
        flex: 0.8,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Box className="product-avatar-cell">
            <Avatar src={params.row.image ?? undefined} className="product-avatar">
              {params.row.name?.[0]?.toUpperCase() ?? '?'}
            </Avatar>
          </Box>
        ),
      },
      {
        field: 'name',
        headerName: 'Name',
        flex: 1.35,
        renderCell: (params) => (
          <Box className="product-name-cell">
            <span className="product-name-cell__title">
              {params.row.name || '—'}
            </span>
            <span className="product-name-cell__meta">
              {params.row.code ? `SKU ${params.row.code}` : 'No code'}
            </span>
          </Box>
        ),
      },
      { field: 'code', headerName: 'Code', flex: 0.9 },
      {
        field: 'category',
        headerName: 'Category',
        flex: 1,
        renderCell: (params) => params.row.category || '—',
      },
      {
        field: 'department',
        headerName: 'Department',
        flex: 1.1,
        renderCell: (params) => params.row.department || 'N/A',
      },
      {
        field: 'price',
        headerName: 'Price',
        flex: 0.9,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params) => {
          const price = params.row.price;

          return (
            <Box className="product-price-cell">
              {price != null && price !== ''
                ? currencyFormatter.format(Number(price))
                : '—'}
            </Box>
          );
        },
      },
      {
        field: 'qty',
        headerName: 'Qty',
        flex: 0.7,
        type: 'number',
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => {
          const qty = Number(params.row.qty ?? 0);
          const qtyClass =
            qty <= 0
              ? 'product-qty-badge product-qty-badge--empty'
              : qty <= 10
                ? 'product-qty-badge product-qty-badge--low'
                : 'product-qty-badge';

          return (
            <Box className="product-qty-cell">
              <span className={qtyClass}>{qty}</span>
            </Box>
          );
        },
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
          <Box className="product-table-actions">
            <Tooltip title="View">
              <IconButton
                size="small"
                className="product-action product-action--view"
                onClick={() => openViewModal(params.row)}
              >
                <VisibilityIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Edit">
              <IconButton
                size="small"
                className="product-action product-action--edit"
                onClick={() => openEditModal(params.row)}
              >
                <EditIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete">
              <IconButton
                size="small"
                className="product-action product-action--delete"
                onClick={() => requestDelete(params.row.id)}
              >
                <DeleteIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    [openEditModal, openViewModal, requestDelete]
  );

  return (
    <div className="product-page">
      <section className="product-page__hero">
        <div>
          <p className="product-page__eyebrow">Catalog</p>
          <h4 className="product-page__title">Product List</h4>
          <p className="product-page__subtitle">
            Manage product identity, pricing, and quantity snapshots in one
            clean admin workspace.
          </p>
        </div>

        <div className="product-page__stats">
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

      <section className="product-panel">
        <section className="product-toolbar">
          <div>
            <h6 className="product-panel__title">Current Products</h6>
            <p className="product-panel__subtitle">
              Search products quickly, review pricing and stock posture, and
              keep product actions close to the table.
            </p>
          </div>

          <div className="product-toolbar__controls">
            <Button value="Add Product" onClick={openCreateModal} />
            <div className="product-toolbar__search">
              <Input
                leftIcon={<i className="fa-solid fa-magnifying-glass" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, code, category..."
              />
            </div>
          </div>
        </section>

        <div className="product-panel__header">
          <div className="product-panel__meta">
            <p className="product-panel__eyebrow">Live products</p>
            <div className="product-panel__badge">
              {filteredRows.length} visible
            </div>
          </div>
        </div>

        <div className="product-panel__body">
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={6}>
              <CircularProgress size={30} />
            </Box>
          ) : (
            <>
              <div className="product-desktop-table">
                <DataTable rows={filteredRows} columns={columns} />
              </div>
              <div className='product-mobile-cards'>
                <ProductMobileCardList
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
          <Button value="Cancel" variant="text" onClick={() => setDeleting(null)} />
          <Button value="Delete" onClick={confirmDelete} />
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
