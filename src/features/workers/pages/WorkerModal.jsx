import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import './WorkerModal.css';

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
  code: { required: 'Worker code is required' },
  name: { required: 'Worker name is required' },
  positionTitle: { required: 'Position is required' },
  department: { required: 'Department is required' },
};

const EMPTY_FORM = {
  code: '',
  name: '',
  positionTitle: '',
  department: '',
};

const normalizeFormValues = (defaultValues, mode) => {
  if (!defaultValues || mode === 'create') {
    return EMPTY_FORM;
  }

  return {
    code: defaultValues.code ?? '',
    name: defaultValues.name ?? '',
    positionTitle: defaultValues.positionTitle ?? '',
    department: defaultValues.department ?? '',
  };
};

const WorkerModal = ({
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
        {isView ? 'View worker' : isEdit ? 'Edit worker' : 'Add worker'}
      </DialogTitle>

      <DialogContent dividers>
        <Box
          component="form"
          id="worker-form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}
        >
          <Box>
            <label className="form-label">Worker Code</label>
            <input
              {...register('code', RULES.code)}
              disabled={isView}
              placeholder="Worker code *"
              className={`form-field${errors.code ? ' field-error' : ''}`}
            />
            {errors.code && <span className="error-msg">{errors.code.message}</span>}
          </Box>

          <Box>
            <label className="form-label">Worker Name</label>
            <input
              {...register('name', RULES.name)}
              disabled={isView}
              placeholder="Worker name *"
              className={`form-field${errors.name ? ' field-error' : ''}`}
            />
            {errors.name && <span className="error-msg">{errors.name.message}</span>}
          </Box>

          <Box>
            <label className="form-label">Position</label>
            <input
              {...register('positionTitle', RULES.positionTitle)}
              disabled={isView}
              placeholder="Position title *"
              className={`form-field${errors.positionTitle ? ' field-error' : ''}`}
            />
            {errors.positionTitle && (
              <span className="error-msg">{errors.positionTitle.message}</span>
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
            form="worker-form"
            value={submitting ? '' : isEdit ? 'Save changes' : 'Add worker'}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} /> : null}
          />
        )}
      </DialogActions>
    </Dialog>
  );
};

export default WorkerModal;
