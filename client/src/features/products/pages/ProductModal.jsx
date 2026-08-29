import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  IconButton,
  Autocomplete,
  TextField,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Button from '../../../components/ui/Button/Button';
import { fetchAttributes, fetchAttributeValues } from '../../attributes/services/attributeService';
import './ProductModal.css';

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

const ProductModal = ({
  open,
  onClose,
  onSubmit,
  submitting,
  categories = [],
  brands = [],
  defaultValues = null,
  mode = 'create',
  loadingDetails = false,
}) => {
  const isCreate = mode === 'create';
  const isEdit = mode === 'edit';
  const isView = mode === 'view';

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [allAttributes, setAllAttributes] = useState([]);
  const [attributeValuesMap, setAttributeValuesMap] = useState({});
  const [productAttributes, setProductAttributes] = useState([]);
  const [variants, setVariants] = useState([]);
  const [deletedVariantIds, setDeletedVariantIds] = useState([]);

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

  useEffect(() => {
    if (open) {
      reset(formValues);
      setImageFile(null);
      setImagePreview(formValues.imageUrl || '');

      if (isCreate) {
        // Start with one empty variant
        setVariants([createEmptyVariant()]);
      } else {
        setVariants(normalizeVariantRows(defaultValues?.variants || []));
      }
      setDeletedVariantIds([]);
      return;
    }
    reset(EMPTY_FORM);
    setImageFile(null);
    setImagePreview('');
    setVariants((prev) => {
      prev.forEach((v) => {
        if (v.imagePreview?.startsWith('blob:')) URL.revokeObjectURL(v.imagePreview);
      });
      return [];
    });
    setProductAttributes([]);
    setDeletedVariantIds([]);
  }, [open, formValues, reset, isCreate, defaultValues]);

  useEffect(() => {
    if (!open) return;

    if (isCreate) {
      setProductAttributes([]);
      return;
    }

    setProductAttributes(normalizeProductAttributes(defaultValues, allAttributes));
  }, [open, isCreate, defaultValues, allAttributes]);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleClose = () => {
    reset(EMPTY_FORM);
    setImageFile(null);
    setImagePreview('');
    setVariants((prev) => {
      prev.forEach((v) => {
        if (v.imagePreview?.startsWith('blob:')) URL.revokeObjectURL(v.imagePreview);
      });
      return prev;
    });
    setDeletedVariantIds([]);
    onClose();
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

  const handleFormSubmit = (values) => {
    onSubmit({
      name: values.name.trim(),
      categoryId: values.categoryId ? Number(values.categoryId) : null,
      brandId: values.brandId ? Number(values.brandId) : null,
      department: values.department.trim(),
      imageFile,
      imageUrl: formValues.imageUrl || '',
      variants: isCreate || isEdit ? variants : [],
      deletedVariantIds: isEdit ? deletedVariantIds : [],
      productAttributes: productAttributes.map(a => a.attribute_id),
    });
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
    setVariants([...variants, createEmptyVariant()]);
  };

  const handleRemoveVariant = (id) => {
    setVariants((prev) => {
      const target = prev.find((v) => v.id === id);
      if (target?.imagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(target.imagePreview);
      }
      if (isEdit && target?.variant_id) {
        setDeletedVariantIds((current) => [...new Set([...current, Number(target.variant_id)])]);
      }
      return prev.filter((v) => v.id !== id);
    });
  };

  const handleVariantImageChange = (id, event) => {
    const file = event.target.files?.[0];
    setVariants((prev) =>
      prev.map((v) => {
        if (v.id !== id) return v;
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

  const handleVariantChange = (id, field, value) => {
    setVariants((current) => current.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const handleVariantAttrChange = (id, attrId, value) => {
    setVariants((current) => current.map(v => {
      if (v.id === id) {
        return { ...v, attributes: { ...v.attributes, [attrId]: value } };
      }
      return v;
    }));
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        {isView ? 'View product' : isEdit ? 'Edit product' : 'Add product'}
      </DialogTitle>

      <DialogContent dividers>
        <Box
          component="form"
          id="product-form"
          onSubmit={handleSubmit(handleFormSubmit)}
          sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, pt: 1 }}
        >
          {/* LEFT SIDE: General Product Info */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <label className="form-label">Product Image</label>
              <div className="product-image-upload" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div className="product-image-preview" style={{ width: '100px', height: '100px', border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Product preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>No image</span>
                  )}
                </div>
                {!isView && (
                  <label className="product-image-button" style={{ cursor: 'pointer', padding: '0.5rem 1rem', border: '1px solid #ccc', borderRadius: '4px' }}>
                    Choose image
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} hidden />
                  </label>
                )}
              </div>
            </Box>



            <Box>
              <label className="form-label">Name</label>
              <input
                {...register('name', RULES.name)}
                disabled={isView}
                placeholder="Product name *"
                className={'form-field' + (errors.name ? ' field-error' : '')}
              />
              {errors.name && <span className="error-msg">{errors.name.message}</span>}
            </Box>

            <Box>
              <label className="form-label">Category</label>
              <Controller
                name="categoryId"
                control={control}
                rules={RULES.categoryId}
                render={({ field }) => (
                  <FormControl fullWidth size="small" error={Boolean(errors.categoryId)}>
                    <InputLabel id="product-category-label">Category *</InputLabel>
                    <Select
                      {...field}
                      labelId="product-category-label"
                      label="Category *"
                      disabled={isView}
                      value={field.value ?? ''}
                      onChange={(event) => field.onChange(event.target.value)}
                      sx={{ backgroundColor: '#fff' }}
                    >
                      <MenuItem value="" disabled>Select category</MenuItem>
                      {categories.map((c) => (
                        <MenuItem key={c.id} value={String(c.id)}>{c.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
              {errors.categoryId && <span className="error-msg">{errors.categoryId.message}</span>}
            </Box>

            <Box>
              <label className="form-label">Brand</label>
              <Controller
                name="brandId"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth size="small">
                    <InputLabel id="product-brand-label">Brand (Optional)</InputLabel>
                    <Select
                      {...field}
                      labelId="product-brand-label"
                      label="Brand (Optional)"
                      disabled={isView}
                      value={field.value ?? ''}
                      onChange={(event) => field.onChange(event.target.value)}
                      sx={{ backgroundColor: '#fff' }}
                    >
                      <MenuItem value=""><em>None</em></MenuItem>
                      {brands.map((b) => (
                        <MenuItem key={b.id} value={String(b.id)}>{b.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Box>



            <Box>
              <label className="form-label">Department</label>
              <input
                {...register('department', RULES.department)}
                disabled={isView}
                placeholder="Department *"
                className={'form-field' + (errors.department ? ' field-error' : '')}
              />
              {errors.department && <span className="error-msg">{errors.department.message}</span>}
            </Box>
          </Box>

          {/* RIGHT SIDE: Variants */}
          <Box sx={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: 2, borderLeft: { md: '1px solid #eee' }, pl: { md: 4 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#333' }}>Product Variants</h3>
              {!isView && (
                <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={handleAddVariant} value="Add Variant" />
              )}
            </Box>

            {/* Custom Attributes selector for all variants */}
            <Box sx={{ mb: 3, p: 2, bgcolor: '#f1f5f9', borderRadius: 2, border: '1px solid #e2e8f0' }}>
              <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontWeight: 600 }}>Add Custom Attributes</label>
              <Autocomplete
                multiple
                size="small"
                disabled={isView}
                options={allAttributes.filter(a => !categoryAttributes.find(ca => ca.attribute_id === a.attribute_id))}
                getOptionLabel={(option) => option.attribute_name}
                value={productAttributes}
                onChange={(e, newValue) => setProductAttributes(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select specific attributes for this product..."
                    sx={{ bgcolor: '#fff', borderRadius: 1 }}
                  />
                )}
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '4px' }}>
                These attributes will apply to all variants below.
              </span>
            </Box>

            {loadingDetails && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
                <CircularProgress size={24} />
              </Box>
            )}

            {!loadingDetails && variants.length === 0 && (
              <Box sx={{ p: 3, textAlign: 'center', bgcolor: '#f9f9f9', borderRadius: 1, border: '1px dashed #ccc' }}>
                <span style={{ color: '#666' }}>No variants added. Please add at least one variant.</span>
              </Box>
            )}

            {!loadingDetails && variants.length > 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: '60vh', overflowY: 'auto', pr: 1 }}>
                {variants.map((v, index) => (
                  <Box key={v.id} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: '8px', bgcolor: '#fafafa', position: 'relative' }}>

                    {!isView && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveVariant(v.id)}
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}

                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#555' }}>
                      Variant #{index + 1}{v.variant_id ? ` - ID ${v.variant_id}` : ' - New'}
                    </h4>

                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                      <div style={{ width: '56px', height: '56px', flexShrink: 0, border: '1px dashed #ccc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#fff' }}>
                        {v.imagePreview ? (
                          <img src={v.imagePreview} alt={`Variant ${index + 1} preview`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: '0.65rem', color: '#aaa', textAlign: 'center', padding: '0 4px' }}>Uses product photo</span>
                        )}
                      </div>
                      {!isView && (
                        <label style={{ cursor: 'pointer', fontSize: '0.8rem', color: '#1976d2' }}>
                          {v.imagePreview ? 'Change photo' : 'Add photo (optional)'}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => handleVariantImageChange(v.id, e)}
                            hidden
                          />
                        </label>
                      )}
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                      <Box>
                        <label className="form-label" style={{ fontSize: '0.8rem' }}>SKU (Optional)</label>
                        <input
                          type="text"
                          className="form-field"
                          placeholder="Auto-generated if empty"
                          value={v.sku}
                          disabled={isView}
                          onChange={(e) => handleVariantChange(v.id, 'sku', e.target.value)}
                        />
                      </Box>
                      <Box>
                        <label className="form-label" style={{ fontSize: '0.8rem' }}>Unit Price *</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="form-field"
                          placeholder="0.00"
                          value={v.unit_price}
                          disabled={isView}
                          onChange={(e) => handleVariantChange(v.id, 'unit_price', e.target.value)}
                          required
                        />
                      </Box>
                    </Box>

                    {activeAttributes.length > 0 && (
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2, p: 1.5, bgcolor: '#fff', border: '1px solid #eee', borderRadius: 1 }}>
                        <Box sx={{ gridColumn: '1 / -1' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#666' }}>Attributes</span>
                        </Box>
                        {activeAttributes.map(attr => (
                          <Box key={attr.attribute_id}>
                            <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '4px', display: 'block' }}>{attr.attribute_name}</label>
                            <Autocomplete
                              multiple
                              freeSolo
                              size="small"
                              disabled={isView}
                              options={(attributeValuesMap[attr.attribute_id] || []).map(val => val.value)}
                              value={
                                Array.isArray(v.attributes[attr.attribute_id])
                                  ? v.attributes[attr.attribute_id]
                                  : (v.attributes[attr.attribute_id] ? [v.attributes[attr.attribute_id]] : [])
                              }
                              onChange={(event, newValue) => handleVariantAttrChange(v.id, attr.attribute_id, newValue)}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  placeholder={`Select ${attr.attribute_name} (e.g. Apple + Peach)`}
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      bgcolor: '#f8fafc',
                                      borderRadius: '8px',
                                      '& fieldset': { borderColor: '#e2e8f0' },
                                      '&:hover fieldset': { borderColor: '#cbd5e1' },
                                      '&.Mui-focused fieldset': { borderColor: '#4f46e5', borderWidth: '1px' },
                                    }
                                  }}
                                />
                              )}
                            />
                          </Box>
                        ))}
                      </Box>
                    )}

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 2 }}>
                      <Box>
                        <label className="form-label" style={{ fontSize: '0.8rem' }}>
                          {v.variant_id ? 'Current Qty' : 'Opening Qty'}
                        </label>
                        <input
                          type="number"
                          min="0"
                          className="form-field"
                          placeholder="0"
                          value={v.openingQty}
                          disabled={isView || Boolean(v.variant_id)}
                          onChange={(e) => handleVariantChange(v.id, 'openingQty', e.target.value)}
                        />
                      </Box>
                      <Box>
                        <label className="form-label" style={{ fontSize: '0.8rem' }}>Opening Note</label>
                        <input
                          type="text"
                          className="form-field"
                          placeholder="Note"
                          value={v.openingNote}
                          disabled={isView || Boolean(v.variant_id)}
                          onChange={(e) => handleVariantChange(v.id, 'openingNote', e.target.value)}
                        />
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button
          variant="text"
          onClick={handleClose}
          disabled={submitting}
          value={isView ? 'Close' : 'Cancel'}
        />

        {!isView && (
          <Button
            type="submit"
            form="product-form"
            value={submitting ? '' : isEdit ? 'Save changes' : 'Add product'}
            disabled={submitting || loadingDetails || ((isCreate || isEdit) && variants.length === 0)}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
          />
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ProductModal;
