// pages/product/ProductModal.jsx

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import './ProductModal.css'

import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, MenuItem, Select, FormControl, InputLabel,
  CircularProgress,
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
  qty: {
    required: 'Quantity is required',
    min: { value: 0, message: 'Quantity must be ≥ 0' },
  },
};

const ProductModal = ({ open, onClose, onSubmit, submitting, categories, defaultValues, viewOnly }) => {
  const isEdit = Boolean(defaultValues) && !viewOnly  // has data + not viewing
  const isView = Boolean(defaultValues) && viewOnly   // has data + viewing
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: defaultValues ?? {} });

  useEffect(() => {
    if (open) reset(defaultValues ?? {});
  }, [open, defaultValues, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isView ? 'View product' : isEdit ? 'Edit product' : 'Add product'}
      </DialogTitle>

      <DialogContent dividers>
        <Box
          component="form"
          id="product-form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}
        >
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

            <FormControl fullWidth size="small" error={Boolean(errors.categoryId)}>

              <InputLabel>Category *</InputLabel>
              <Select
                {...register('categoryId', RULES.categoryId)}
                disabled={isView}
                label="Category *"
                defaultValue=""
              >
                <MenuItem value="" disabled>Select category</MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c.cate_id} value={c.cate_id}>
                    {c.cate_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {errors.categoryId && <span className="error-msg">{errors.categoryId.message}</span>}
          </Box>

          <Box>
            <label className="form-label">Department</label>

            <input
              {...register('department', RULES.department)}
              disabled={isView}
              placeholder="Department *"
              className={`form-field${errors.department ? ' field-error' : ''}`}
            />
            {errors.department && <span className="error-msg">{errors.department.message}</span>}
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>

            <Box>
            <label className="form-label">Price</label>

              <input
                {...register('price', RULES.price)}
                disabled={isView}
                type="number"
                min="0"
                placeholder="Price *"
                className={`form-field${errors.price ? ' field-error' : ''}`}
              />
              {errors.price && <span className="error-msg">{errors.price.message}</span>}
            </Box>
            <Box>
              <label className="form-label">Qty</label>

              <input
                {...register('qty', RULES.qty)}
                disabled={isView}
                type="number"
                min="0"
                placeholder="Quantity *"
                className={`form-field${errors.qty ? ' field-error' : ''}`}
              />
              {errors.qty && <span className="error-msg">{errors.qty.message}</span>}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button variant="text" onClick={handleClose} disabled={submitting} value={"Cancel"}></Button>
        <Button
          type="submit"
          form="product-form"
          value={submitting ? '' : isEdit ? 'Save changes' : 'Add product'}
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={16} /> : null}
        />
      </DialogActions>
    </Dialog>
  );
};

export default ProductModal;