import React, { useEffect, useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';
// import "./PurchaseRequest.css"

const EMPTY_ITEM = {
  productId: '',
  qty: 1,
  reason: '',
};

const createEmptyForm = () => ({
  requestedBy: '',
  requestedDate: new Date().toISOString().slice(0, 10),
  purpose: '',
  items: [{ ...EMPTY_ITEM }],
});

const PurchaseRequestModal = ({
  open,
  onClose,
  onSubmit,
  products = [],
  submitting = false,
}) => {
  const [form, setForm] = useState(createEmptyForm);

  useEffect(() => {
    if (open) {
      setForm(createEmptyForm());
    }
  }, [open]);

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
      .map((item) => ({
        productId: Number(item.productId),
        requestedQty: Number(item.qty),
        reason: item.reason.trim(),
      }))
      .filter((item) => item.productId && item.requestedQty > 0);

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

  return (
    <div className="purchase-request-modal" role="dialog" aria-modal="true">
      <div className="purchase-request-modal__backdrop" onClick={onClose} />

      <form className="purchase-request-modal__paper" onSubmit={handleSubmit}>
        <div className="purchase-request-modal__header">
          <div>
            <p className="purchase-request-eyebrow">Material request</p>
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
                <span>Product *</span>
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
                      required
                      size="small"
                      placeholder="Search product..."
                      className="purchase-request-product-input"
                    />
                  )}
                />
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
            {submitting ? 'Creating...' : 'Create Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PurchaseRequestModal;
