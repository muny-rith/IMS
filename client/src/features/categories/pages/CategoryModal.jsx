import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import './CategoryModal.css';

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
  name: { required: 'Category name is required' },
};

const EMPTY_FORM = {
  name: '',
  description: '',
};

const normalizeFormValues = (defaultValues, mode) => {
  if (!defaultValues || mode === 'create') {
    return EMPTY_FORM;
  }

  return {
    name: defaultValues.name ?? '',
    description: defaultValues.description ?? '',
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
      return;
    }

    reset(EMPTY_FORM);
  }, [open, formValues, reset]);

  const handleClose = () => {
    reset(EMPTY_FORM);
    onClose();
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
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}
        >
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
