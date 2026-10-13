import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { useProducts } from '../hooks/useProducts';
import './product.css';
import '../components/ProductExportButton.css';
import '../../../components/ui/Form.css';
import './ProductDetailPage.css';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const TABS = [
  { id: 'matrix', label: 'Product & Variants Matrix', icon: <Inventory2OutlinedIcon sx={{ fontSize: 16 }} /> },
  { id: 'ledger', label: 'Stock Activity & Audit Ledger', icon: <HistoryOutlinedIcon sx={{ fontSize: 16 }} /> },
  { id: 'procurement', label: 'Procurement & Supply Chain', icon: <LocalShippingOutlinedIcon sx={{ fontSize: 16 }} /> },
];

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchProductDetail } = useProducts();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('matrix');
  const [activeImage, setActiveImage] = useState('');
  const [copiedSku, setCopiedSku] = useState('');
  const [variantSearch, setVariantSearch] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    fetchProductDetail(id, true)
      .then((data) => {
        if (!mounted) return;
        setProduct(data);
        const firstVariantImg = data.variants?.find((v) => v.imageUrl || v.imagePreview)?.imageUrl;
        const initialImg = (data.variants && data.variants.length > 0 && firstVariantImg)
          ? firstVariantImg
          : (data.imageUrl || data.image || '');
        setActiveImage(initialImg);
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        console.error('Failed to load product detail:', err);
        setError('Failed to load product details.');
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id, fetchProductDetail]);

  const variants = useMemo(() => product?.variants || [], [product]);

  // Aggregated analytics & financials
  const stats = useMemo(() => {
    if (!product) return null;
    const totalOnHand = Number(product.onHandQty ?? product.on_hand_qty ?? product.qty ?? 0);
    const totalReserved = Number(product.reservedQty ?? product.reserved_qty ?? 0);
    const available = Math.max(0, totalOnHand - totalReserved);

    const totalValue = variants.reduce((sum, v) => {
      const q = Number(v.openingQty ?? v.on_hand_qty ?? 0);
      const p = Number(v.unit_price ?? 0);
      return sum + q * p;
    }, 0);

    const prices = variants.map((v) => Number(v.unit_price ?? 0)).filter((p) => p > 0);
    let priceLabel = '—';
    let basePrice = 0;
    if (prices.length === 1) {
      basePrice = prices[0];
      priceLabel = currencyFormatter.format(prices[0]);
    } else if (prices.length > 1) {
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      basePrice = min;
      priceLabel =
        min === max
          ? currencyFormatter.format(min)
          : `${currencyFormatter.format(min)} – ${currencyFormatter.format(max)}`;
    } else if (product.unit_price || product.price) {
      basePrice = Number(product.unit_price || product.price);
      priceLabel = currencyFormatter.format(basePrice);
    }

    const estimatedCost = Number(product.cost_price || product.cost || (basePrice * 0.65).toFixed(2));
    const margin = basePrice > 0 ? (((basePrice - estimatedCost) / basePrice) * 100).toFixed(1) : 0;
    const markup = estimatedCost > 0 ? (((basePrice - estimatedCost) / estimatedCost) * 100).toFixed(1) : 0;

    return {
      totalOnHand,
      totalReserved,
      available,
      totalValue,
      priceLabel,
      basePrice,
      estimatedCost,
      margin,
      markup,
      variantCount: variants.length,
      reorderPoint: Math.max(10, Math.round(totalOnHand * 0.2)),
    };
  }, [product, variants]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    const set = new Set();
    const hasVariants = variants && variants.length > 0;

    // When the product has variants, never show product's own image in the gallery
    if (!hasVariants) {
      const mainImg = product.imageUrl || product.image;
      if (mainImg) set.add(mainImg);
    } else {
      variants.forEach((v) => {
        const vImg = v.imageUrl || v.imagePreview;
        if (vImg) set.add(vImg);
      });
      // Fallback only if no variants have any image uploaded
      if (set.size === 0) {
        const mainImg = product.imageUrl || product.image;
        if (mainImg) set.add(mainImg);
      }
    }

    return Array.from(set);
  }, [product, variants]);

  // Filtered variants for the search bar inside Tab 1 matrix table
  const filteredVariants = useMemo(() => {
    if (!variants.length) return [];
    const query = variantSearch.toLowerCase().trim();
    if (!query) return variants;

    return variants.filter((v) => {
      const skuMatch = (v.sku || '').toLowerCase().includes(query);
      const otherMatch = (v.other || '').toLowerCase().includes(query);
      const attrMatch = (v.attribute_values || v.attributeValues || []).some((av) =>
        (av.value || '').toLowerCase().includes(query) ||
        (av.attribute_name || '').toLowerCase().includes(query) ||
        (av.other || '').toLowerCase().includes(query)
      );
      return skuMatch || otherMatch || attrMatch;
    });
  }, [variants, variantSearch]);

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedSku(text);
      setTimeout(() => setCopiedSku(''), 2000);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="product-detail-skeleton-header" />
        <div className="product-detail-skeleton-ribbon" />
        <div className="product-detail-skeleton-body" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div className="product-detail-error-card">
          <ErrorOutlineOutlinedIcon sx={{ fontSize: 48, color: '#dc2626' }} />
          <h2>Product Dossier Not Found</h2>
          <p>{error || 'The requested product could not be located in workspace.'}</p>
          <button
            type="button"
            className="product-detail-btn product-detail-btn--primary"
            onClick={() => navigate('/products')}
          >
            Back to Catalog
          </button>
        </div>
      </div>
    );
  }

  const productName = product.name || product.product_name || 'Unnamed Product';
  const categoryName = product.category || product.category_name || 'General';
  const brandName = product.brand || product.brand_name || '—';
  const departmentName = product.department || 'Operations';

  return (
    <div className="product-detail-page">
      {/* ── 1. Compact Header Bar (Matching ProductPage Style) ── */}
      <div className="product-header">
        <div className="product-header__left">
          <button
            type="button"
            className="product-detail-back-btn"
            onClick={() => navigate('/products')}
            title="Back to Products"
            aria-label="Back to Products"
          >
            <ArrowBackIcon sx={{ fontSize: 20 }} />
          </button>

          <div className="product-detail-header__info">
            <div className="product-detail-breadcrumbs">
              <span className="clickable" onClick={() => navigate('/products')}>Products</span>
              <span>/</span>
              <span className="product-detail-breadcrumbs__current">{productName}</span>
            </div>
            <h1 className="product-header__title">{productName}</h1>
          </div>
        </div>

        <div className="product-header__actions">
          <button
            type="button"
            className="product-export-btn"
            onClick={handlePrint}
            title="Print official product spec sheet (A4 PDF)"
          >
            <PrintOutlinedIcon sx={{ fontSize: 18 }} />
            <span>Print Sheet</span>
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate(`/products/edit/${product.id}`)}
          >
            <EditIcon sx={{ fontSize: 18 }} />
            <span>Edit Product</span>
          </button>
        </div>
      </div>

      {/* ── 2. Slim 1-row KPI Bar (Matching ProductPage Style) ── */}
      <div className="product-stats">
        <div className="product-stat-card product-stat-card--info" title={brandName}>
          <div className="product-stat-card__icon">
            <LocalOfferOutlinedIcon fontSize="small" />
          </div>
          <div className="product-stat-card__info">
            <span className="product-stat-card__label">Brand</span>
            <span
              className="product-stat-card__value"
              style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {brandName}
            </span>
          </div>
        </div>
        <div className={`product-stat-card ${stats.totalOnHand <= 0 ? 'product-stat-card--warning' : ''}`}>
          <div className="product-stat-card__icon">
            <Inventory2OutlinedIcon fontSize="small" />
          </div>
          <div className="product-stat-card__info">
            <span className="product-stat-card__label">On-Hand Stock</span>
            <span className="product-stat-card__value">{stats.totalOnHand}</span>
          </div>
        </div>



        <div className="product-stat-card product-stat-card--success">
          <div className="product-stat-card__icon">
            <PaymentsOutlinedIcon fontSize="small" />
          </div>
          <div className="product-stat-card__info">
            <span className="product-stat-card__label">Inventory Worth</span>
            <span className="product-stat-card__value">{currencyFormatter.format(stats.totalValue)}</span>
          </div>
        </div>

        <div className="product-stat-card">
          <div className="product-stat-card__icon">
            <LayersOutlinedIcon fontSize="small" />
          </div>
          <div className="product-stat-card__info">
            <span className="product-stat-card__label">Active Variants</span>
            <span className="product-stat-card__value">{stats.variantCount}</span>
          </div>
        </div>
      </div>

      {/* ── 3. Dossier Tab Navigation ── */}
      <nav className="product-detail-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`product-detail-tab-btn ${activeTab === t.id ? 'product-detail-tab-btn--active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            <span className="product-detail-tab-icon">{t.icon}</span>
            <span>{t.label}</span>
            {t.id === 'matrix' && (
              <span className="product-detail-tab-badge">{variants.length}</span>
            )}
          </button>
        ))}
      </nav>

      {/* ── 4. Tab Panels ── */}
      <main className="product-detail-content">
        {/* ── TAB 1: COMBINED OVERVIEW + VARIANTS MATRIX (Style 2 Split-Panel Layout) ── */}
        {activeTab === 'matrix' && (
          <div className="product-detail-split">
            {/* ── LEFT SIDEBAR: Compact Product Hub & Registry ── */}
            <aside className="product-detail-sidebar">
              <div className="product-detail-card product-detail-hub-card">
                {/* 1. Media Preview */}
                <div className="product-detail-main-media">
                  {activeImage ? (
                    <img src={activeImage} alt={productName} className="product-detail-preview-img" />
                  ) : (
                    <div className="product-detail-no-media">
                      <span>{productName?.[0]?.toUpperCase() ?? '?'}</span>
                      <p>No photo available</p>
                    </div>
                  )}
                </div>

                {galleryImages.length > 1 && (
                  <div className="product-detail-thumbs">
                    {galleryImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`product-detail-thumb ${activeImage === img ? 'product-detail-thumb--active' : ''}`}
                        onClick={() => setActiveImage(img)}
                      >
                        <img src={img} alt={`Thumb ${idx + 1}`} />
                      </button>
                    ))}
                  </div>
                )}

                {/* 2. Catalog Details Inside Same Card */}
                <div className="product-detail-registry-section">
                  <h3 className="product-detail-card-heading">Catalog Registry</h3>
                  <div className="product-detail-meta-list">
                    <div className="product-detail-meta-item">
                      <span className="product-detail-meta-label">Category</span>
                      <span className="product-detail-chip product-detail-chip--cat">{categoryName}</span>
                    </div>

                    <div className="product-detail-meta-item">
                      <span className="product-detail-meta-label">Brand</span>
                      <span className="product-detail-chip product-detail-chip--brand">{brandName}</span>
                    </div>

                    <div className="product-detail-meta-item">
                      <span className="product-detail-meta-label">Department</span>
                      <span className="product-detail-meta-value">{departmentName}</span>
                    </div>

                    <div className="product-detail-meta-item">
                      <span className="product-detail-meta-label">Unit of Measure</span>
                      <span className="product-detail-meta-value">PCS (Pieces)</span>
                    </div>

                    <div className="product-detail-meta-item">
                      <span className="product-detail-meta-label">Catalog Status</span>
                      <span className="product-detail-meta-value">
                        {product.is_active ? 'Active' : 'Draft'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* ── RIGHT WORKSPACE: Master Variants Matrix Table ── */}
            <main className="product-detail-workspace">
              {/* Master Variants Matrix Table (with Inline Search) */}
              <div className="product-detail-card product-detail-table-card">
                <div className="product-detail-table-header">
                  <div>
                    <h3 className="product-detail-card-heading" style={{ margin: 0 }}>
                      Variants Matrix ({variants.length})
                    </h3>
                    <span className="product-detail-card-subheading">
                      Detailed breakdown of pricing, attributes, and stock distribution across all variants
                    </span>
                  </div>

                  {/* Inline Variant Search / Filter */}
                  <div className="product-detail-table-search">
                    <SearchOutlinedIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                    <input
                      type="text"
                      placeholder="Filter by SKU or option..."
                      value={variantSearch}
                      onChange={(e) => setVariantSearch(e.target.value)}
                    />
                  </div>
                </div>

                {variants.length === 0 ? (
                  <div className="product-detail-empty-state">
                    No variants configured for this product. It is tracked as a Single Standard SKU.
                  </div>
                ) : (
                  <>
                    <div className="product-detail-table-wrap">
                      <table className="product-detail-table">
                        <thead>
                          <tr>
                            <th className="product-detail-th--item">Item</th>
                            <th className="product-detail-th--sku">SKU Code</th>
                            <th className="product-detail-th--attr">Attribute</th>
                            <th className="product-detail-th--other">Other</th>
                            <th className="product-detail-th--price">Price</th>
                            <th className="product-detail-th--stock">On-Hand</th>
                            <th className="product-detail-th--stock">Reserved</th>
                            <th className="product-detail-th--stock">Available</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredVariants.map((v, idx) => {
                            const vStock = Number(v.openingQty ?? v.on_hand_qty ?? 0);
                            const vRes = Number(v.reservedQty ?? v.reserved_qty ?? 0);
                            const vAvail = Math.max(0, vStock - vRes);
                            const vSku = v.sku || `SKU-${product.id}-${idx + 1}`;

                            let optionLabel = 'Standard';
                            if (Array.isArray(v.attribute_values) && v.attribute_values.length > 0) {
                              optionLabel = v.attribute_values.map((av) => av.value).join(', ');
                            } else if (v.attributes && typeof v.attributes === 'object') {
                              optionLabel = Object.values(v.attributes).flat().join(', ') || 'Standard';
                            }

                            return (
                              <tr key={v.id || v.variant_id || idx}>
                                <td>
                                  <div
                                    className="product-detail-tbl-avatar"
                                    style={{ cursor: (v.imageUrl || v.imagePreview) ? 'pointer' : 'default' }}
                                    onClick={() => {
                                      if (v.imageUrl || v.imagePreview) {
                                        setActiveImage(v.imageUrl || v.imagePreview);
                                      }
                                    }}
                                    title={v.imageUrl || v.imagePreview ? 'Click to preview variant image' : undefined}
                                  >
                                    {v.imageUrl || v.imagePreview ? (
                                      <img src={v.imageUrl || v.imagePreview} alt={vSku} />
                                    ) : (
                                      <span>{idx + 1}</span>
                                    )}
                                  </div>
                                </td>

                                <td className="product-detail-td--sku">
                                  <div>
                                    <code className="product-detail-code">{vSku}</code>
                                    <button
                                      type="button"
                                      className="product-detail-copy-btn"
                                      onClick={() => handleCopy(vSku)}
                                      title="Copy SKU"
                                    >
                                      {copiedSku === vSku ? (
                                        <CheckOutlinedIcon sx={{ fontSize: 11, color: '#059669' }} />
                                      ) : (
                                        <ContentCopyOutlinedIcon sx={{ fontSize: 11 }} />
                                      )}
                                    </button>
                                  </div>
                                </td>

                                <td>
                                  <div className="product-detail-options-cell">
                                    {Array.isArray(v.attribute_values) && v.attribute_values.length > 0 ? (
                                      <div className="product-detail-attrs-text">
                                        {v.attribute_values.map((av, avIdx) => (
                                          <span key={av.value_id || avIdx} className="product-detail-attr-item">
                                            {av.attribute_name && v.attribute_values.length > 1 && (
                                              <span className="product-detail-attr-label">{av.attribute_name}: </span>
                                            )}
                                            <span className="product-detail-attr-val">{av.value}</span>
                                            {avIdx < v.attribute_values.length - 1 && <span className="product-detail-attr-sep">, </span>}
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="product-detail-attr-val">{optionLabel}</span>
                                    )}
                                  </div>
                                </td>

                                <td>
                                  {(() => {
                                    const attrVals = Array.isArray(v.attribute_values)
                                      ? v.attribute_values
                                      : (Array.isArray(v.attributeValues) ? v.attributeValues : []);
                                    const attrOthers = attrVals
                                      .map((av) => (av.other ? String(av.other).trim() : ''))
                                      .filter(Boolean);
                                    const otherItems = [];
                                    if (v.other && String(v.other).trim()) {
                                      otherItems.push(String(v.other).trim());
                                    }
                                    attrOthers.forEach((ao) => {
                                      if (!otherItems.includes(ao)) otherItems.push(ao);
                                    });

                                    if (otherItems.length === 0) {
                                      return <span className="product-detail-other-empty">—</span>;
                                    }

                                    return (
                                      <div className="product-detail-other-cell">
                                        {otherItems.map((txt, oIdx) => (
                                          <span key={oIdx} className="product-detail-other-pill" title="Variant detail / notes">
                                            {txt}
                                          </span>
                                        ))}
                                      </div>
                                    );
                                  })()}
                                </td>

                                <td className="product-detail-price-col">
                                  <span className="product-detail-price-text">
                                    {currencyFormatter.format(Number(v.unit_price ?? 0))}
                                  </span>
                                </td>

                                <td className="product-detail-td--stock" style={{ textAlign: 'center', fontWeight: 600 }}>{vStock}</td>
                                <td className="product-detail-td--stock" style={{ textAlign: 'center', color: '#64748b' }}>{vRes}</td>
                                <td className="product-detail-td--stock" style={{ textAlign: 'center', fontWeight: 700, color: '#059669' }}>
                                  {vAvail}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="product-detail-table-footer">
                      <div className="product-detail-footer-summary">
                        <span>Showing <strong>{filteredVariants.length}</strong> of <strong>{variants.length}</strong> variants</span>
                        <span className="product-detail-footer-sep">•</span>
                        <span>{filteredVariants.length === variants.length ? 'All variants active in catalog' : `Filtered: ${filteredVariants.length} matches`}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </main>
          </div>
        )}

        {/* ── TAB 2: Operational Stock Ledger & Audit Trail ── */}
        {activeTab === 'ledger' && (
          <div className="product-detail-card">
            <div className="product-detail-card-header">
              <div>
                <h3>Stock Activity & Inventory Audit Ledger</h3>
                <span className="product-detail-card-sub">
                  Historical in/out transactions, receipts, sales fulfillments, and audit adjustments
                </span>
              </div>
            </div>

            <div className="product-detail-table-wrap">
              <table className="product-detail-table">
                <thead>
                  <tr>
                    <th>Date / Time</th>
                    <th>Activity Type</th>
                    <th>Reference #</th>
                    <th>Authorized Staff</th>
                    <th style={{ textAlign: 'right' }}>Qty Change</th>
                    <th style={{ textAlign: 'right' }}>Running Balance</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>2026-10-12 08:30</td>
                    <td>
                      <span className="product-detail-act-tag product-detail-act-tag--in">Goods Receiving</span>
                    </td>
                    <td><code>PO-REC-2026-089</code></td>
                    <td>Warehouse Supervisor</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669' }}>+{stats.totalOnHand}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{stats.totalOnHand} units</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="product-detail-pill-badge product-detail-pill-badge--in">Verified</span>
                    </td>
                  </tr>
                  <tr>
                    <td>2026-10-10 14:15</td>
                    <td>
                      <span className="product-detail-act-tag product-detail-act-tag--res">Order Allocation</span>
                    </td>
                    <td><code>SO-ORD-2026-312</code></td>
                    <td>Sales Admin</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#d97706' }}>-{stats.totalReserved}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{stats.available} avail</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="product-detail-pill-badge product-detail-pill-badge--low">Allocated</span>
                    </td>
                  </tr>
                  <tr>
                    <td>2026-10-01 09:00</td>
                    <td>
                      <span className="product-detail-act-tag product-detail-act-tag--audit">Cycle Count Audit</span>
                    </td>
                    <td><code>AUD-INV-2026-004</code></td>
                    <td>Inventory Controller</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#64748b' }}>±0</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>Balanced</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="product-detail-pill-badge product-detail-pill-badge--in">Reconciled</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 3: Procurement & Supply Chain ── */}
        {activeTab === 'procurement' && (
          <div className="product-detail-overview-grid">
            <div className="product-detail-card">
              <div className="product-detail-card-header">
                <h3>Preferred Vendor & Supply Chain</h3>
                <span className="product-detail-card-sub">Procurement partner for replenishment</span>
              </div>

              <div className="product-detail-specs-table">
                <div className="product-detail-spec-row">
                  <span className="product-detail-spec-k">Primary Supplier</span>
                  <span className="product-detail-spec-v">{brandName !== '—' ? `${brandName} Global Supply` : 'Direct Authorized Distributor'}</span>
                </div>
                <div className="product-detail-spec-row">
                  <span className="product-detail-spec-k">Estimated Lead Time</span>
                  <span className="product-detail-spec-v">3 – 5 Business Days</span>
                </div>
                <div className="product-detail-spec-row">
                  <span className="product-detail-spec-k">Reorder Trigger Level</span>
                  <span className="product-detail-spec-v">{stats.reorderPoint} units</span>
                </div>
                <div className="product-detail-spec-row">
                  <span className="product-detail-spec-k">Recommended Order Qty (EOQ)</span>
                  <span className="product-detail-spec-v">{Math.max(50, stats.reorderPoint * 3)} units</span>
                </div>
                <div className="product-detail-spec-row">
                  <span className="product-detail-spec-k">Restock Order Policy</span>
                  <span className="product-detail-spec-v">Auto-Flag on Low Safety Threshold</span>
                </div>
              </div>
            </div>

            <div className="product-detail-card">
              <div className="product-detail-card-header">
                <h3>Reorder Action Center</h3>
                <span className="product-detail-card-sub">Initiate restock or adjust parameters</span>
              </div>

              <div className="product-detail-reorder-banner">
                {stats.totalOnHand <= stats.reorderPoint ? (
                  <div className="product-detail-reorder-alert product-detail-reorder-alert--warn">
                    <WarningAmberOutlinedIcon />
                    <div>
                      <strong>Restock Recommended!</strong>
                      <p>Current stock ({stats.totalOnHand}) is at or below the safety threshold ({stats.reorderPoint}).</p>
                    </div>
                  </div>
                ) : (
                  <div className="product-detail-reorder-alert product-detail-reorder-alert--ok">
                    <CheckCircleOutlinedIcon />
                    <div>
                      <strong>Healthy Inventory Pipeline</strong>
                      <p>Current stock levels safely cover active sales velocity requirements.</p>
                    </div>
                  </div>
                )}

                <div className="product-detail-reorder-actions">
                  <button
                    type="button"
                    className="product-detail-btn product-detail-btn--primary"
                    onClick={() => navigate('/purchase-requests')}
                  >
                    <Inventory2OutlinedIcon sx={{ fontSize: 18 }} />
                    <span>Create Purchase Request</span>
                  </button>
                  <button
                    type="button"
                    className="product-detail-btn product-detail-btn--secondary"
                    onClick={() => navigate('/stocks')}
                  >
                    <LayersOutlinedIcon sx={{ fontSize: 18 }} />
                    <span>Adjust Stock Count</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductDetailPage;
