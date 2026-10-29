import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ImageNotSupportedOutlinedIcon from '@mui/icons-material/ImageNotSupportedOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { IconButton } from '@mui/material';
import Button from '../../../components/ui/Button/Button';
import Input from '../../../components/ui/Input/Input';
import { useProducts } from '../hooks/useProducts';
import { useAuth } from '../../auth/hooks/useAuth';
import ProductDetailSkeleton from '../components/ProductDetailSkeleton';
import './product.css';
import '../../../components/ui/Form.css';
import './ProductDetailPage.css';


const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const TABS = [
  {
    id: 'matrix',
    label: 'Product & Variants Matrix',
    icon: <Inventory2OutlinedIcon sx={{ fontSize: 16 }} />,
    roles: ['admin', 'manager', 'staff', 'worker'],
  },
  {
    id: 'ledger',
    label: 'Stock Activity & Audit Ledger',
    icon: <HistoryOutlinedIcon sx={{ fontSize: 16 }} />,
    roles: ['admin', 'manager', 'staff'],
  },
  {
    id: 'procurement',
    label: 'Procurement & Supply Chain',
    icon: <LocalShippingOutlinedIcon sx={{ fontSize: 16 }} />,
    roles: ['admin', 'manager', 'staff'],
  },
];

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchProductDetail } = useProducts();
  const { user } = useAuth();
  const userRole = (user?.role || 'staff').toLowerCase();
  const canEdit = ['admin', 'manager', 'staff', 'worker'].includes(userRole);

  const availableTabs = useMemo(() => {
    return TABS.filter((tab) => !tab.roles || tab.roles.includes(userRole));
  }, [userRole]);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('matrix');
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [copiedSku, setCopiedSku] = useState('');
  const [variantSearch, setVariantSearch] = useState('');
  const [slideDirection, setSlideDirection] = useState('next');
  const [animMode, setAnimMode] = useState('drag'); // 'slide' (Option 1) vs 'fade' (Option 2) vs 'drag' (Option 3)
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!availableTabs.some((t) => t.id === activeTab)) {
      setActiveTab(availableTabs[0]?.id || 'matrix');
    }
  }, [availableTabs, activeTab]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    fetchProductDetail(id, true)
      .then((data) => {
        if (!mounted) return;
        setProduct(data);
        const variantList = data.variants || [];
        const initialVarWithImg = variantList.find((v) => v.imageUrl || v.imagePreview);
        const defaultVar = initialVarWithImg || variantList[0] || null;

        if (defaultVar) {
          setSelectedVariantId(defaultVar.id || defaultVar.variant_id);
          setActiveImage(defaultVar.imageUrl || defaultVar.imagePreview || '');
        } else {
          setSelectedVariantId(null);
          setActiveImage(data.imageUrl || data.image || '');
        }
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

  const selectedVariant = useMemo(() => {
    if (!variants.length) return null;
    return variants.find((v) => (v.id || v.variant_id) === selectedVariantId) || variants[0] || null;
  }, [variants, selectedVariantId]);

  const selectedVariantIndex = useMemo(() => {
    if (!variants.length || !selectedVariant) return 0;
    const idx = variants.findIndex(
      (v) => (v.id || v.variant_id) === (selectedVariant.id || selectedVariant.variant_id)
    );
    return idx >= 0 ? idx + 1 : 1;
  }, [variants, selectedVariant]);

  const selectedVariantData = useMemo(() => {
    if (!selectedVariant) return null;
    const stock = Number(selectedVariant.openingQty ?? selectedVariant.on_hand_qty ?? 0);
    const reserved = Number(selectedVariant.reservedQty ?? selectedVariant.reserved_qty ?? 0);
    const available = Math.max(0, stock - reserved);
    const sku = selectedVariant.sku || (product ? `SKU-${product.id}-${selectedVariantIndex}` : '—');
    const price = Number(selectedVariant.unit_price ?? 0);

    let optionLabel = '';
    if (Array.isArray(selectedVariant.attribute_values) && selectedVariant.attribute_values.length > 0) {
      optionLabel = selectedVariant.attribute_values.map((av) => av.value).join(', ');
    } else if (selectedVariant.attributes && typeof selectedVariant.attributes === 'object') {
      optionLabel = Object.values(selectedVariant.attributes).flat().join(', ');
    }

    const attrVals = Array.isArray(selectedVariant.attribute_values)
      ? selectedVariant.attribute_values
      : (Array.isArray(selectedVariant.attributeValues) ? selectedVariant.attributeValues : []);
    const attrOthers = attrVals
      .map((av) => (av.other ? String(av.other).trim() : ''))
      .filter(Boolean);
    const otherItems = [];
    if (selectedVariant.other && String(selectedVariant.other).trim()) {
      otherItems.push(String(selectedVariant.other).trim());
    }
    attrOthers.forEach((ao) => {
      if (!otherItems.includes(ao)) otherItems.push(ao);
    });

    return {
      stock,
      reserved,
      available,
      sku,
      price,
      optionLabel: optionLabel || 'Standard Option',
      attributes: attrVals,
      otherItems,
    };
  }, [selectedVariant, product, selectedVariantIndex]);

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

  const previewItems = useMemo(() => {
    if (!product) return [];
    if (variants.length > 0) {
      return variants.map((v, idx) => {
        let optionLabel = '';
        if (Array.isArray(v.attribute_values) && v.attribute_values.length > 0) {
          optionLabel = v.attribute_values.map((av) => av.value).join(', ');
        } else if (v.attributes && typeof v.attributes === 'object') {
          optionLabel = Object.values(v.attributes).flat().join(', ');
        }

        const sku = v.sku || `SKU-${product.id}-${idx + 1}`;
        const img = v.imageUrl || v.imagePreview || null;

        return {
          id: v.id || v.variant_id || idx,
          variant: v,
          sku,
          optionLabel,
          imageUrl: img,
        };
      });
    }

    const mainImg = product.imageUrl || product.image;
    if (mainImg) {
      return [{
        id: 'main-product',
        variant: null,
        sku: product.sku || product.product_code || '',
        optionLabel: '',
        imageUrl: mainImg,
      }];
    }

    return [];
  }, [product, variants]);

  const handleSelectVariant = (v, direction) => {
    if (!v) return;
    const vId = v.id || v.variant_id;
    if (direction) {
      setSlideDirection(direction);
    } else {
      const targetIdx = variants.findIndex((item) => (item.id || item.variant_id) === vId);
      const currIdx = variants.findIndex((item) => (item.id || item.variant_id) === selectedVariantId);
      if (targetIdx !== -1 && currIdx !== -1 && targetIdx !== currIdx) {
        setSlideDirection(targetIdx > currIdx ? 'next' : 'prev');
      }
    }
    setSelectedVariantId(vId);
    const variantImg = v.imageUrl || v.imagePreview;
    setActiveImage(variantImg || product?.imageUrl || product?.image || '');
  };

  // Compute currently active index within previewItems
  const activePreviewIndex = useMemo(() => {
    if (!previewItems.length) return 0;
    const idx = previewItems.findIndex((item) =>
      selectedVariantId ? item.id === selectedVariantId : activeImage === item.imageUrl
    );
    return idx >= 0 ? idx : 0;
  }, [previewItems, selectedVariantId, activeImage]);

  const handleSelectByIndex = (targetIdx, forcedDir) => {
    if (!previewItems.length) return;
    const boundedIdx = (targetIdx + previewItems.length) % previewItems.length;
    const dir = forcedDir || (boundedIdx >= activePreviewIndex ? 'next' : 'prev');
    setSlideDirection(dir);
    const targetItem = previewItems[boundedIdx];
    if (targetItem) {
      if (targetItem.variant) {
        handleSelectVariant(targetItem.variant, dir);
      } else {
        setActiveImage(targetItem.imageUrl || '');
      }
    }
  };

  const handleNextVariant = () => {
    if (previewItems.length <= 1) return;
    handleSelectByIndex(activePreviewIndex + 1, 'next');
  };

  const handlePrevVariant = () => {
    if (previewItems.length <= 1) return;
    handleSelectByIndex(activePreviewIndex - 1, 'prev');
  };

  // Touch Swipe & Mouse Drag gesture state refs
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const mouseDragRef = useRef({ isDown: false, startX: 0, moved: false });

  // Mobile Touch Swipe Handlers (Horizontal gesture detection with real-time tracking)
  const handleTouchStart = (e) => {
    if (e.touches && e.touches[0]) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };
      setDragOffset(0);
      setIsDragging(false);
    }
  };

  const handleTouchMove = (e) => {
    if (previewItems.length <= 1) return;
    if (e.touches && e.touches[0]) {
      const deltaX = e.touches[0].clientX - touchStartRef.current.x;
      const deltaY = e.touches[0].clientY - touchStartRef.current.y;
      if (Math.abs(deltaX) > 6 && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (animMode === 'drag') {
          setDragOffset(deltaX);
          setIsDragging(true);
        }
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (e.changedTouches && e.changedTouches[0]) {
      const deltaX = touchStartRef.current.x - e.changedTouches[0].clientX;
      const deltaY = touchStartRef.current.y - e.changedTouches[0].clientY;
      const deltaTime = Date.now() - touchStartRef.current.time;

      if (animMode === 'drag') {
        setIsDragging(false);
        if (dragOffset < -42) {
          handleNextVariant();
        } else if (dragOffset > 42) {
          handlePrevVariant();
        }
        setDragOffset(0);
      } else {
        if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY) && deltaTime < 650) {
          if (deltaX > 0) {
            handleNextVariant();
          } else {
            handlePrevVariant();
          }
        }
      }
    }
  };

  // PC Mouse Drag Handlers (Real-time physics tracking + click-and-drag)
  const handleMouseDown = (e) => {
    if (e.button !== 0 || previewItems.length <= 1) return;
    mouseDragRef.current = {
      isDown: true,
      startX: e.clientX,
      moved: false,
    };
    setDragOffset(0);
    if (animMode === 'drag') {
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e) => {
    if (!mouseDragRef.current.isDown) return;
    const deltaX = e.clientX - mouseDragRef.current.startX;
    if (Math.abs(deltaX) > 4) {
      mouseDragRef.current.moved = true;
      if (animMode === 'drag') {
        setDragOffset(deltaX);
      }
    }
  };

  const handleMouseUp = (e) => {
    if (!mouseDragRef.current.isDown) return;
    const deltaX = mouseDragRef.current.startX - e.clientX;
    const wasMoved = mouseDragRef.current.moved;
    mouseDragRef.current.isDown = false;
    setIsDragging(false);

    if (animMode === 'drag') {
      if (dragOffset < -42) {
        handleNextVariant();
      } else if (dragOffset > 42) {
        handlePrevVariant();
      }
      setDragOffset(0);
    } else {
      if (wasMoved && Math.abs(deltaX) > 40) {
        if (deltaX > 0) {
          handleNextVariant();
        } else {
          handlePrevVariant();
        }
      }
    }
  };

  const handleMouseLeave = () => {
    mouseDragRef.current.isDown = false;
    setIsDragging(false);
    setDragOffset(0);
  };

  // PC Keyboard Arrow Navigation
  const handleMediaKeyDown = (e) => {
    if (previewItems.length <= 1) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrevVariant();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNextVariant();
    }
  };

  // Thumbnail strip scroll sync ref
  const thumbListRef = useRef(null);
  useEffect(() => {
    if (!thumbListRef.current) return;
    const activeEl = thumbListRef.current.querySelector('.product-detail-thumb--active');
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [selectedVariantId, activeImage]);

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
    return <ProductDetailSkeleton />;
  }


  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div className="product-detail-error-card">
          <ErrorOutlineOutlinedIcon sx={{ fontSize: 48, color: '#dc2626' }} />
          <h2>Product Dossier Not Found</h2>
          <p>{error || 'The requested product could not be located in workspace.'}</p>
          <Button
            variant="primary"
            onClick={() => navigate('/products')}
          >
            Back to Catalog
          </Button>
        </div>
      </div>
    );
  }

  const productName = product.name || product.product_name || 'Unnamed Product';
  const categoryName = product.category || product.category_name || 'General';
  const brandName = product.brand || product.brand_name || '—';
  const departmentName = product.department || '—';

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
          <Button
            variant="outline"
            icon={<PrintOutlinedIcon sx={{ fontSize: 18 }} />}
            onClick={handlePrint}
            title="Print official product spec sheet (A4 PDF)"
            responsiveCollapse
          >
            Print Sheet
          </Button>

          {canEdit && (
            <Button
              variant="primary"
              icon={<EditIcon sx={{ fontSize: 18 }} />}
              onClick={() => navigate(`/products/edit/${product.id}`)}
              responsiveCollapse
            >
              Edit Product
            </Button>
          )}
        </div>
      </div>

      {/* ── 2. Dossier Tab Navigation (only shown when multiple tabs exist) ── */}
      {availableTabs.length > 1 && (
        <nav className="product-detail-tabs">
          {availableTabs.map((t) => (
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
      )}

      {/* ── 4. Tab Panels ── */}
      <main className="product-detail-content">
        {/* ── TAB 1: COMBINED OVERVIEW + VARIANTS MATRIX (Style 2 Split-Panel Layout) ── */}
        {activeTab === 'matrix' && (
          <div className="product-detail-split">
            {/* ── LEFT SIDEBAR: Compact Product Hub & Registry ── */}
            <aside className="product-detail-sidebar">
              <div className="product-detail-card product-detail-hub-card">
                {/* 1. Media Preview (Touch Swipe on Mobile, Mouse Drag / Chevrons on PC) */}
                <div
                  className="product-detail-main-media"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseLeave}
                  onKeyDown={handleMediaKeyDown}
                  tabIndex={previewItems.length > 1 ? 0 : -1}
                  role="region"
                  aria-label="Product variant image carousel. Swipe or use arrow keys to navigate."
                  title={previewItems.length > 1 ? "Swipe or click arrows to view variants" : undefined}
                >
                  {previewItems.length > 1 && (
                    <>
                      <button
                        type="button"
                        className="product-detail-media-nav product-detail-media-nav--prev"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrevVariant();
                        }}
                        aria-label="Previous variant photo"
                        title="Previous variant (Left Arrow or Swipe Right)"
                      >
                        <ChevronLeftIcon sx={{ fontSize: 22 }} />
                      </button>

                      <button
                        type="button"
                        className="product-detail-media-nav product-detail-media-nav--next"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNextVariant();
                        }}
                        aria-label="Next variant photo"
                        title="Next variant (Right Arrow or Swipe Left)"
                      >
                        <ChevronRightIcon sx={{ fontSize: 22 }} />
                      </button>

                      <div className="product-detail-media-counter">
                        {activePreviewIndex + 1} / {previewItems.length}
                      </div>

                      {/* Animation Mode Switcher Pill */}
                      <div
                        className="product-detail-anim-toggle"
                        onClick={(e) => e.stopPropagation()}
                        title="Switch between Option 1 (Slide), Option 2 (Fade), and Option 3 (Drag)"
                      >
                        <button
                          type="button"
                          className={`product-detail-anim-btn ${animMode === 'slide' ? 'product-detail-anim-btn--active' : ''}`}
                          onClick={() => setAnimMode('slide')}
                          title="Option 1: Directional Slide Animation"
                        >
                          Slide
                        </button>
                        <button
                          type="button"
                          className={`product-detail-anim-btn ${animMode === 'fade' ? 'product-detail-anim-btn--active' : ''}`}
                          onClick={() => setAnimMode('fade')}
                          title="Option 2: Soft Fade Dissolve Animation"
                        >
                          Fade
                        </button>
                        <button
                          type="button"
                          className={`product-detail-anim-btn ${animMode === 'drag' ? 'product-detail-anim-btn--active' : ''}`}
                          onClick={() => setAnimMode('drag')}
                          title="Option 3: Real-Time Finger / Mouse Drag Physics"
                        >
                          Drag
                        </button>
                      </div>
                    </>
                  )}

                  {activeImage ? (
                    <img
                      key={`${selectedVariantId || 'default'}-${activePreviewIndex}-${animMode}`}
                      src={activeImage}
                      alt={productName}
                      className={`product-detail-preview-img ${animMode === 'slide'
                        ? `product-detail-preview-img--slide-${slideDirection}`
                        : animMode === 'fade'
                          ? 'product-detail-preview-img--fade'
                          : 'product-detail-preview-img--drag'
                        }`}
                      style={
                        animMode === 'drag'
                          ? {
                              transform: `translateX(${dragOffset}px) scale(${isDragging ? 0.98 : 1})`,
                              transition: isDragging
                                ? 'none'
                                : 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease',
                              opacity: Math.max(0.35, 1 - Math.abs(dragOffset) / 380),
                            }
                          : undefined
                      }
                      draggable={false}
                    />
                  ) : (
                    <div className="product-detail-no-media">
                      <p>No photo available</p>
                    </div>
                  )}
                </div>

                {previewItems.length > 0 && (
                  <div className="product-detail-thumbs" ref={thumbListRef}>
                    {previewItems.map((item, idx) => {
                      const isActive = selectedVariantId
                        ? selectedVariantId === item.id
                        : activeImage === item.imageUrl;
                      const titleText = item.optionLabel
                        ? `${item.sku} (${item.optionLabel})`
                        : (item.sku || `Variant ${idx + 1}`);

                      return (
                        <button
                          key={item.id || idx}
                          type="button"
                          className={`product-detail-thumb ${isActive ? 'product-detail-thumb--active' : ''}`}
                          onClick={() => {
                            if (item.variant) {
                              handleSelectVariant(item.variant);
                            } else {
                              setActiveImage(item.imageUrl || '');
                            }
                          }}
                          title={titleText}
                          aria-label={titleText}
                        >
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.sku || `Thumb ${idx + 1}`} />
                          ) : (
                            <span className="product-detail-thumb-no-photo" title="No photo available">
                              <ImageNotSupportedOutlinedIcon sx={{ fontSize: 18 }} />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 2. Product Information & Catalog Registry */}
                <div className="product-detail-registry-section">
                  <div className="product-detail-meta-list">
                    {/* Active Variant Option & Price Hero Row */}
                    <div className="product-detail-hero-row">
                      <div className="product-detail-hero-info">
                        <span className="product-detail-hero-name">
                          {productName}
                        </span>
                      </div>
                      <div className="product-detail-hero-price-wrap">
                        <span className="product-detail-hero-price">
                          {currencyFormatter.format(selectedVariantData?.price ?? stats?.basePrice ?? 0)}
                        </span>
                      </div>
                    </div>

                    {/* Dynamic Variant Attributes / Notes Strip */}
                    {((selectedVariantData?.attributes?.length > 0) || (selectedVariantData?.otherItems?.length > 0)) && (
                      <div className="product-detail-variant-attrs-strip">
                        {selectedVariantData.attributes.map((av, avIdx) => (
                          <span key={av.value_id || avIdx} className="product-detail-variant-attr-badge">
                            {av.attribute_name ? (
                              <span className="attr-name">{av.attribute_name}:</span>
                            ) : null}
                            <span className="attr-val">
                              {typeof av === 'object' && av !== null ? av.value : String(av)}
                            </span>
                          </span>
                        ))}
                        {selectedVariantData.otherItems.map((otherTxt, otIdx) => (
                          <span key={otIdx} className="product-detail-variant-attr-badge">
                            <span className="attr-val">{otherTxt}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Master Catalog Details */}
                    <div className="product-detail-meta-item product-detail-meta-item--divider">
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
                      <span className="product-detail-meta-value">
                        {product.unit_of_measure || product.uom || 'PCS (Pieces)'}
                      </span>
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
                    <Input
                      type="text"
                      enterKeyHint="search"
                      leftIcon={<SearchIcon sx={{ fontSize: 18, color: '#94a3b8' }} />}
                      rightIcon={
                        variantSearch ? (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setVariantSearch('');
                            }}
                            sx={{ padding: '2px', color: '#94a3b8' }}
                            aria-label="Clear filter"
                          >
                            <CloseIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        ) : null
                      }
                      value={variantSearch}
                      onChange={(e) => setVariantSearch(e.target.value)}
                      placeholder="Filter by SKU or option..."
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
                              <tr
                                key={v.id || v.variant_id || idx}
                                className={`product-detail-tr-interactive ${selectedVariantId === (v.id || v.variant_id)
                                  ? 'product-detail-tr--selected'
                                  : ''
                                  }`}
                                onClick={() => handleSelectVariant(v)}
                                title={`Click to select ${vSku}`}
                              >
                                <td>
                                  <div
                                    className={`product-detail-tbl-avatar ${selectedVariantId === (v.id || v.variant_id)
                                      ? 'product-detail-tbl-avatar--selected'
                                      : ''
                                      }`}
                                    title={`Preview ${vSku}`}
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
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopy(vSku);
                                      }}
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
                                <td
                                  className="product-detail-td--stock"
                                  style={{
                                    textAlign: 'center',
                                    fontWeight: 700,
                                    color: vAvail > 0 ? '#059669' : '#94a3b8',
                                  }}
                                >
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
        {activeTab === 'ledger' && availableTabs.some((t) => t.id === 'ledger') && (
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
        {activeTab === 'procurement' && availableTabs.some((t) => t.id === 'procurement') && (
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
                  <Button
                    variant="primary"
                    icon={<Inventory2OutlinedIcon sx={{ fontSize: 18 }} />}
                    onClick={() => navigate('/purchase-requests')}
                  >
                    Create Purchase Request
                  </Button>
                  <Button
                    variant="outline"
                    icon={<LayersOutlinedIcon sx={{ fontSize: 18 }} />}
                    onClick={() => navigate('/stocks')}
                  >
                    Adjust Stock Count
                  </Button>
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
