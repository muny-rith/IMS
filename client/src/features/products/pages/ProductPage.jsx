import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import logo from '../../../assets/images/logo.png';
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
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import Button from '../../../components/ui/Button/Button';
import CloudSyncOutlinedIcon from '@mui/icons-material/CloudSyncOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import DataTable from '../../../components/ui/DataTable/DataTable';
import PrintModal from '../../../components/ui/PrintModal/PrintModal';
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
import { exportProductsToExcel, exportProductsToCsv } from '../utils/exportProducts';
import {
  syncProductsToGoogleSheets,
  fetchVariantsForExport,
  formatVariantAttributes,
} from '../services/productService';



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

const safeSessionStorage = {
  getItem: (key) => {
    try {
      return typeof window !== 'undefined' && window.sessionStorage ? window.sessionStorage.getItem(key) : null;
    } catch {
      return null;
    }
  },
  setItem: (key, val) => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) window.sessionStorage.setItem(key, val);
    } catch {
      // ignore
    }
  },
  removeItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) window.sessionStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};

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
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. Read URL query parameters (1-based for human readability e.g. ?page=3)
  const pageFromUrl = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const pageSizeFromUrl = Math.max(5, parseInt(searchParams.get('pageSize') || '25', 10));
  const searchFromUrl = searchParams.get('q') || '';
  const categoriesFromUrl = useMemo(() => {
    const raw = searchParams.get('cat');
    return raw ? raw.split(',').filter(Boolean) : [];
  }, [searchParams]);
  const brandsFromUrl = useMemo(() => {
    const raw = searchParams.get('brand');
    return raw ? raw.split(',').filter(Boolean) : [];
  }, [searchParams]);

  // Local state for fast responsive typing and immediate UI reflection
  const [search, setSearch] = useState(searchFromUrl);
  const [selectedCategories, setSelectedCategories] = useState(categoriesFromUrl);
  const [selectedBrands, setSelectedBrands] = useState(brandsFromUrl);

  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [toast, setToast] = useState(INITIAL_TOAST);
  const [deleting, setDeleting] = useState(null);

  const pageRef = useRef(null);

  // Sync state when browser back/forward or direct URL changes occur
  useEffect(() => {
    setSearch(searchFromUrl);
    setSelectedCategories(categoriesFromUrl);
    setSelectedBrands(brandsFromUrl);
  }, [searchFromUrl, categoriesFromUrl, brandsFromUrl]);

  // Central URL updater
  const updateUrlParams = useCallback(
    (updates, { replace = false } = {}) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);

          if (updates.page !== undefined) {
            if (updates.page <= 1) next.delete('page');
            else next.set('page', String(updates.page));
          }

          if (updates.pageSize !== undefined) {
            if (updates.pageSize === 25) next.delete('pageSize');
            else next.set('pageSize', String(updates.pageSize));
          }

          if (updates.q !== undefined) {
            if (!updates.q) next.delete('q');
            else next.set('q', updates.q);
          }

          if (updates.cat !== undefined) {
            if (!updates.cat || updates.cat.length === 0) next.delete('cat');
            else next.set('cat', updates.cat.join(','));
          }

          if (updates.brand !== undefined) {
            if (!updates.brand || updates.brand.length === 0) next.delete('brand');
            else next.set('brand', updates.brand.join(','));
          }

          return next;
        },
        { replace }
      );
    },
    [setSearchParams]
  );

  const handleSearchChange = useCallback(
    (val) => {
      setSearch(val);
      updateUrlParams({ q: val, page: 1 }, { replace: true });
    },
    [updateUrlParams]
  );

  const handleCategoriesChange = useCallback(
    (newCats) => {
      setSelectedCategories(newCats);
      updateUrlParams({ cat: newCats, page: 1 }, { replace: false });
    },
    [updateUrlParams]
  );

  const handleBrandsChange = useCallback(
    (newBrands) => {
      setSelectedBrands(newBrands);
      updateUrlParams({ brand: newBrands, page: 1 }, { replace: false });
    },
    [updateUrlParams]
  );

  const handleClearAllFilters = useCallback(() => {
    setSearch('');
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSearchParams(new URLSearchParams(), { replace: false });
  }, [setSearchParams]);

  // Desktop DataGrid Pagination Model (0-indexed)
  const paginationModel = useMemo(
    () => ({
      page: pageFromUrl - 1,
      pageSize: pageSizeFromUrl,
    }),
    [pageFromUrl, pageSizeFromUrl]
  );

  const handlePaginationModelChange = useCallback(
    (newModel) => {
      updateUrlParams({
        page: newModel.page + 1,
        pageSize: newModel.pageSize,
      });
    },
    [updateUrlParams]
  );

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

  const openViewModal = useCallback(
    (row) => {
      if (row && row.id) {
        safeSessionStorage.setItem('last_viewed_product_id', String(row.id));
      }
      navigate(`/products/view/${row.id}`);
    },
    [navigate]
  );

  const openEditModal = useCallback(
    (row) => {
      if (row && row.id) {
        safeSessionStorage.setItem('last_viewed_product_id', String(row.id));
      }
      navigate(`/products/edit/${row.id}`);
    },
    [navigate]
  );

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

  // Defensive boundary check to ensure page never exceeds maximum available pages
  useEffect(() => {
    if (!filteredRows.length) return;
    const maxPage = Math.max(1, Math.ceil(filteredRows.length / pageSizeFromUrl));
    if (pageFromUrl > maxPage) {
      updateUrlParams({ page: maxPage }, { replace: true });
    }
  }, [filteredRows.length, pageSizeFromUrl, pageFromUrl, updateUrlParams]);

  // Mobile Pagination calculation (25 items per page chunk)
  const mobileCurrentPage = pageFromUrl;
  const mobileTotalCount = filteredRows.length;
  const mobileTotalPages = Math.max(1, Math.ceil(mobileTotalCount / pageSizeFromUrl));
  const clampedMobilePage = Math.min(Math.max(1, mobileCurrentPage), mobileTotalPages);

  const mobileStartIndex = (clampedMobilePage - 1) * pageSizeFromUrl;
  const mobileEndIndex = Math.min(mobileStartIndex + pageSizeFromUrl, mobileTotalCount);
  const mobilePaginatedRows = useMemo(() => {
    return filteredRows.slice(mobileStartIndex, mobileEndIndex);
  }, [filteredRows, mobileStartIndex, mobileEndIndex]);

  const getScrollContainer = useCallback(() => {
    return (
      pageRef.current?.parentElement ||
      pageRef.current?.closest('[class*="content"]') ||
      document.querySelector('[class*="content"]') ||
      window
    );
  }, []);

  const handleMobileNextPage = useCallback(() => {
    if (clampedMobilePage < mobileTotalPages) {
      updateUrlParams({ page: clampedMobilePage + 1 });
      const container = getScrollContainer();
      if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [clampedMobilePage, mobileTotalPages, updateUrlParams, getScrollContainer]);

  const handleMobilePrevPage = useCallback(() => {
    if (clampedMobilePage > 1) {
      updateUrlParams({ page: clampedMobilePage - 1 });
      const container = getScrollContainer();
      if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [clampedMobilePage, updateUrlParams, getScrollContainer]);

  // Entity Anchor: center and highlight the last viewed product on return
  useEffect(() => {
    const lastId = safeSessionStorage.getItem('last_viewed_product_id');
    if (!lastId || loading || rows.length === 0) return;

    const timer = setTimeout(() => {
      const targetElement =
        document.getElementById(`product-card-${lastId}`) ||
        document.querySelector(`[data-id="${lastId}"]`);

      if (targetElement) {
        targetElement.scrollIntoView({ block: 'center', behavior: 'smooth' });
        targetElement.classList.add('product-row-highlight');
        setTimeout(() => {
          targetElement.classList.remove('product-row-highlight');
        }, 1600);
        safeSessionStorage.removeItem('last_viewed_product_id');
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [loading, rows.length, clampedMobilePage]);

  const [syncingSheets, setSyncingSheets] = useState(false);

  const handleSyncGoogleSheets = async () => {
    try {
      setSyncingSheets(true);
      const res = await syncProductsToGoogleSheets();
      showToast(`Synced ${res.totalSynced || 'all'} products to Google Sheets!`);
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to sync to Google Sheets.', 'error');
    } finally {
      setSyncingSheets(false);
    }
  };

  const [showPrintModal, setShowPrintModal] = useState(false);
  const [variantRows, setVariantRows] = useState([]);

  // Pre-load variant rows on mount so print preview is instantly ready
  useEffect(() => {
    let active = true;
    const loadVariants = async () => {
      try {
        const data = await fetchVariantsForExport();
        if (active) {
          setVariantRows(data);
        }
      } catch (err) {
        console.error('Failed to load variants for export:', err);
      }
    };
    loadVariants();
    return () => {
      active = false;
    };
  }, []);

  // Keep only variants belonging to currently filtered products
  const filteredProductIds = useMemo(
    () => new Set(filteredRows.map((r) => Number(r.id))),
    [filteredRows]
  );

  const printableVariantRows = useMemo(() => {
    if (variantRows && variantRows.length > 0) {
      return variantRows.filter((v) => filteredProductIds.has(Number(v.product_id)));
    }
    // Fallback if variants haven't loaded yet
    return filteredRows.map((r) => ({
      product_id: r.id,
      product_name: r.name,
      category_name: r.category,
      brand_name: r.brand,
      variant_id: r.id,
      sku: r.sku,
      unit_price: r.price,
      other: '-',
      on_hand_qty: r.qty,
      attribute_values: [],
    }));
  }, [variantRows, filteredProductIds, filteredRows]);

  // 5 Core Google Sheet columns: [ # No. | Product Name | Attributes | Other (Detail) | Price ($) ]
  // are permanent direct columns in the table.
  // Optional columns that can be toggled on/off in the customizer:
  const PRINT_CUSTOM_COLUMNS = useMemo(
    () => [
      { id: 'sku', label: 'SKU' },
      { id: 'category', label: 'Category' },
      { id: 'stock', label: 'Qty' },
    ],
    []
  );
  const [activePrintCols, setActivePrintCols] = useState([]);

  const handleTogglePrintCol = (colId) => {
    setActivePrintCols((prev) =>
      prev.includes(colId) ? prev.filter((c) => c !== colId) : [...prev, colId]
    );
  };

  const printColWidths = useMemo(() => {
    // Permanent direct columns with optimal balanced weights:
    const weights = [
      { key: 'no', weight: 6 },
      { key: 'name', weight: 28 },
      { key: 'attributes', weight: 26 },
      { key: 'other', weight: 24 },
      { key: 'price', weight: 14 },
    ];
    // Optional toggleable columns:
    if (activePrintCols.includes('sku')) weights.push({ key: 'sku', weight: 13 });
    if (activePrintCols.includes('category')) weights.push({ key: 'category', weight: 15 });
    if (activePrintCols.includes('stock')) weights.push({ key: 'stock', weight: 11 });

    const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
    return weights.map((w) => `${((w.weight / totalWeight) * 100).toFixed(1)}%`);
  }, [activePrintCols]);

  const printSummary = useMemo(() => {
    const list = printableVariantRows || [];
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    let totalQty = 0;
    list.forEach((p) => {
      const q = Number(p.on_hand_qty ?? p.qty ?? 0);
      totalQty += q;
      if (q <= 0) outOfStock++;
      else if (q <= 10) lowStock++;
      else inStock++;
    });
    return {
      totalVariants: list.length,
      totalProducts: filteredRows.length,
      inStock,
      lowStock,
      outOfStock,
      totalQty,
    };
  }, [printableVariantRows, filteredRows]);

  // Request 3: Smart Pagination for True A4 Printable Pages (1188px height)
  // Page 1: 28 items (fully fills Page 1 down to the footer)
  // Page 2+: 33 items (fully fills subsequent detailed pages down to the footer)
  const PAGE_1_SIZE = 28;
  const SUBSEQUENT_PAGE_SIZE = 33;

  const printPages = useMemo(() => {
    const list = printableVariantRows || [];
    if (list.length === 0) return [[]];
    const pagesList = [];
    pagesList.push(list.slice(0, PAGE_1_SIZE));
    let i = PAGE_1_SIZE;
    while (i < list.length) {
      pagesList.push(list.slice(i, i + SUBSEQUENT_PAGE_SIZE));
      i += SUBSEQUENT_PAGE_SIZE;
    }
    return pagesList.length > 0 ? pagesList : [[]];
  }, [printableVariantRows]);

  const getItemGlobalNo = (pageNumber, itemIndex) => {
    if (pageNumber === 1) return itemIndex + 1;
    return PAGE_1_SIZE + (pageNumber - 2) * SUBSEQUENT_PAGE_SIZE + itemIndex + 1;
  };

  const stats = useMemo(() => {
    const lowStockCount = rows.filter((row) => {
      const qty = Number(row.qty ?? 0);
      return qty > 0 && qty <= 10;
    }).length;

    const outOfStockCount = rows.filter(
      (row) => Number(row.qty ?? 0) <= 0
    ).length;

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
        label: 'Brands',
        value: brands.length,
        helper: 'Product brands',
        icon: <LocalOfferOutlinedIcon fontSize="small" />,
        tone: 'brand',
      },
      {
        label: 'Low / Out Stock',
        value: (
          <span className="product-stat-dual-val">
            <span
              className={`product-stat-num ${lowStockCount > 0 ? 'product-stat-num--warning' : ''}`}
              title={`${lowStockCount} low stock (1-10 items)`}
            >
              {lowStockCount}
              <span className="product-stat-sub">Low</span>
            </span>
            <span className="product-stat-slash">/</span>
            <span
              className={`product-stat-num ${outOfStockCount > 0 ? 'product-stat-num--danger' : ''}`}
              title={`${outOfStockCount} out of stock (0 items)`}
            >
              {outOfStockCount}
              <span className="product-stat-sub">Out</span>
            </span>
          </span>
        ),
        helper: `${lowStockCount} low, ${outOfStockCount} out of stock`,
        icon: <WarningAmberOutlinedIcon fontSize="small" />,
        tone: outOfStockCount > 0 ? 'danger' : 'warning',
      },
    ];
  }, [rows, categories, brands, filteredRows.length]);



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
    <div className="product-page" ref={pageRef}>
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
            icon={<CloudSyncOutlinedIcon sx={{ fontSize: 18, color: '#10b981' }} />}
            responsiveCollapse
            onClick={handleSyncGoogleSheets}
            loading={syncingSheets}
            title="Sync all products to Google Sheets"
          >
            Google Sheet
          </Button>
          <Button
            variant="outline"
            icon={<PrintOutlinedIcon sx={{ fontSize: 18 }} />}
            responsiveCollapse
            onClick={() => setShowPrintModal(true)}
            title="Print or export PDF, Excel, and CSV report"
          >
            Print
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
                        handleSearchChange('');
                      }}
                      sx={{ padding: '2px', color: '#94a3b8' }}
                      aria-label="Clear search"
                    >
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  ) : null
                }
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
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
              onChange={handleCategoriesChange}
              maxTagsVisible={1}
              loading={loading && categoryOptions.length === 0}
            />

            <MultiSelect
              label="Brand"
              placeholder="Select Brand"
              options={brandOptions}
              selectedValues={selectedBrands}
              onChange={handleBrandsChange}
              maxTagsVisible={1}
              loading={loading && brandOptions.length === 0}
            />

            {(Boolean(search) || selectedCategories.length > 0 || selectedBrands.length > 0) && (
              <button
                type="button"
                className="product-filter-clear"
                onClick={handleClearAllFilters}
                title="Reset all filters"
                aria-label="Reset all filters"
              >
                <CloseIcon sx={{ fontSize: 13 }} />
                <span>Reset</span>
              </button>
            )}
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
              paginationModel={paginationModel}
              onPaginationModelChange={handlePaginationModelChange}
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
              rows={mobilePaginatedRows}
              onView={openViewModal}
              onEdit={canEdit ? openEditModal : undefined}
              onDelete={canDelete ? requestDelete : undefined}
            />

            {/* Mobile Bottom Pagination Bar */}
            {(!loading || rows.length > 0) && mobileTotalCount > 0 && (
              <div className="product-mobile-pagination">
                <div className="product-mobile-pagination__controls">
                  <button
                    type="button"
                    className="product-mobile-pagination__btn"
                    onClick={handleMobilePrevPage}
                    disabled={clampedMobilePage <= 1}
                    aria-label="Previous 25 products"
                  >
                    <ChevronLeftIcon sx={{ fontSize: 20 }} />
                    <span>Previous</span>
                  </button>

                  <div className="product-mobile-pagination__indicator">
                    Page {clampedMobilePage} / {mobileTotalPages}
                  </div>

                  <button
                    type="button"
                    className="product-mobile-pagination__btn"
                    onClick={handleMobileNextPage}
                    disabled={clampedMobilePage >= mobileTotalPages}
                    aria-label="Next 25 products"
                  >
                    <span>Next</span>
                    <ChevronRightIcon sx={{ fontSize: 20 }} />
                  </button>
                </div>

                <div className="product-mobile-pagination__summary">
                  Showing <strong>{mobileStartIndex + 1}–{mobileEndIndex}</strong> of <strong>{mobileTotalCount}</strong> products
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

      {/* Reusable A4 Print & PDF Preview Modal (Modeled after MoonPulse ExportModal) */}
      <PrintModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        title="Report Product Inventory"
        fileName={`Report_Products_${new Date().toISOString().split('T')[0]}`}
        optionalColumns={PRINT_CUSTOM_COLUMNS}
        selectedColumns={activePrintCols}
        onToggleColumn={handleTogglePrintCol}
        pages={printPages}
        onExportCsv={(cols) => {
          const targetCols = cols || activePrintCols;
          exportProductsToCsv(printableVariantRows, targetCols);
          showToast(`Exported ${printableVariantRows.length} variant items to CSV.`);
        }}
        onExportExcel={(cols) => {
          const targetCols = cols || activePrintCols;
          exportProductsToExcel(printableVariantRows, targetCols);
          showToast(`Exported ${printableVariantRows.length} variant items to Excel.`);
        }}
        renderPage={(pageRows, pageNumber, totalPages) => (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%', minHeight: '100%' }}>
            {/* Header: only on Page 1 */}
            {pageNumber === 1 && (
              <div style={{ marginBottom: '22px', paddingTop: '6px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '18px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={logo}
                      alt="Moon IMS Logo"
                      style={{
                        width: '42px',
                        height: '42px',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                        INVENTORY MANAGEMENT SYSTEM
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>Store & Catalog Operations</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '11.5px', color: '#64748b', lineHeight: 1.5 }}>
                    <div>កាលបរិច្ឆេទ ៖ {new Date().toLocaleDateString('km-KH')}</div>
                    <div>
                      ទំនិញសរុប ៖ <strong style={{ color: '#0f172a' }}>{filteredRows.length}</strong> មុខ ({printableVariantRows.length} វ៉ារ្យ៉ង់)
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'center', padding: '6px 0 10px' }}>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '20px',
                      fontWeight: 800,
                      color: '#0f172a',
                      textTransform: 'uppercase',
                      letterSpacing: '0.02em',
                    }}
                  >
                    REPORT PRODUCT INVENTORY
                  </h3>
                </div>
              </div>
            )}

            {/* DETAILED PRODUCTS TABLE */}
            <div style={{ flex: 1 }}>
              <table className="print-report-table" style={{ marginTop: 0 }}>
                <colgroup>
                  {printColWidths.map((w, idx) => (
                    <col key={idx} style={{ width: w }} />
                  ))}
                </colgroup>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'center' }}>No.</th>
                    <th>Name</th>
                    <th>Attributes</th>
                    <th style={{ textAlign: 'center' }}>Other</th>
                    <th style={{ textAlign: 'right' }}>Price</th>
                    {activePrintCols.includes('sku') && <th>SKU</th>}
                    {activePrintCols.includes('category') && <th>Category</th>}
                    {activePrintCols.includes('stock') && (
                      <th style={{ textAlign: 'right' }}>Stock</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((item, idx) => {
                    const globalNo = getItemGlobalNo(pageNumber, idx);
                    const formattedAttrs = formatVariantAttributes(item);
                    const detail = (item.other && String(item.other).trim()) || '-';
                    const price = Number(item.unit_price ?? item.price ?? 0);
                    const stock = Number(item.on_hand_qty ?? item.qty ?? 0);

                    return (
                      <tr key={item.variant_id || item.id || idx}>
                        <td style={{ color: '#475569', textAlign: 'center', fontWeight: 500 }}>{globalNo}</td>
                        <td style={{ fontWeight: 600, color: '#0f172a' }}>
                          {item.product_name || item.name}
                        </td>
                        <td style={{ color: '#334155' }}>{formattedAttrs}</td>
                        <td style={{ textAlign: 'center', color: '#94a3b8' }}>{detail}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>
                          ${price.toFixed(2)}
                        </td>
                        {activePrintCols.includes('sku') && (
                          <td style={{ color: '#475569', fontWeight: 500 }}>
                            {item.sku || '—'}
                          </td>
                        )}
                        {activePrintCols.includes('category') && (
                          <td style={{ color: '#64748b' }}>{item.category_name || item.category || '—'}</td>
                        )}
                        {activePrintCols.includes('stock') && (
                          <td
                            style={{
                              textAlign: 'right',
                              fontWeight: 700,
                              color: stock <= 0 ? '#ef4444' : '#0f172a',
                            }}
                          >
                            {stock}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
                {pageNumber === totalPages && (
                  <tfoot>
                    <tr>
                      <td colSpan={2} style={{ fontWeight: 700, color: '#0f172a' }}>
                        Total ({printableVariantRows.length} variants)
                      </td>
                      <td>—</td>
                      <td style={{ textAlign: 'center' }}>—</td>
                      <td>—</td>
                      {activePrintCols.includes('sku') && <td>—</td>}
                      {activePrintCols.includes('category') && <td>—</td>}
                      {activePrintCols.includes('stock') && (
                        <td style={{ textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                          {printSummary.totalQty}
                        </td>
                      )}
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* Sub-page footer */}
            <div
              style={{
                marginTop: 'auto',
                paddingTop: '16px',
                paddingBottom: '4px',
                display: 'flex',
                justifyContent: 'flex-end',
                fontSize: '11px',
                color: '#94a3b8',
              }}
            >
              <span>
                Page {pageNumber} of {totalPages}
              </span>
            </div>
          </div>
        )}
      />
    </div>
  );
};

export default ProductPage;
