import React, { useEffect, useMemo } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';

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
  Autocomplete,
  TextField,
} from '@mui/material';

import Button from '../../../components/ui/Button/Button';
import './LoanModal.css';

const getToday = () => new Date().toISOString().slice(0, 10);

const createEmptyItem = () => ({
  productId: '',
  qty: 1,
});

const createEmptyForm = () => ({
  workerId: '',
  loanDate: getToday(),
  dueDate: '',
  notes: '',
  items: [createEmptyItem()],
});

const normalizeFormValues = (defaultValues, mode) => {
  if (!defaultValues || mode === 'create') {
    return createEmptyForm();
  }

  return {
    workerId:
      defaultValues.workerId !== undefined && defaultValues.workerId !== null
        ? String(defaultValues.workerId)
        : '',
    loanDate: defaultValues.loanDate ?? getToday(),
    dueDate: defaultValues.dueDate ?? '',
    notes: defaultValues.notes ?? '',
    items:
      defaultValues.items?.length > 0
        ? defaultValues.items.map((item) => ({
          productId:
            item.productId !== undefined && item.productId !== null
              ? String(item.productId)
              : '',
          qty: item.qty ?? 1,
        }))
        : [createEmptyItem()],
  };
};

const RULES = {
  workerId: { required: 'Worker is required' },
  loanDate: { required: 'Loan date is required' },
};

