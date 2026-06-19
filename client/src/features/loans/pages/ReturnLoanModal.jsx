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
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';

import Button from '../../../components/ui/Button/Button';
import './ReturnLoanModal.css';

const createEmptyForm = () => ({
  loanItemId: '',
  qty: 1,
  notes: '',
});

const ReturnLoanModal = ({
  open,
  onClose,
  onSubmit,
  submitting,
  loan = null,
}) => {
  const outstandingItems = useMemo(
    () => (loan?.items ?? []).filter((item) => item.remainingQty > 0),
    [loan]
  );

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

  const selectedLoanItemId = watch('loanItemId');

  const selectedLoanItem =
    outstandingItems.find(
      (item) => String(item.id) === String(selectedLoanItemId)
    ) ?? null;

  useEffect(() => {
    if (open && outstandingItems.length > 0) {
      reset({
        loanItemId: String(outstandingItems[0].id),
        qty: 1,
        notes: '',
      });
      return;
    }

    reset(createEmptyForm());
  }, [open, outstandingItems, reset]);

  const handleClose = () => {
    reset(createEmptyForm());
    onClose();
  };

  const handleFormSubmit = (values) => {
    onSubmit({
      loanItemId: Number(values.loanItemId),
      qty: Number(values.qty),
      notes: values.notes?.trim() || '',
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Return loan item</DialogTitle>

      <DialogContent dividers>
        <Box
          component="form"
          id="return-loan-form"
          onSubmit={handleSubmit(handleFormSubmit)}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}
        >
          <Box>
            <label className="form-label">Loan Item</label>
            <Controller
              name="loanItemId"
              control={control}
              rules={{ required: 'Loan item is required' }}
              render={({ field }) => (
                <FormControl fullWidth size="small" error={Boolean(errors.loanItemId)}>
                  <InputLabel id="return-loan-item-label">Loan Item *</InputLabel>
                  <Select
                    {...field}
                    labelId="return-loan-item-label"
                    label="Loan Item *"
                    value={field.value ?? ''}
                    onChange={(event) => field.onChange(event.target.value)}
                  >
                    <MenuItem value="" disabled>
                      Select item
                    </MenuItem>

                    {outstandingItems.map((item) => (
                      <MenuItem key={item.id} value={String(item.id)}>
                        {item.productCode} - {item.productName} (Remaining: {item.remainingQty})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
            {errors.loanItemId && (
              <span className="error-msg">{errors.loanItemId.message}</span>
            )}
          </Box>

          {selectedLoanItem && (
            <Box className="loan-return-summary">
              <div>Borrowed: {selectedLoanItem.qty}</div>
              <div>Returned: {selectedLoanItem.returnedQty}</div>
              <div>Remaining: {selectedLoanItem.remainingQty}</div>
            </Box>
          )}

          <Box>
            <label className="form-label">Return Qty</label>
            <input
              {...register('qty', {
                required: 'Return quantity is required',
                min: { value: 1, message: 'Return qty must be at least 1' },
                validate: (value) => {
                  if (!selectedLoanItem) return true;
                  return (
                    Number(value) <= selectedLoanItem.remainingQty ||
                    'Return qty cannot exceed remaining qty'
                  );
                },
                valueAsNumber: true,
              })}
              type="number"
              min="1"
              max={selectedLoanItem?.remainingQty ?? undefined}
              placeholder="Return qty *"
              className={`form-field${errors.qty ? ' field-error' : ''}`}
            />
            {errors.qty && <span className="error-msg">{errors.qty.message}</span>}
          </Box>

          <Box>
            <label className="form-label">Notes</label>
            <input
              {...register('notes')}
              placeholder="Optional notes"
              className="form-field"
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
          form="return-loan-form"
          value={submitting ? '' : 'Confirm return'}
          disabled={submitting || outstandingItems.length === 0}
          startIcon={submitting ? <CircularProgress size={16} /> : null}
        />
      </DialogActions>
    </Dialog>
  );
};

export default ReturnLoanModal;
