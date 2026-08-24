import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import './BrandModal.css';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  CircularProgress,
} from '@mui/material';

import Button from '../../../components/ui/Button/Button';

const RULES = {
  name: { required: 'Brand name is required' },
};

const EMPTY_FORM = {
  name: '',
  description: '',
  imageUrl: '',
};

const normalizeFormValues = (defaultValues, mode) => {
  if (!defaultValues || mode === 'create') {
    return EMPTY_FORM;
  }

  return {
    name: defaultValues.name ?? '',
    description: defaultValues.description ?? '',
    imageUrl: defaultValues.imageUrl ?? '',
  };
};

const BrandModal = ({
  open,
  onClose,
  onSubmit,
  submitting,
  defaultValues = null,
  mode = 'create',
}) => {
  const isEdit = mode === 'edit';
  const isView = mode === 'view';

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const formValues = useMemo(
    () => normalizeFormValues(defaultValues, mode),
    [defaultValues, mode]
  );

  const {
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
      name: values.name.trim(),
      description: values.description?.trim() || '',
      imageFile,
      imageUrl: formValues.imageUrl || '',
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isView ? 'View brand' : isEdit ? 'Edit brand' : 'Add brand'}
      </DialogTitle>

      <DialogContent dividers>
        <Box
          component="form"
          id="brand-form"
          onSubmit={handleSubmit(handleFormSubmit)}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}
        >
          <Box>
            <label className="form-label">Brand Image</label>

            <div className="brand-image-upload" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
              <div className="brand-image-preview" style={{ width: '80px', height: '80px', border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Brand preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '0.8rem', color: '#888' }}>No image</span>
                )}
              </div>

              {!isView && (
                <label className="brand-image-button" style={{ cursor: 'pointer', padding: '0.5rem 1rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem' }}>
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
            <label className="form-label">Brand Name</label>
            <input
              {...register('name', RULES.name)}
              disabled={isView}
              placeholder="Brand name *"
              className={`form-field${errors.name ? ' field-error' : ''}`}
            />
            {errors.name && <span className="error-msg">{errors.name.message}</span>}
          </Box>

          <Box>
            <label className="form-label">Description</label>
            <input
              {...register('description')}
              disabled={isView}
              placeholder="Description"
              rows={4}
              className={`form-field${errors.description ? ' field-error' : ''
              }`}
            />
          </Box>
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
            form="brand-form"
            value={submitting ? '' : isEdit ? 'Save changes' : 'Add brand'}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} /> : null}
          />
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BrandModal;
