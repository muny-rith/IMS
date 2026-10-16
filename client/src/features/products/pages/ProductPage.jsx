import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './product.css';

import {
  Alert,
  Avatar,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Tooltip,
  useMediaQuery,
} from '@mui/material';

import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';

import Button from '../../../components/ui/Button/Button';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import DataTable from '../../../components/ui/DataTable/DataTable';
import Input from '../../../components/ui/Input/Input';
import Skeleton from '../../../components/ui/Skeleton/Skeleton';
import { ActionGroup } from '../../../components/ui/ActionButtons';
import { useProducts } from '../hooks/useProducts';
import { useAuth } from '../../auth/hooks/useAuth';
import ProductMobileCardList from '../components/ProductMobileCardList';
import MultiSelect from '../../../components/ui/MultiSelect/MultiSelect';
import ProductBulkActionsBar from '../components/ProductBulkActionsBar';
import { ProductStatsSkeleton } from '../components/ProductTableSkeleton';
import ProductHoverPreview from '../components/ProductHoverPreview';
import { exportProductsToExcel } from '../utils/exportProducts';



const PREVIEW_TOOLTIP_PROPS = {
  enterDelay: 180,
  leaveDelay: 100,
  disableInteractive: true,
  slotProps: {
    popper: {
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, 8],
          },
        },
      ],
    },
    tooltip: {
      sx: {
        p: 0,
        backgroundColor: 'transparent !important',
        boxShadow: 'none !important',
        maxWidth: 'none !important',
        border: 'none !important',
      },
    },
  },
};



