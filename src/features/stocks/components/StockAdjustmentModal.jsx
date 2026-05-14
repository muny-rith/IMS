import React, { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';

import {
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  // InputLabel,
  MenuItem,
  Select,
} from '@mui/material';

import Button from '../../../components/ui/Button/Button';
import './StockAdjustmentModal.css';

const ADJUSTMENT_TYPES = [
  { value: 'ADJUSTMENT_IN', label: 'Adjustment In' },
  { value: 'ADJUSTMENT_OUT', label: 'Adjustment Out' },
];

const getToday = () => new Date().toISOString().slice(0, 10);

const createEmptyForm = () => ({
  type: 'ADJUSTMENT_IN',
  qty: 1,
  adjustmentDate: getToday(),
  notes: '',
});

const StockAdjustmentModal = ({
  open,
  onClose,
  onSubmit,
  submitting,
  selectedBalance = null,
}) => {
  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: createEmptyForm(),
  });

  const type = watch('type');
  const qty = Number(watch('qty') || 0);

  const onHandQty = Number(selectedBalance?.onHandQty ?? 0);
  const reservedQty = Number(selectedBalance?.reservedQty ?? 0);
  const availableQty = Number(selectedBalance?.availableQty ?? 0);

  const nextOnHandQty = useMemo(() => {
    if (type === 'ADJUSTMENT_OUT') {
      return onHandQty - qty;
    }

    return onHandQty + qty;
  }, [onHandQty, qty, type]);

  useEffect(() => {
    reset(createEmptyForm());
  }, [open, reset]);

  const handleClose = () => {
    reset(createEmptyForm());
    onClose();
  };

  const handleFormSubmit = (values) => {
    if (!selectedBalance?.productId) return;

    onSubmit({
      productId: selectedBalance.productId,
      type: values.type,
      qty: Number(values.qty),
      adjustmentDate: values.adjustmentDate,
      notes: values.notes.trim(),
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Adjust stock</DialogTitle>

      <DialogContent dividers>
        <Box
          component="form"
          id="stock-adjustment-form"
          onSubmit={handleSubmit(handleFormSubmit)}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}
        >
          <Box className="stock-adjustment-summary">
            <div className="stock-adjustment-summary__item item_code">
              <span className="stock-adjustment-summary__label">Code</span>
              <strong className="stock-adjustment-summary__value">
                {selectedBalance?.productCode || '—'}
              </strong>
            </div>

            <div className="stock-adjustment-summary__item stock-adjustment-summary__item--wide">
              <span className="stock-adjustment-summary__label">Product</span>
              <strong className="stock-adjustment-summary__value">
                {selectedBalance?.productName || '—'}
              </strong>
            </div>

            <div className="stock-adjustment-summary__item">
              <span className="stock-adjustment-summary__label">Category</span>
              <strong className="stock-adjustment-summary__value">
                {selectedBalance?.category ?? '—'}
              </strong>
            </div>

            <div className="stock-adjustment-summary__item">
              <span className="stock-adjustment-summary__label">On Hand</span>
              <strong className="stock-adjustment-summary__value">
                {onHandQty}
              </strong>
            </div>

            <div className="stock-adjustment-summary__item">
              <span className="stock-adjustment-summary__label">Reserved</span>
              <strong className="stock-adjustment-summary__value">
                {reservedQty}
              </strong>
            </div>

            <div className="stock-adjustment-summary__item">
              <span className="stock-adjustment-summary__label">Available</span>
              <strong className="stock-adjustment-summary__value">
                {availableQty}
              </strong>
            </div>
          </Box>


          <Box>
            <label className="form-label">Adjustment Type</label>
            <Controller
              name="type"
              control={control}
              rules={{ required: 'Adjustment type is required' }}
              render={({ field }) => (
                <FormControl fullWidth size="small" error={Boolean(errors.type)}>
                  {/* <InputLabel id="stock-adjustment-type-label">
                    Adjustment Type *
                  </InputLabel> */}
                  <Select
                    {...field}
                    labelId="stock-adjustment-type-label"
                    // label="Adjustment Type *"
                    value={field.value ?? ''}
                    onChange={(event) => field.onChange(event.target.value)}
                  >
                    {ADJUSTMENT_TYPES.map((item) => (
                      <MenuItem key={item.value} value={item.value}>
                        {item.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
            {errors.type && (
              <span className="error-msg">{errors.type.message}</span>
            )}
          </Box>

          <Box>
            <label className="form-label">Adjustment Date</label>
            <input
              {...register('adjustmentDate', {
                required: 'Adjustment date is required',
              })}
              type="date"
              className={`form-field${errors.adjustmentDate ? ' field-error' : ''
                }`}
            />
            {errors.adjustmentDate && (
              <span className="error-msg">
                {errors.adjustmentDate.message}
              </span>
            )}
          </Box>

          <Box>
            <label className="form-label">Quantity</label>
            <input
              {...register('qty', {
                required: 'Quantity is required',
                min: { value: 1, message: 'Quantity must be at least 1' },
                valueAsNumber: true,
                validate: (value) => {
                  const numericQty = Number(value);

                  if (!numericQty || numericQty < 1) {
                    return 'Quantity must be at least 1';
                  }

                  if (type === 'ADJUSTMENT_OUT' && numericQty > onHandQty) {
                    return `Only ${onHandQty} on hand`;
                  }

                  return true;
                },
              })}
              type="number"
              min="1"
              placeholder="Adjustment quantity *"
              className={`form-field${errors.qty ? ' field-error' : ''}`}
            />
            {errors.qty && (
              <span className="error-msg">{errors.qty.message}</span>
            )}
          </Box>

          <Box>
            <label className="form-label">Notes</label>
            <textarea
              {...register('notes')}
              rows={4}
              placeholder="Reason for adjustment"
              className={`form-field form-textarea${errors.notes ? ' field-error' : ''}`}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          variant="text"
          onClick={handleClose}
          disabled={submitting}
          value="Cancel"
        />
        <Button
          type="submit"
          form="stock-adjustment-form"
          value={submitting ? '' : 'Apply adjustment'}
          disabled={submitting || !selectedBalance?.productId}
          startIcon={submitting ? <CircularProgress size={16} /> : null}
        />
      </DialogActions>
    </Dialog>
  );
};

export default StockAdjustmentModal;
