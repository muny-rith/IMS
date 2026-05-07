import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import './ProductModal.css';

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
} from '@mui/material';

import Button from '../../../components/ui/Button/Button';

const RULES = {
  code: { required: 'Code is required' },
  name: { required: 'Name is required' },
  categoryId: { required: 'Category is required' },
  department: { required: 'Department is required' },
  price: {
    required: 'Price is required',
    min: { value: 0, message: 'Price must be ≥ 0' },
  },
  openingQty: {
    min: { value: 0, message: 'Opening stock must be ≥ 0' },
  },
};

const EMPTY_FORM = {
  code: '',
  name: '',
  categoryId: '',
  department: '',
  price: '',
  openingQty: '',
  openingNote: '',
  imageUrl: '',
};

const normalizeFormValues = (defaultValues, mode) => {
  if (!defaultValues || mode === 'create') {
    return EMPTY_FORM;
  }

  return {
    code: defaultValues.code ?? '',
    name: defaultValues.name ?? '',
    categoryId:
      defaultValues.categoryId !== undefined && defaultValues.categoryId !== null
        ? String(defaultValues.categoryId)
        : '',
    department: defaultValues.department ?? '',
    price: defaultValues.price ?? '',
    openingQty: '',
    openingNote: '',
    imageUrl: defaultValues.imageUrl ?? defaultValues.image ?? '',
  };
};

const ProductModal = ({
  open,
  onClose,
  onSubmit,
  submitting,
  categories = [],
  defaultValues = null,
  mode = 'create',
}) => {
  const isCreate = mode === 'create';
  const isEdit = mode === 'edit';
  const isView = mode === 'view';

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const formValues = useMemo(
    () => normalizeFormValues(defaultValues, mode),
    [defaultValues, mode]
  );

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: EMPTY_FORM,
  });

  useEffect(() => {
    if (open) {
      reset(formValues);
      setImageFile(null);
      setImagePreview(formValues.imageUrl || '');
      return;
    }

    reset(EMPTY_FORM);
    setImageFile(null);
    setImagePreview('');
  }, [open, formValues, reset]);

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
      code: values.code.trim(),
      name: values.name.trim(),
      categoryId: values.categoryId ? Number(values.categoryId) : null,
      department: values.department.trim(),
      price: Number(values.price),
      openingQty: isCreate && values.openingQty !== '' ? Number(values.openingQty) : 0,
      openingNote: isCreate ? values.openingNote?.trim() || '' : '',
      imageFile,
      imageUrl: formValues.imageUrl || '',
    });
  };

  const onHandQty = Number(defaultValues?.qty ?? 0);
  const reservedQty = Number(defaultValues?.reservedQty ?? 0);
  const availableQty = Number(defaultValues?.availableQty ?? onHandQty - reservedQty);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isView ? 'View product' : isEdit ? 'Edit product' : 'Add product'}
      </DialogTitle>

      <DialogContent dividers>
        <Box
          component="form"
          id="product-form"
          onSubmit={handleSubmit(handleFormSubmit)}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}
        >
          <Box>
            <label className="form-label">Product Image</label>

            <div className="product-image-upload">
              <div className="product-image-preview">
                {imagePreview ? (
                  <img src={imagePreview} alt="Product preview" />
                ) : (
                  <span>No image</span>
                )}
              </div>

              {!isView && (
                <label className="product-image-button">
                  Choose image
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    hidden
                  />
                </label>
              )}
            </div>
          </Box>

          <Box>
            <label className="form-label">Code</label>
            <input
              {...register('code', RULES.code)}
              disabled={isView}
              placeholder="Product code *"
              className={`form-field${errors.code ? ' field-error' : ''}`}
            />
            {errors.code && <span className="error-msg">{errors.code.message}</span>}
          </Box>

          <Box>
            <label className="form-label">Name</label>
            <input
              {...register('name', RULES.name)}
              disabled={isView}
              placeholder="Product name *"
              className={`form-field${errors.name ? ' field-error' : ''}`}
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
                  >
                    <MenuItem value="" disabled>
                      Select category
                    </MenuItem>
                    {categories.map((c) => (
                      <MenuItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />

            {errors.categoryId && (
              <span className="error-msg">{errors.categoryId.message}</span>
            )}
          </Box>

          <Box>
            <label className="form-label">Department</label>
            <input
              {...register('department', RULES.department)}
              disabled={isView}
              placeholder="Department *"
              className={`form-field${errors.department ? ' field-error' : ''}`}
            />
            {errors.department && (
              <span className="error-msg">{errors.department.message}</span>
            )}
          </Box>

          <Box>
            <label className="form-label">Price</label>
            <input
              {...register('price', RULES.price)}
              disabled={isView}
              type="number"
              min="0"
              step="0.01"
              placeholder="Price *"
              className={`form-field${errors.price ? ' field-error' : ''}`}
            />
            {errors.price && <span className="error-msg">{errors.price.message}</span>}
          </Box>

          {isCreate && (
            <>
              <Box>
                <label className="form-label">Opening Stock</label>
                <input
                  {...register('openingQty', RULES.openingQty)}
                  type="number"
                  min="0"
                  placeholder="Optional opening stock"
                  className={`form-field${errors.openingQty ? ' field-error' : ''}`}
                />
                {errors.openingQty && (
                  <span className="error-msg">{errors.openingQty.message}</span>
                )}
              </Box>

              <Box>
                <label className="form-label">Opening Note</label>
                <input
                  {...register('openingNote')}
                  placeholder="Optional opening stock note"
                  className="form-field"
                />
              </Box>
            </>
          )}

          {isView && (
            <Box className="product-stock-summary">
              <div>
                <strong>On Hand</strong>
                <span>{onHandQty}</span>
              </div>
              <div>
                <strong>Reserved</strong>
                <span>{reservedQty}</span>
              </div>
              <div>
                <strong>Available</strong>
                <span>{availableQty}</span>
              </div>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
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
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} /> : null}
          />
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ProductModal;