const INITIAL_TOAST = {
  open: false,
  message: '',
  severity: 'success',
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const StatCard = ({ icon, label, value, tone = 'default' }) => (
  <div className={`product-stat-card product-stat-card--${tone}`}>
    <div className="product-stat-card__icon">{icon}</div>
    <div className="product-stat-card__info">
      <span className="product-stat-card__label">{label}</span>
      <span className="product-stat-card__value">{value}</span>
    </div>
  </div>
);

const ProductPage = () => {
  const {
    rows = [],
    categories = [],
    brands = [],
    loading,
    submitting,
    handleDelete,
    handleBulkDelete,
  } = useProducts();

  const { user } = useAuth();
  const userRole = user?.role || 'staff';
  const canCreate = ['admin', 'manager', 'staff'].includes(userRole);
  const canEdit = ['admin', 'manager', 'staff', 'worker'].includes(userRole);
  const canDelete = ['admin', 'manager'].includes(userRole);

  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [toast, setToast] = useState(INITIAL_TOAST);
  const [deleting, setDeleting] = useState(null);


  const showToast = useCallback((message, severity = 'success') => {
    setToast({
      open: true,
      message,
      severity,
    });
  }, []);

  const openCreateModal = useCallback(() => {
    navigate('/products/new');
  }, [navigate]);

  const openViewModal = useCallback((row) => {
    navigate(`/products/view/${row.id}`);
  }, [navigate]);

  const openEditModal = useCallback((row) => {
    navigate(`/products/edit/${row.id}`);
  }, [navigate]);

  const requestDelete = useCallback((id) => {
    setDeleting(id);
  }, []);

  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: String(c.id), label: c.name })),
    [categories]
  );

  const brandOptions = useMemo(
    () => brands.map((b) => ({ value: String(b.id), label: b.name })),
    [brands]
  );



  const filteredRows = useMemo(() => {
    const q = search.toLowerCase().trim();

    return rows.filter((row) => {
      if (q) {
        const matches = [row.name, row.category, row.department, row.brand]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(q));
        if (!matches) return false;
      }

      if (selectedCategories.length > 0) {
        const rowCatId = String(row.categoryId ?? '');
        const matchesCat = selectedCategories.some(
          (catVal) => String(catVal) === rowCatId || catVal === row.category
        );
        if (!matchesCat) return false;
      }

      if (selectedBrands.length > 0) {
        const rowBrandId = String(row.brandId ?? '');
        const matchesBrand = selectedBrands.some(
          (brandVal) => String(brandVal) === rowBrandId || brandVal === row.brand
        );
        if (!matchesBrand) return false;
      }

      return true;
    });
  }, [rows, search, selectedCategories, selectedBrands]);

  const handleExport = useCallback(() => {
    if (!filteredRows || filteredRows.length === 0) {
      showToast('No products to export.', 'error');
      return;
    }
    exportProductsToExcel(filteredRows);
    showToast(`Exported ${filteredRows.length} products to Excel.`);
  }, [filteredRows, showToast]);

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



  const confirmDelete = async () => {
    const deletedId = deleting;
    const result = await handleDelete(deletedId);
    if (deletedId) {
      setSelectedRowIds((prev) => prev.filter((id) => id !== deletedId));
    }
    setDeleting(null);

    if (result.success) {
      showToast('Product deleted.');
      return;
    }

    showToast(result.message || 'Delete failed.', 'error');
  };

  const handleBulkExport = useCallback(() => {
    if (selectedRowIds.length === 0) return;
    const idSet = new Set(selectedRowIds);
    const selectedProducts = rows.filter((r) => idSet.has(r.id));
    if (selectedProducts.length === 0) return;
    exportProductsToExcel(selectedProducts, 'selected-products');
    showToast(`Exported ${selectedProducts.length} selected products to Excel.`);
  }, [selectedRowIds, rows, showToast]);

  const handleExecuteBulkDelete = async () => {
    const count = selectedRowIds.length;
    const result = await handleBulkDelete(selectedRowIds);
    setConfirmBulkDelete(false);
    if (result.success) {
      setSelectedRowIds([]);
      showToast(`Successfully deleted ${count} products.`);
    } else {
      showToast(result.message || 'Failed to delete selected products.', 'error');
    }
  };


  const isUnder1200 = useMediaQuery('(max-width: 1200px)');
  const isUnder992 = useMediaQuery('(max-width: 992px)');

  const columnVisibilityModel = useMemo(
    () => ({
      department: !isUnder1200,
      category: !isUnder992,
    }),
    [isUnder1200, isUnder992]
  );

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
          <Tooltip
            title={<ProductHoverPreview product={params.row} />}
            placement="bottom-start"
            {...PREVIEW_TOOLTIP_PROPS}
          >
            <Box
              className="product-avatar-cell product-avatar-clickable"
              onClick={(e) => {
                e.stopPropagation();
                openViewModal(params.row);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.stopPropagation();
                  openViewModal(params.row);
                }
              }}
              aria-label={`View ${params.row.name || 'product'}`}
            >
              <Avatar src={params.row.image ?? undefined} className="product-avatar">
                {params.row.name?.[0]?.toUpperCase() ?? '?'}
              </Avatar>
            </Box>
          </Tooltip>
        ),
      },
      {
        field: 'name',
        headerName: 'Name',
        flex: 1.35,
        renderCell: (params) => (
          <Tooltip
            title={<ProductHoverPreview product={params.row} />}
            placement="bottom-start"
            {...PREVIEW_TOOLTIP_PROPS}
          >
            <div
              className="product-name-clickable"
              onClick={(e) => {
                e.stopPropagation();
                openViewModal(params.row);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.stopPropagation();
                  openViewModal(params.row);
                }
              }}
              aria-label={`View ${params.row.name || 'product'}`}
            >
              <span className="product-name-clickable__text">
                {params.row.name || '—'}
              </span>
            </div>
          </Tooltip>
        ),
      },
      {
        field: 'category',
        headerName: 'Category',
        flex: 1,
        headerClassName: 'col-category',
        cellClassName: 'col-category',
        renderCell: (params) => (
          <span className="product-category-tag">{params.row.category || '—'}</span>
        ),
      },
      {
        field: 'brand',
        headerName: 'Brand',
        flex: 1,
        renderCell: (params) => (
          <span className="product-brand-cell">{params.row.brand || '—'}</span>
        ),
      },
      {
        field: 'department',
        headerName: 'Department',
        flex: 1.1,
        headerClassName: 'col-department',
        cellClassName: 'col-department',
        renderCell: (params) => (
          <span className="product-dept-cell">{params.row.department || 'N/A'}</span>
        ),
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
          <ActionGroup
            size={isUnder992 ? 'sm' : 'md'}
            onView={() => openViewModal(params.row)}
            onEdit={canEdit ? () => openEditModal(params.row) : undefined}
            onDelete={canDelete ? () => requestDelete(params.row.id) : undefined}
          />
        ),
      },
    ],
    [openEditModal, openViewModal, requestDelete, canEdit, canDelete, isUnder992]
  );

  return (
    <div className="product-page">
      {/* 1. Compact Header */}
      <div className="product-header">
        <div className="product-header__left">
          <h1 className="product-header__title">Products</h1>
          <span className="product-header__badge">
            {loading && rows.length === 0 ? (
              <Skeleton variant="rounded" width={48} height={18} style={{ borderRadius: '999px' }} />
            ) : (
              `${rows.length} total`
            )}
          </span>
        </div>

        <div className="product-header__actions">
          <Button
            variant="outline"
            icon={<FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />}
            responsiveCollapse
            onClick={handleExport}
            title="Export product list to Excel"
          >
            Export
          </Button>
          {canCreate && (
            <Button
              value="Add Product"
              icon={<AddIcon sx={{ fontSize: 18 }} />}
              responsiveCollapse
              onClick={openCreateModal}
            />
          )}
        </div>
      </div>

      {/* 2. Slim 1-row KPI Bar */}
      {loading && rows.length === 0 ? (
        <ProductStatsSkeleton />
      ) : (
        <div className="product-stats">
          {stats.map((item) => (
            <StatCard
              key={item.label}
              icon={item.icon}
              label={item.label}
              value={item.value}
              tone={item.tone}
            />
          ))}
        </div>
      )}

      {/* 3. Main Data Panel with integrated toolbar */}
      <section className="product-panel">
        <div className="product-panel__toolbar">
          <div className="product-panel__search">
            <form
              action=""
              onSubmit={(e) => {
                e.preventDefault();
                e.currentTarget.querySelector('input')?.blur();
              }}
              style={{ width: '100%', margin: 0 }}
            >
              <Input
                type="text"
                enterKeyHint="search"
                leftIcon={<SearchIcon sx={{ fontSize: 19, color: '#94a3b8' }} />}
                rightIcon={
                  search ? (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearch('');
                      }}
                      sx={{ padding: '2px', color: '#94a3b8' }}
                      aria-label="Clear search"
                    >
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  ) : null
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, category, brand..."
              />
            </form>
          </div>

          <div className="product-panel__filters">
            <MultiSelect
              label="Category"
              placeholder="Select Category"
              options={categoryOptions}
              selectedValues={selectedCategories}
              onChange={setSelectedCategories}
              maxTagsVisible={1}
              loading={loading && categoryOptions.length === 0}
            />

            <MultiSelect
              label="Brand"
              placeholder="Select Brand"
              options={brandOptions}
              selectedValues={selectedBrands}
              onChange={setSelectedBrands}
              maxTagsVisible={1}
              loading={loading && brandOptions.length === 0}
            />
          </div>

        </div>

        <div className="product-panel__body">
          <div className="product-desktop-table">
            <DataTable
              loading={loading && rows.length === 0}
              rowsCount={8}
              rows={filteredRows}
              columns={columns}
              columnVisibilityModel={columnVisibilityModel}
              rowSelectionModel={selectedRowIds}
              onRowSelectionModelChange={setSelectedRowIds}
            />
          </div>
          <div
            className="product-mobile-cards"
            onTouchStart={() => {
              if (document.activeElement && document.activeElement.tagName === 'INPUT') {
                document.activeElement.blur();
              }
            }}
            onTouchMove={() => {
              if (document.activeElement && document.activeElement.tagName === 'INPUT') {
                document.activeElement.blur();
              }
            }}
          >
            <ProductMobileCardList
              loading={loading && rows.length === 0}
              rows={filteredRows}
              onView={openViewModal}
              onEdit={canEdit ? openEditModal : undefined}
              onDelete={canDelete ? requestDelete : undefined}
            />
            {(!loading || rows.length > 0) && (
              <div className="product-panel__footer">
                <div className="product-panel__count">
                  Showing <strong>{filteredRows.length}</strong> of {rows.length} products
                </div>
              </div>
            )}
          </div>
        </div>
      </section>


      {/* Floating Bulk Actions Bar */}
      <ProductBulkActionsBar
        selectedCount={selectedRowIds.length}
        onClearSelection={() => setSelectedRowIds([])}
        onExport={handleBulkExport}
        onBulkDelete={() => setConfirmBulkDelete(true)}
        isAdmin={canDelete}
        submitting={submitting}
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
          <Button value="Delete" variant="danger" onClick={confirmDelete} />
        </DialogActions>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog
        open={confirmBulkDelete}
        onClose={() => !submitting && setConfirmBulkDelete(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#ef4444' }}>
          Delete {selectedRowIds.length} Products?
        </DialogTitle>
        <DialogContent>
          Are you sure you want to permanently delete these {selectedRowIds.length} products?
          Their variants, attribute associations, and stock balances will also be removed. This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button
            value="Cancel"
            variant="text"
            disabled={submitting}
            onClick={() => setConfirmBulkDelete(false)}
          />
          <Button
            value={submitting ? 'Deleting...' : `Delete ${selectedRowIds.length} Items`}
            variant="danger"
            loading={submitting}
            disabled={submitting}
            onClick={handleExecuteBulkDelete}
          />
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