const LoanModal = ({
  open,
  onClose,
  onSubmit,
  submitting,
  workers = [],
  products = [],
  defaultValues = null,
  mode = 'create',
}) => {
  const isView = mode === 'view';

  const formValues = useMemo(
    () => normalizeFormValues(defaultValues, mode),
    [defaultValues, mode]
  );

  const viewItems = defaultValues?.items ?? [];

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

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedItems = watch('items');
  const loanDate = watch('loanDate');

  useEffect(() => {
    if (open) {
      reset(formValues);
      return;
    }

    reset(createEmptyForm());
  }, [open, formValues, reset]);

  const handleClose = () => {
    reset(createEmptyForm());
    onClose();
  };

  const getSelectedProductId = (index) =>
    watchedItems?.[index]?.productId ? String(watchedItems[index].productId) : '';

  const getProductById = (productId) =>
    products.find((product) => String(product.id) === String(productId));

  // const isSelectedInAnotherRow = (productId, currentIndex) =>
  //   (watchedItems ?? []).some(
  //     (item, index) =>
  //       index !== currentIndex &&
  //       String(item?.productId || '') === String(productId)
  //   );

  const handleFormSubmit = (values) => {
    const normalizedItems = (values.items ?? [])
      .map((item) => ({
        productId: item.productId ? Number(item.productId) : null,
        qty: Number(item.qty),
      }))
      .filter((item) => item.productId && item.qty > 0);

    onSubmit({
      workerId: values.workerId ? Number(values.workerId) : null,
      loanDate: values.loanDate,
      dueDate: values.dueDate || null,
      notes: values.notes?.trim() || '',
      items: normalizedItems,
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{isView ? 'View loan' : 'Create loan'}</DialogTitle>

      <DialogContent dividers>
        <Box
          component="form"
          id="loan-form"
          onSubmit={handleSubmit(handleFormSubmit)}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}
        >
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box>
              <label className="form-label">Worker</label>
              <Controller
                name="workerId"
                control={control}
                rules={RULES.workerId}
                render={({ field }) => (
                  <FormControl fullWidth size="small" error={Boolean(errors.workerId)}>
                    <InputLabel id="loan-worker-label">Worker *</InputLabel>
                    <Select
                      {...field}
                      labelId="loan-worker-label"
                      label="Worker *"
                      disabled={isView}
                      value={field.value ?? ''}
                      onChange={(event) => field.onChange(event.target.value)}
                    >
                      <MenuItem value="" disabled>
                        Select worker
                      </MenuItem>

                      {workers.map((worker) => (
                        <MenuItem key={worker.id} value={String(worker.id)}>
                          {worker.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
              {errors.workerId && (
                <span className="error-msg">{errors.workerId.message}</span>
              )}
            </Box>

            <Box>
              <label className="form-label">Loan Date</label>
              <input
                {...register('loanDate', RULES.loanDate)}
                type="date"
                disabled={isView}
                className={`form-field${errors.loanDate ? ' field-error' : ''}`}
              />
              {errors.loanDate && (
                <span className="error-msg">{errors.loanDate.message}</span>
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box>
              <label className="form-label">Due Date</label>
              <input
                {...register('dueDate', {
                  validate: (value) => {
                    if (!value || !loanDate) return true;
                    return value >= loanDate || 'Due date must be on or after loan date';
                  },
                })}
                type="date"
                disabled={isView}
                className={`form-field${errors.dueDate ? ' field-error' : ''}`}
              />
              {errors.dueDate && (
                <span className="error-msg">{errors.dueDate.message}</span>
              )}
            </Box>

            <Box>
              <label className="form-label">Notes</label>
              <input
                {...register('notes')}
                disabled={isView}
                placeholder="Optional notes"
                className="form-field"
              />
            </Box>
          </Box>

          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1,
              }}
            >
              <label className="form-label">Loan Items</label>

              {!isView && (
                <Button
                  type="button"
                  value="Add row"
                  onClick={() => append(createEmptyItem())}
                />
              )}
            </Box>

            <Box sx={{ display: 'grid', gap: 2 }}>
              {fields.map((field, index) => {
                const selectedProductId = getSelectedProductId(index);
                const selectedProduct = getProductById(selectedProductId);

                return (
                  <Box
                    key={field.id}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: isView ? '1.6fr 0.8fr' : '1.6fr 0.8fr auto',
                      gap: 2,
                      alignItems: 'start',
                    }}
                  >
                    <Box>
                      <Controller
                        name={`items.${index}.productId`}
                        control={control}
                        rules={{ required: 'Product is required' }}
                        render={({ field }) => {
                          const selectedProduct =
                            products.find((product) => String(product.id) === String(field.value)) ?? null;

                          return (
                            <Autocomplete
                              options={products}
                              value={selectedProduct}
                              disabled={isView}
                              disablePortal={false}
                              isOptionEqualToValue={(option, value) =>
                                String(option.id) === String(value.id)
                              }
                              getOptionLabel={(option) => option?.label ?? ''}
                              onChange={(_, option) =>
                                field.onChange(option ? String(option.id) : '')
                              }
                              // ListboxProps={{
                              //   style: {
                              //     maxHeight: 10,
                              //     overflowY: 'auto',
                              //   },
                              // }}

                              slotProps={{
                                popper: {
                                  modifiers: [
                                    {
                                      name: 'flip',
                                      enabled: false,
                                    },
                                  ],
                                },
                                listbox: {
                                  sx: {
                                    maxHeight: 220,
                                    overflowY: 'auto',
                                  },
                                },
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Product *"
                                  size="small"
                                  error={Boolean(errors.items?.[index]?.productId)}
                                  helperText={errors.items?.[index]?.productId?.message}
                                />
                              )}
                            />
                          );
                        }}
                      />



                      {selectedProduct && (
                        <Box sx={{ mt: 0.75, fontSize: 12, color: '#9aa4b2' }}>
                          Available stock: {selectedProduct.availableQty}
                        </Box>
                      )}
                    </Box>

                    <Box>
                      <input
                        {...register(`items.${index}.qty`, {
                          required: 'Qty is required',
                          min: { value: 1, message: 'Qty must be at least 1' },
                          valueAsNumber: true,
                          validate: (value) => {
                            const qty = Number(value);

                            if (!qty || qty < 1) {
                              return 'Qty must be at least 1';
                            }

                            if (!selectedProduct) {
                              return 'Select product first.';
                            }

                            return (
                              qty <= Number(selectedProduct.availableQty) ||
                              `Only ${selectedProduct.availableQty} available`
                            );
                          },
                        })}
                        disabled={isView}
                        type="number"
                        min="1"
                        placeholder="Qty *"
                        className={`form-field${errors.items?.[index]?.qty ? ' field-error' : ''
                          }`}
                      />
                      {errors.items?.[index]?.qty && (
                        <span className="error-msg">
                          {errors.items[index].qty.message}
                        </span>
                      )}

                      {isView && viewItems[index] && (
                        <Box sx={{ mt: 0.75, fontSize: 12, color: '#9aa4b2' }}>
                          Returned: {viewItems[index].returnedQty ?? 0} | Remaining:{' '}
                          {viewItems[index].remainingQty ?? viewItems[index].qty ?? 0}
                        </Box>
                      )}
                    </Box>

                    {!isView && (
                      <Button
                        type="button"
                        variant="text"
                        value="Remove"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                      />
                    )}
                  </Box>
                );
              })}
            </Box>
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
            form="loan-form"
            value={submitting ? '' : 'Create loan'}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} /> : null}
          />
        )}
      </DialogActions>
    </Dialog>
  );
};

export default LoanModal;
