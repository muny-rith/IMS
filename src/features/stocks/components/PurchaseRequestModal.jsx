import React, { useEffect, useMemo, useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';

const EMPTY_ITEM = {
  itemType: 'product',
  productId: '',
  customItemName: '',
  qty: 1,
  reason: '',
};

const createEmptyForm = () => ({
  requestedBy: '',
  requestedDate: new Date().toISOString().slice(0, 10),
  purpose: '',
  items: [{ ...EMPTY_ITEM }],
});

const normalizeFormValues = (defaultValues, mode) => {
  if (!defaultValues || mode === 'create') {
    return createEmptyForm();
  }

  return {
    requestedBy: defaultValues.requestedBy ?? '',
    requestedDate:
      defaultValues.requestedDate ?? new Date().toISOString().slice(0, 10),
    purpose: defaultValues.purpose ?? '',
    items: defaultValues.items?.length
      ? defaultValues.items.map((item) => ({
          itemType: item.productId ? 'product' : 'custom',
          productId:
            item.productId !== undefined && item.productId !== null
              ? String(item.productId)
              : '',
          customItemName: item.customItemName ?? '',
          qty: item.requestedQty ?? item.qty ?? 1,
          reason: item.reason ?? '',
        }))
      : [{ ...EMPTY_ITEM }],
  };
};

const PurchaseRequestModal = ({
  open,
  onClose,
  onSubmit,
  products = [],
  submitting = false,
  mode = 'create',
  defaultValues = null,
}) => {
  const [form, setForm] = useState(createEmptyForm);
  const isEdit = mode === 'edit';
  const formValues = useMemo(
    () => normalizeFormValues(defaultValues, mode),
    [defaultValues, mode]
  );

  useEffect(() => {
    if (open) {
      setForm(formValues);
    }
  }, [formValues, open]);

  if (!open) return null;

  const getSelectedProduct = (productId) =>
    products.find((product) => String(product.id) === String(productId)) ?? null;

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateItem = (index, field, value) => {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const updateItemType = (index, itemType) => {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              itemType,
              productId: itemType === 'product' ? item.productId : '',
              customItemName:
                itemType === 'custom' ? item.customItemName : '',
            }
          : item
      ),
    }));
  };

  const addItem = () => {
    setForm((current) => ({
      ...current,
      items: [...current.items, { ...EMPTY_ITEM }],
    }));
  };

  const removeItem = (index) => {
    setForm((current) => ({
      ...current,
      items:
        current.items.length === 1
          ? current.items
          : current.items.filter((_item, itemIndex) => itemIndex !== index),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const items = form.items
      .map((item) => {
        const isCustom = item.itemType === 'custom';

        return {
          productId: isCustom ? null : Number(item.productId),
          customItemName: isCustom ? item.customItemName.trim() : '',
          requestedQty: Number(item.qty),
          reason: item.reason.trim(),
        };
      })
      .filter(
        (item) =>
          item.requestedQty > 0 && (item.productId || item.customItemName)
      );

    if (!form.requestedBy.trim() || !form.requestedDate || !items.length) {
      return;
    }

    onSubmit({
      requestedBy: form.requestedBy.trim(),
      requestedDate: form.requestedDate,
      purpose: form.purpose.trim(),
      items,
    });
  };

  let submitLabel = isEdit ? 'Save Changes' : 'Create Request';

  if (submitting) {
    submitLabel = isEdit ? 'Saving...' : 'Creating...';
  }

  return (
    <div className="purchase-request-modal" role="dialog" aria-modal="true">
      <div className="purchase-request-modal__backdrop" onClick={onClose} />

      <form className="purchase-request-modal__paper" onSubmit={handleSubmit}>
        <div className="purchase-request-modal__header">
          <div>
            <p className="purchase-request-eyebrow">
              {isEdit ? 'Edit request' : 'Material request'}
            </p>
            <h3>បណ្ណស្នើរទិញសម្ភារៈ</h3>
          </div>

          <button
            type="button"
            className="purchase-request-icon-button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close purchase request form"
          >
            x
          </button>
        </div>

        <div className="purchase-request-form-grid">
          <label className="purchase-request-field">
            <span>Requested By *</span>
            <input
              value={form.requestedBy}
              onChange={(event) => updateField('requestedBy', event.target.value)}
              placeholder="Example: Warehouse"
              disabled={submitting}
              required
            />
          </label>

          <label className="purchase-request-field">
            <span>Request Date *</span>
            <input
              type="date"
              value={form.requestedDate}
              onChange={(event) =>
                updateField('requestedDate', event.target.value)
              }
              disabled={submitting}
              required
            />
          </label>
        </div>

        <label className="purchase-request-field">
          <span>Purpose / Note</span>
          <textarea
            value={form.purpose}
            onChange={(event) => updateField('purpose', event.target.value)}
            placeholder="Why are these materials needed?"
            rows={3}
            disabled={submitting}
          />
        </label>

        <div className="purchase-request-items">
          <div className="purchase-request-items__header">
            <strong>Requested items</strong>
            <button
              type="button"
              className="purchase-request-secondary-button"
              onClick={addItem}
              disabled={submitting}
            >
              Add item
            </button>
          </div>

          {form.items.map((item, index) => (
            <div className="purchase-request-item-row" key={index}>
              <label className="purchase-request-field">
                <span>Item Type *</span>
                <select
                  value={item.itemType}
                  onChange={(event) => updateItemType(index, event.target.value)}
                  disabled={submitting}
                >
                  <option value="product">Product</option>
                  <option value="custom">Custom</option>
                </select>
              </label>

              <label className="purchase-request-field">
                <span>{item.itemType === 'custom' ? 'Custom Item *' : 'Product *'}</span>
                {item.itemType === 'custom' ? (
                  <input
                    value={item.customItemName}
                    onChange={(event) =>
                      updateItem(index, 'customItemName', event.target.value)
                    }
                    placeholder="Example: Pen"
                    disabled={submitting}
                    required
                  />
                ) : (
                  <Autocomplete
                    options={products}
                    value={getSelectedProduct(item.productId)}
                    disabled={submitting}
                    disablePortal={false}
                    isOptionEqualToValue={(option, value) =>
                      String(option.id) === String(value.id)
                    }
                    getOptionLabel={(option) => option?.label ?? ''}
                    onChange={(_event, option) =>
                      updateItem(index, 'productId', option ? String(option.id) : '')
                    }
                    componentsProps={{
                      popper: {
                        className: 'purchase-request-product-popper',
                        modifiers: [{ name: 'flip', enabled: false }],
                      },
                      paper: {
                        className: 'purchase-request-product-paper',
                      },
                    }}
                    ListboxProps={{
                      className: 'purchase-request-product-listbox',
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required
                        size="small"
                        placeholder="Search product..."
                        className="purchase-request-product-input"
                      />
                    )}
                  />
                )}
              </label>

              <label className="purchase-request-field">
                <span>Qty *</span>
                <input
                  type="number"
                  min="1"
                  value={item.qty}
                  onChange={(event) => updateItem(index, 'qty', event.target.value)}
                  disabled={submitting}
                  required
                />
              </label>

              <label className="purchase-request-field">
                <span>Reason</span>
                <input
                  value={item.reason}
                  onChange={(event) =>
                    updateItem(index, 'reason', event.target.value)
                  }
                  placeholder="Optional"
                  disabled={submitting}
                />
              </label>

              <button
                type="button"
                className="purchase-request-remove-button"
                onClick={() => removeItem(index)}
                disabled={submitting || form.items.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="purchase-request-modal__actions">
          <button
            type="button"
            className="purchase-request-secondary-button"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="purchase-request-primary-button"
            disabled={submitting}
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PurchaseRequestModal;
