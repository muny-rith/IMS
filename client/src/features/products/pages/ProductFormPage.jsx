import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  CircularProgress,
  FormControl,
  MenuItem,
  Select,
  Autocomplete,
  TextField,
  Tooltip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import RefreshIcon from '@mui/icons-material/Refresh';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import Button from '../../../components/ui/Button/Button';
import { fetchAttributes, fetchAttributeValues } from '../../attributes/services/attributeService';
import { useProducts } from '../hooks/useProducts';
import './ProductFormPage.css';

const RULES = {
  name: { required: 'Name is required' },
  categoryId: { required: 'Category is required' },
  department: { required: 'Department is required' },
};

const EMPTY_FORM = {
  name: '',
  categoryId: '',
  brandId: '',
  department: '',
  imageUrl: '',
};

const createEmptyVariant = () => ({
  id: `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  variant_id: null,
  sku: '',
  unit_price: '',
  openingQty: '',
  openingNote: '',
  reservedQty: 0,
  other: '',
  attributes: {},
  imageFile: null,
  imageUrl: '',
  imagePreview: '',
});

const normalizeVariantRows = (variantRows = []) =>
  variantRows.map((variant) => ({
    id: variant.variant_id || variant.id || `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    variant_id: variant.variant_id || null,
    sku: variant.sku ?? '',
    unit_price: variant.unit_price ?? '',
    openingQty: variant.openingQty ?? variant.on_hand_qty ?? 0,
    openingNote: '',
    reservedQty: variant.reservedQty ?? variant.reserved_qty ?? 0,
    other: variant.other ?? '',
    attributes: variant.attributes ?? {},
    imageFile: null,
    imageUrl: variant.imageUrl ?? variant.image_url ?? '',
    imagePreview: variant.imagePreview ?? variant.imageUrl ?? variant.image_url ?? '',
    is_active: variant.isActive ?? variant.is_active ?? true,
  }));

const normalizeProductAttributes = (defaultValues, allAttributes) => {
  const values = defaultValues?.productAttributes ?? defaultValues?.product_attributes ?? [];

  return values
    .map((attribute) => {
      const attributeId = Number(attribute.attribute_id ?? attribute);
      return allAttributes.find((item) => item.attribute_id === attributeId) || {
        attribute_id: attributeId,
        attribute_name: attribute.attribute_name ?? `Attribute ${attributeId}`,
      };
    })
    .filter((attribute) => Number.isInteger(attribute.attribute_id));
};

const normalizeFormValues = (defaultValues, mode) => {
  if (!defaultValues || mode === 'create') {
    return EMPTY_FORM;
  }
  return {
    name: defaultValues.name ?? '',
    categoryId:
      defaultValues.categoryId !== undefined && defaultValues.categoryId !== null
        ? String(defaultValues.categoryId)
        : '',
    brandId:
      defaultValues.brandId !== undefined && defaultValues.brandId !== null
        ? String(defaultValues.brandId)
        : '',
    department: defaultValues.department ?? '',
    imageUrl: defaultValues.imageUrl ?? defaultValues.image ?? '',
  };
};

