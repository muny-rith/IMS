import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import './CategoryModal.css';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  CircularProgress,
  Autocomplete,
  TextField,
  Chip,
} from '@mui/material';

import { fetchAttributes } from '../../attributes/services/attributeService';

import Button from '../../../components/ui/Button/Button';

const RULES = {
  name: { required: 'Category name is required' },
};

const EMPTY_FORM = {
  name: '',
  description: '',
  imageUrl: '',
  attributes: [],
};

const normalizeFormValues = (defaultValues, mode) => {
  if (!defaultValues || mode === 'create') {
    return EMPTY_FORM;
  }

  return {
    name: defaultValues.name ?? '',
    description: defaultValues.description ?? '',
    imageUrl: defaultValues.imageUrl ?? '',
    attributes: defaultValues.attributes ?? [],
  };
};

const CategoryModal = ({
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
  const [availableAttributes, setAvailableAttributes] = useState([]);
  const [selectedAttributes, setSelectedAttributes] = useState([]);

  useEffect(() => {
    const loadAttributes = async () => {
      try {
        const data = await fetchAttributes();
        setAvailableAttributes(data || []);
      } catch (err) {
        console.error('Failed to load attributes', err);
      }
    };
    loadAttributes();
  }, []);

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
      
      const selected = availableAttributes.filter(a => formValues.attributes.includes(a.attribute_id));
      setSelectedAttributes(selected);
      return;
    }

    reset(EMPTY_FORM);
    setImageFile(null);
    setImagePreview('');
    setSelectedAttributes([]);
  }, [open, formValues, reset]);

  const handleClose = () => {
    reset(EMPTY_FORM);
    setImageFile(null);
    setImagePreview('');
    setSelectedAttributes([]);
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
      attributes: selectedAttributes.map(a => a.attribute_id),
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isView ? 'View category' : isEdit ? 'Edit category' : 'Add category'}
      </DialogTitle>

      <DialogContent dividers>
        <Box
          component="form"
          id="category-form"
          onSubmit={handleSubmit(handleFormSubmit)}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}
        >
          <Box>
            <label className="form-label">Category Image</label>
            <div className="category-image-upload" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
              <div className="category-image-preview" style={{ width: '80px', height: '80px', border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Category preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '0.8rem', color: '#888' }}>No image</span>
                )}
              </div>
              {!isView && (
                <label className="category-image-button" style={{ cursor: 'pointer', padding: '0.5rem 1rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem' }}>
                  Choose image
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} hidden />
                </label>
              )}
            </div>
          </Box>
          <Box>
            <label className="form-label">Category Name</label>
            <input
              {...register('name', RULES.name)}
              disabled={isView}
              placeholder="Category name *"
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

          <Box>
            <label className="form-label">Linked Attributes</label>
            <Autocomplete
              multiple
              options={availableAttributes}
              getOptionLabel={(option) => option.attribute_name}
              value={selectedAttributes}
              disabled={isView}
              isOptionEqualToValue={(option, value) => option.attribute_id === value.attribute_id}
              onChange={(_, newValue) => setSelectedAttributes(newValue)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip variant="outlined" label={option.attribute_name} {...getTagProps({ index })} key={option.attribute_id} />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select attributes"
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px', backgroundColor: '#fff' } }}
                />
              )}
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
            form="category-form"
            value={submitting ? '' : isEdit ? 'Save changes' : 'Add category'}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} /> : null}
          />
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CategoryModal;