const ProductFormPage = () => {
  const { id } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isEdit = pathname.includes('/edit/');
  const isCreate = !isEdit;
  const mode = isEdit ? 'edit' : 'create';

  const {
    categories = [],
    brands = [],
    handleAdd,
    handleUpdate,
    fetchProductDetail,
  } = useProducts();

  const [loadingDetails, setLoadingDetails] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [defaultValues, setDefaultValues] = useState(null);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [allAttributes, setAllAttributes] = useState([]);
  const [attributeValuesMap, setAttributeValuesMap] = useState({});
  const [productAttributes, setProductAttributes] = useState([]);
  const [variants, setVariants] = useState([]);
  const [deletedVariantIds, setDeletedVariantIds] = useState([]);

  // Variant master-detail workbench selection
  const [selectedVariantId, setSelectedVariantId] = useState(null);

  // Master-detail split workbench selectors
  const activeSelectedId = useMemo(() => {
    if (variants.some((v) => v.id === selectedVariantId)) {
      return selectedVariantId;
    }
    return variants[0]?.id || null;
  }, [variants, selectedVariantId]);

  const selectedVariantIndex = useMemo(() => {
    return variants.findIndex((v) => v.id === activeSelectedId);
  }, [variants, activeSelectedId]);

  const selectedVariant = useMemo(() => {
    return variants[selectedVariantIndex] || variants[0] || null;
  }, [variants, selectedVariantIndex]);

  const handlePrevVariant = () => {
    if (selectedVariantIndex > 0) {
      setSelectedVariantId(variants[selectedVariantIndex - 1].id);
    }
  };

  const handleNextVariant = () => {
    if (selectedVariantIndex < variants.length - 1) {
      setSelectedVariantId(variants[selectedVariantIndex + 1].id);
    }
  };

  const handleDuplicateVariant = (varId) => {
    const target = variants.find((v) => v.id === varId);
    if (!target) return;
    const newV = {
      ...target,
      id: `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      variant_id: null,
      sku: target.sku ? `${target.sku}-copy` : '',
      openingQty: target.openingQty || 0,
      openingNote: '',
      reservedQty: 0,
      imageFile: null,
      imageUrl: target.imageUrl || '',
      imagePreview: target.imagePreview || '',
    };
    setVariants((prev) => [...prev, newV]);
    setSelectedVariantId(newV.id);
  };

  const fileInputRef = useRef(null);
  const variantInputRefs = useRef({});

  const formValues = useMemo(
    () => normalizeFormValues(defaultValues, mode),
    [defaultValues, mode]
  );

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: EMPTY_FORM,
  });

  const selectedCategoryId = watch('categoryId');

  // Load product detail if editing
  useEffect(() => {
    if (isEdit && id) {
      setLoadingDetails(true);
      fetchProductDetail(id, true)
        .then((data) => {
          setDefaultValues(data);
          setLoadingDetails(false);
        })
        .catch((err) => {
          console.error(err);
          setLoadingDetails(false);
        });
    }
  }, [isEdit, id, fetchProductDetail]);

  // Load attributes globally
  useEffect(() => {
    const loadAttrs = async () => {
      try {
        const data = await fetchAttributes();
        setAllAttributes(data || []);
      } catch (e) {
        console.error(e);
      }
    };
    loadAttrs();
  }, []);

  // Initialize form state once defaultValues are loaded (or immediately if creating)
  useEffect(() => {
    if (!defaultValues && !isCreate) return;

    reset(formValues);
    setImageFile(null);
    setImagePreview(formValues.imageUrl || '');

    if (isCreate) {
      setVariants([createEmptyVariant()]);
    } else {
      setVariants(normalizeVariantRows(defaultValues?.variants || []));
    }
    setDeletedVariantIds([]);
  }, [formValues, reset, isCreate, defaultValues]);

  useEffect(() => {
    if (isCreate) {
      setProductAttributes([]);
      return;
    }
    setProductAttributes(normalizeProductAttributes(defaultValues, allAttributes));
  }, [isCreate, defaultValues, allAttributes]);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleClose = () => {
    if (isEdit && id) {
      navigate(`/products/view/${id}`);
    } else {
      navigate('/products');
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setImageFile(null);
      return;
    }
    if (imagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    if (imagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (imagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFormSubmit = async (values) => {
    setSubmitting(true);
    const data = {
      name: values.name.trim(),
      categoryId: values.categoryId ? Number(values.categoryId) : null,
      brandId: values.brandId ? Number(values.brandId) : null,
      department: values.department.trim(),
      imageFile,
      imageUrl: formValues.imageUrl || '',
      variants: variants,
      deletedVariantIds: isEdit ? deletedVariantIds : [],
      productAttributes: productAttributes.map(a => a.attribute_id),
    };

    const result = isCreate ? await handleAdd(data) : await handleUpdate(id, data);
    setSubmitting(false);

    if (result.success) {
      if (isEdit && id) {
        navigate(`/products/view/${id}`);
      } else {
        navigate('/products');
      }
    } else {
      alert(result.message || 'Something went wrong.');
    }
  };

  // Compute category attributes
  const categoryAttributes = useMemo(() => {
    if (!selectedCategoryId) return [];
    const cat = categories.find(c => String(c.id) === String(selectedCategoryId));
    if (!cat || !cat.attributes || !cat.attributes.length) return [];
    return allAttributes.filter(a => cat.attributes.includes(a.attribute_id));
  }, [selectedCategoryId, categories, allAttributes]);

  const activeAttributes = useMemo(() => {
    const combined = [...categoryAttributes];
    productAttributes.forEach(pa => {
      if (!combined.find(ca => ca.attribute_id === pa.attribute_id)) {
        combined.push(pa);
      }
    });
    return combined;
  }, [categoryAttributes, productAttributes]);

  // Fetch attribute values for selected category's attributes
  useEffect(() => {
    const loadValues = async () => {
      const newMap = { ...attributeValuesMap };
      let changed = false;
      for (const attr of activeAttributes) {
        if (!newMap[attr.attribute_id]) {
          try {
            const vals = await fetchAttributeValues(attr.attribute_id);
            newMap[attr.attribute_id] = vals || [];
            changed = true;
          } catch (e) { }
        }
      }
      if (changed) setAttributeValuesMap(newMap);
    };
    if (activeAttributes.length > 0) loadValues();
  }, [activeAttributes, attributeValuesMap]);

  const handleAddVariant = () => {
    const newVariant = createEmptyVariant();
    setVariants((prev) => [...prev, newVariant]);
    setSelectedVariantId(newVariant.id);
  };

  const handleRemoveVariant = (varId) => {
    setVariants((prev) => {
      const target = prev.find((v) => v.id === varId);
      if (target?.imagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(target.imagePreview);
      }
      if (isEdit && target?.variant_id) {
        setDeletedVariantIds((current) => [...new Set([...current, Number(target.variant_id)])]);
      }
      return prev.filter((v) => v.id !== varId);
    });
  };

  const handleVariantImageChange = (varId, event) => {
    const file = event.target.files?.[0];
    setVariants((prev) =>
      prev.map((v) => {
        if (v.id !== varId) return v;
        if (v.imagePreview?.startsWith('blob:')) {
          URL.revokeObjectURL(v.imagePreview);
        }
        if (!file) {
          return { ...v, imageFile: null, imagePreview: '' };
        }
        return { ...v, imageFile: file, imagePreview: URL.createObjectURL(file) };
      })
    );
  };

  const handleVariantChange = (varId, field, value) => {
    setVariants((current) => current.map(v => v.id === varId ? { ...v, [field]: value } : v));
  };

  const handleVariantAttrChange = (varId, attrId, value) => {
    setVariants((current) => current.map(v => {
      if (v.id === varId) {
        return { ...v, attributes: { ...v.attributes, [attrId]: value } };
      }
      return v;
    }));
  };


  useEffect(() => {
    const updateMetrics = () => {
      const el = document.getElementById('inspector-debug-metrics');
      if (!el) return;
      const inspector = document.querySelector('.product-workbench-inspector');
      const body = document.querySelector('.product-workbench-inspector__body');
      const hero = document.querySelector('.product-workbench-hero-grid');
      const attr = document.querySelector('.workbench-attr-section');
      const detail = document.querySelector('.workbench-field--detail');
      const layout = document.querySelector('.product-workbench-layout');
      if (!body) return;
      el.textContent = `W=${window.innerWidth} | LayoutH=${layout?.offsetHeight}(minH=${layout ? getComputedStyle(layout).minHeight : ''}) | InspH=${inspector?.offsetHeight} | BodyH=${body.offsetHeight}(flex=${getComputedStyle(body).flex}) | HeroH=${hero?.offsetHeight} | AttrH=${attr?.offsetHeight} | DetailTop=${detail?.getBoundingClientRect().top.toFixed(0)} | HeroBottom=${hero?.getBoundingClientRect().bottom.toFixed(0)}`;
    };
    const t = setInterval(updateMetrics, 500);
    return () => clearInterval(t);
  }, []);

  if (loadingDetails) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="product-form-page">
      {/* ── 1. Top Header & Breadcrumbs ── */}
      <div className="product-form-header">
        <div className="product-form-header__left">
          <button
            type="button"
            className="product-form-back-btn"
            onClick={handleClose}
            title="Back to products"
          >
            <ArrowBackIcon fontSize="small" />
          </button>
          <div className="product-form-header__info">
            <div className="product-form-breadcrumbs">
              <span className="clickable" onClick={() => navigate('/products')}>Products</span>
              <span>/</span>
              {isEdit && defaultValues?.name && (
                <>
                  <span className="clickable" onClick={() => navigate(`/products/view/${id}`)}>
                    {defaultValues.name}
                  </span>
                  <span>/</span>
                </>
              )}
              <span className="product-form-breadcrumbs__current">
                {isCreate ? 'Add Product' : 'Edit Product'}
              </span>
            </div>
            <h1 className="product-form-header__title">
              {isCreate ? 'Add New Product' : (defaultValues?.name || 'Edit Product')}
            </h1>
          </div>
        </div>

        <div className="product-form-header__actions">
          <Button
            type="button"
            variant="outline"
            icon={<CloseIcon sx={{ fontSize: 16 }} />}
            onClick={handleClose}
            disabled={submitting}
            responsiveCollapse
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="product-form"
            variant="primary"
            icon={<SaveIcon sx={{ fontSize: 17 }} />}
            loading={submitting}
            disabled={variants.length === 0}
            responsiveCollapse
          >
            {isCreate ? 'Create Product' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* ── 2. Split Workspace ── */}
      <form id="product-form" onSubmit={handleSubmit(handleFormSubmit)} className="product-form-split">
        {/* ── LEFT COLUMN: Core Registry ── */}
        <div className="product-form-left-col">
          {/* Card: Media Dropzone */}
          <div className="product-form-card">
            <h3 className="product-form-card__title">
              <span>Product Image</span>
              <span className="product-form-card__badge">Visual Asset</span>
            </h3>

            <div
              className="product-image-dropzone"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {imagePreview ? (
                <div className="product-image-dropzone__preview">
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="product-image-dropzone__img"
                  />
                  <div className="product-image-dropzone__overlay">
                    <button
                      type="button"
                      className="product-image-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      <RefreshIcon sx={{ fontSize: 14 }} />
                      <span>Change</span>
                    </button>
                    <button
                      type="button"
                      className="product-image-action-btn product-image-action-btn--delete"
                      onClick={handleRemoveImage}
                    >
                      <DeleteIcon sx={{ fontSize: 14 }} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="product-image-dropzone__empty">
                  <CloudUploadIcon className="product-image-dropzone__icon" />
                  <p className="product-image-dropzone__text">Click to browse or drop photo</p>
                  <p className="product-image-dropzone__subtext">PNG, JPG, or WebP</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                hidden
              />
            </div>
          </div>

          {/* Card: Core Information */}
          <div className="product-form-card">
            <h3 className="product-form-card__title">
              <span>General Information</span>
            </h3>

            <div className="product-form-group">
              <label className="product-form-label">
                <span>Product Name</span>
                <span className="req">*</span>
              </label>
              <input
                {...register('name', RULES.name)}
                placeholder="e.g. Baby Rice Snack"
                className={`product-form-input ${errors.name ? 'field-error' : ''}`}
              />
              {errors.name && <span className="product-form-error">{errors.name.message}</span>}
            </div>

            <div className="product-form-group">
              <label className="product-form-label">
                <span>Category</span>
                <span className="req">*</span>
              </label>
              <Controller
                name="categoryId"
                control={control}
                rules={RULES.categoryId}
                render={({ field }) => (
                  <FormControl fullWidth size="small" error={Boolean(errors.categoryId)}>
                    <Select
                      {...field}
                      displayEmpty
                      value={field.value ?? ''}
                      onChange={(event) => field.onChange(event.target.value)}
                      sx={{
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        fontSize: '13.5px',
                        '& .MuiSelect-select': { padding: '9px 12px' },
                        '& fieldset': { borderColor: errors.categoryId ? '#ef4444' : '#cbd5e1' },
                        '&:hover fieldset': { borderColor: '#94a3b8' },
                        '&.Mui-focused fieldset': { borderColor: 'var(--primary-color, #eb0029)', borderWidth: '1px' },
                      }}
                    >
                      <MenuItem value="" disabled>Select category</MenuItem>
                      {categories.map((c) => (
                        <MenuItem key={c.id} value={String(c.id)}>{c.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
              {errors.categoryId && <span className="product-form-error">{errors.categoryId.message}</span>}
            </div>

            <div className="product-form-group">
              <label className="product-form-label">
                <span>Brand</span>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>(Optional)</span>
              </label>
              <Controller
                name="brandId"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth size="small">
                    <Select
                      {...field}
                      displayEmpty
                      value={field.value ?? ''}
                      onChange={(event) => field.onChange(event.target.value)}
                      sx={{
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        fontSize: '13.5px',
                        '& .MuiSelect-select': { padding: '9px 12px' },
                        '& fieldset': { borderColor: '#cbd5e1' },
                        '&:hover fieldset': { borderColor: '#94a3b8' },
                        '&.Mui-focused fieldset': { borderColor: 'var(--primary-color, #eb0029)', borderWidth: '1px' },
                      }}
                    >
                      <MenuItem value=""><em>None</em></MenuItem>
                      {brands.map((b) => (
                        <MenuItem key={b.id} value={String(b.id)}>{b.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </div>

            <div className="product-form-group">
              <label className="product-form-label">
                <span>Department</span>
                <span className="req">*</span>
              </label>
              <input
                {...register('department', RULES.department)}
                placeholder="e.g. Snack, Baby, Beverage"
                className={`product-form-input ${errors.department ? 'field-error' : ''}`}
              />
              {errors.department && <span className="product-form-error">{errors.department.message}</span>}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Interactive Matrix Studio ── */}
        <div className="product-form-right-col">
          <div className="product-form-card" style={{ padding: '20px 20px 14px 20px' }}>
            <div className="product-matrix-header">
              <div className="product-matrix-header__left">
                <h3 className="product-matrix-title">
                  <span>Variants Studio</span>
                  <span className="product-form-card__badge">{variants.length} Active</span>
                </h3>
                <p className="product-matrix-subtitle">
                  Manage SKU codes, pricing, inventory stock, photography, and attributes in a focused workbench.
                </p>
              </div>

            </div>

            {/* Dynamic Custom Attributes Banner */}
            <div className="product-matrix-attrs-box">
              <div className="product-matrix-attrs-box__label">
                <span>Add Custom Attributes</span>
                <span className="product-matrix-attrs-box__hint">Applies options across all matrix rows</span>
              </div>
              <Autocomplete
                multiple
                size="small"
                options={allAttributes.filter(a => !categoryAttributes.find(ca => ca.attribute_id === a.attribute_id))}
                getOptionLabel={(option) => option.attribute_name}
                value={productAttributes}
                onChange={(e, newValue) => setProductAttributes(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Choose custom attributes for this product (e.g. Size, Flavor)..."
                    sx={{
                      bgcolor: '#fff',
                      borderRadius: '8px',
                      '& fieldset': { borderColor: '#cbd5e1' },
                      '& .MuiChip-root': {
                        height: '24px',
                        fontSize: '12px',
                        fontWeight: 600,
                        bgcolor: '#e0f2fe',
                        color: '#0369a1',
                      }
                    }}
                  />
                )}
              />
            </div>

            {/* Variants Studio: Master-Detail Split Workbench */}
            {variants.length === 0 ? (
              <div className="product-matrix-empty">
                <p>No variants defined for this product.</p>
                <Button
                  variant="outline"
                  icon={<AddIcon sx={{ fontSize: 16 }} />}
                  onClick={handleAddVariant}
                >
                  Create First Variant
                </Button>
              </div>
            ) : (
              <div className="product-workbench-container">
                <div className="product-workbench-layout">
                  {/* Left Sidebar: Variant List */}
                  <div className="product-workbench-sidebar">
                    <div className="product-workbench-sidebar__header">
                      <span className="product-workbench-sidebar__title">
                        <span>Variants List</span>
                        <span className="product-form-card__badge">{variants.length}</span>
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        icon={<AddIcon sx={{ fontSize: 14 }} />}
                        onClick={handleAddVariant}
                      >
                        Add
                      </Button>
                    </div>

                    <div className="product-workbench-list">
                      {variants.map((v, idx) => {
                        const isSelected = v.id === activeSelectedId;
                        const attrSummary = activeAttributes
                          .map((attr) => {
                            const val = v.attributes[attr.attribute_id];
                            const valText = Array.isArray(val) ? val.join(', ') : (val || '');
                            return valText ? `${attr.attribute_name}: ${valText}` : null;
                          })
                          .filter(Boolean)
                          .join(' • ');

                        return (
                          <div
                            key={v.id}
                            className={`product-workbench-item ${isSelected ? 'product-workbench-item--active' : ''}`}
                            onClick={() => setSelectedVariantId(v.id)}
                          >
                            <span className="product-workbench-item__num">#{idx + 1}</span>

                            <div className="product-workbench-item__thumb">
                              {v.imagePreview ? (
                                <img src={v.imagePreview} alt={`Variant ${idx + 1}`} />
                              ) : (
                                <span className="product-workbench-item__thumb-empty">Auto</span>
                              )}
                            </div>

                            <div className="product-workbench-item__info">
                              <span className="product-workbench-item__sku">
                                {v.sku || `Variant ${idx + 1}`}
                              </span>
                              <span
                                className="product-workbench-item__attrs"
                                title={attrSummary || v.other || 'No attributes configured'}
                              >
                                {attrSummary || v.other || 'Standard'}
                              </span>
                            </div>

                            <div className="product-workbench-item__meta">
                              <span className="product-workbench-item__price">
                                {v.unit_price ? `$${Number(v.unit_price).toFixed(2)}` : '$0.00'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Inspector: Focused Variant Canvas */}
                  {selectedVariant && (
                    <div className="product-workbench-inspector">
                      {/* Header */}
                      <div className="product-workbench-inspector__header">
                        <div className="product-workbench-inspector__title-box">
                          <span className="product-workbench-inspector__badge">
                            Variant #{selectedVariantIndex + 1} of {variants.length}
                          </span>
                        </div>
                        <div id="inspector-debug-metrics" style={{ fontSize: 10, color: '#dc2626', background: '#fee2e2', padding: '2px 6px', borderRadius: 4, width: '100%', wordBreak: 'break-all' }} />

                        <div className="product-workbench-inspector__actions">
                          <Button
                            size="sm"
                            variant="outline"
                            icon={<NavigateBeforeIcon sx={{ fontSize: 18 }} />}
                            disabled={selectedVariantIndex <= 0}
                            onClick={handlePrevVariant}
                            title="Previous Variant"
                            responsiveCollapse
                          >
                            Prev
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            endIcon={<NavigateNextIcon sx={{ fontSize: 18 }} />}
                            disabled={selectedVariantIndex >= variants.length - 1}
                            onClick={handleNextVariant}
                            title="Next Variant"
                            responsiveCollapse
                          >
                            Next
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            icon={<ContentCopyIcon sx={{ fontSize: 16 }} />}
                            onClick={() => handleDuplicateVariant(selectedVariant.id)}
                            title="Duplicate this variant"
                            responsiveCollapse
                          >
                            Duplicate
                          </Button>

                          {variants.length > 1 && (
                            <Tooltip title="Delete this variant">
                              <Button
                                size="sm"
                                variant="danger-outline"
                                icon={<DeleteIcon sx={{ fontSize: 17 }} />}
                                onClick={() => handleRemoveVariant(selectedVariant.id)}
                              />
                            </Tooltip>
                          )}
                        </div>
                      </div>

                      {/* Body */}
                      <div className="product-workbench-inspector__body">
                        {/* Hero Photo Studio & Primary Identifiers */}
                        <div className="product-workbench-hero-grid">
                          <div className="workbench-photo-card">
                            <span className="workbench-photo-label">Variant Photo</span>
                            <div
                              className="workbench-photo-dropzone"
                              onClick={() => variantInputRefs.current[selectedVariant.id]?.click()}
                              title="Click to choose variant photo"
                            >
                              {selectedVariant.imagePreview ? (
                                <img src={selectedVariant.imagePreview} alt={selectedVariant.sku || 'Variant'} />
                              ) : (
                                <div className="workbench-photo-placeholder">
                                  <PhotoCameraIcon sx={{ fontSize: 28 }} />
                                  <span>Upload Image</span>
                                </div>
                              )}
                              <div className="workbench-photo-overlay">
                                <PhotoCameraIcon sx={{ fontSize: 20 }} />
                                <span>Change</span>
                              </div>
                              <input
                                ref={(el) => (variantInputRefs.current[selectedVariant.id] = el)}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(e) => handleVariantImageChange(selectedVariant.id, e)}
                                hidden
                              />
                            </div>
                          </div>

                          <div className="workbench-fields-grid">
                            {/* SKU */}
                            <div className="product-form-field workbench-field--sku">
                              <label className="product-form-label">
                                <span>SKU Code</span>
                              </label>
                              <input
                                type="text"
                                className="product-form-input matrix-input--sku"
                                placeholder="Auto-generated"
                                value={selectedVariant.sku}
                                onChange={(e) => handleVariantChange(selectedVariant.id, 'sku', e.target.value)}
                              />
                            </div>

                            {/* Unit Price */}
                            <div className="product-form-field workbench-field--price">
                              <label className="product-form-label">
                                <span>Unit Price</span>
                                <span className="product-form-required">*</span>
                              </label>
                              <div className="matrix-price-wrap">
                                <span className="matrix-price-currency">$</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  className="product-form-input matrix-input--price"
                                  placeholder="0.00"
                                  value={selectedVariant.unit_price}
                                  onChange={(e) => handleVariantChange(selectedVariant.id, 'unit_price', e.target.value)}
                                  required
                                />
                              </div>
                            </div>

                            {/* Product Attribute */}
                            {activeAttributes.length > 0 && (
                              <div className="product-form-field workbench-attr-section">
                                <div className="workbench-attr-list">
                                  {activeAttributes.map((attr) => (
                                    <div key={attr.attribute_id} className="product-form-field workbench-attr-item">
                                      <span className="workbench-attr-label">
                                        {attr.attribute_name}
                                      </span>
                                      <Autocomplete
                                        multiple
                                        freeSolo
                                        size="small"
                                        options={(attributeValuesMap[attr.attribute_id] || []).map((val) => val.value)}
                                        value={
                                          Array.isArray(selectedVariant.attributes[attr.attribute_id])
                                            ? selectedVariant.attributes[attr.attribute_id]
                                            : (selectedVariant.attributes[attr.attribute_id] ? [selectedVariant.attributes[attr.attribute_id]] : [])
                                        }
                                        onChange={(event, newValue) => handleVariantAttrChange(selectedVariant.id, attr.attribute_id, newValue)}
                                        renderInput={(params) => (
                                          <TextField
                                            {...params}
                                            placeholder={`Add ${attr.attribute_name}...`}
                                            size="small"
                                            sx={{
                                              '& .MuiOutlinedInput-root': {
                                                fontSize: '13px',
                                                padding: '3px 8px',
                                                bgcolor: '#fff',
                                                borderRadius: '8px',
                                                '& fieldset': { borderColor: '#cbd5e1' },
                                                '&:hover fieldset': { borderColor: '#94a3b8' },
                                                '&.Mui-focused fieldset': { borderColor: 'var(--primary-color, #eb0029)', borderWidth: '1px' },
                                                '& .MuiChip-root': {
                                                  height: '24px',
                                                  fontSize: '11.5px',
                                                  fontWeight: 600,
                                                  bgcolor: '#f1f5f9',
                                                  color: '#334155',
                                                }
                                              }
                                            }}
                                          />
                                        )}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Specific Detail / Notes */}
                        <div className="product-form-field workbench-field--detail">
                          <label className="product-form-label">
                            <span>Specific Detail</span>
                          </label>
                          <input
                            type="text"
                            className="product-form-input"
                            placeholder="Enter variant specific details or notes..."
                            value={selectedVariant.other || ''}
                            onChange={(e) => handleVariantChange(selectedVariant.id, 'other', e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="product-workbench-inspector__footer">
                        <span className="product-workbench-inspector__footer-hint">
                          Editing <strong>#{selectedVariantIndex + 1}</strong> of {variants.length}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductFormPage;
