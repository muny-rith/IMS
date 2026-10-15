import React, { useMemo, useState } from 'react';
import { Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

import Button from '../../../components/ui/Button/Button';
import Input from '../../../components/ui/Input/Input';
import MultiSelect from '../../../components/ui/MultiSelect/MultiSelect';
import ImageDropzone from '../../../components/ui/ImageDropzone/ImageDropzone';

const ProductVariantsStudio = ({
  variants = [],
  selectedVariantId: controlledSelectedId,
  onSelectVariant,
  onAddVariant,
  onRemoveVariant,
  onVariantChange,
  onVariantAttrChange,
  onVariantImageChange,
  onVariantImageRemove,
  activeAttributes = [],
  attributeValuesMap = {},
}) => {
  const [internalSelectedId, setInternalSelectedId] = useState(null);

  const selectedVariantId = controlledSelectedId !== undefined ? controlledSelectedId : internalSelectedId;

  const handleSelect = (id) => {
    if (onSelectVariant) {
      onSelectVariant(id);
    } else {
      setInternalSelectedId(id);
    }
  };

  const activeSelectedId = useMemo(() => {
    if (variants.some((v) => v.id === selectedVariantId)) {
      return selectedVariantId;
    }
    return variants[0]?.id || null;
  }, [variants, selectedVariantId]);

  const selectedVariantIndex = useMemo(() => {
    return variants.findIndex((v) => v.id === activeSelectedId);
  }, [variants, activeSelectedId]);

  const selectedVariant = useMemo(() => {
    return variants[selectedVariantIndex] || variants[0] || null;
  }, [variants, selectedVariantIndex]);

  const handlePrevVariant = () => {
    if (selectedVariantIndex > 0) {
      const prev = variants[selectedVariantIndex - 1];
      if (prev) handleSelect(prev.id);
    }
  };

  const handleNextVariant = () => {
    if (selectedVariantIndex < variants.length - 1) {
      const next = variants[selectedVariantIndex + 1];
      if (next) handleSelect(next.id);
    }
  };

  return (
    <div className="product-variants-studio-wrapper">
      {/* Variants Studio: Master-Detail Split Workbench */}
      {variants.length === 0 ? (
        <div className="product-matrix-empty">
          <p>No variants defined for this product.</p>
          <Button
            variant="outline"
            icon={<AddIcon sx={{ fontSize: 16 }} />}
            onClick={onAddVariant}
          >
            Create First Variant
          </Button>
        </div>
      ) : (
        <div className="product-workbench-container">
          <div className="product-workbench-layout">
            {/* Left Sidebar: Variant List */}
            <div className="product-workbench-sidebar">
              <div className="product-workbench-sidebar__header">
                <span className="product-workbench-sidebar__title">
                  <span>Variants List</span>
                  <span className="product-form-card__badge">{variants.length}</span>
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  icon={<AddIcon sx={{ fontSize: 14 }} />}
                  onClick={onAddVariant}
                >
                  Add
                </Button>
              </div>

              <div className="product-workbench-list">
                {variants.map((v, idx) => {
                  const isSelected = v.id === activeSelectedId;
                  const attrSummary = activeAttributes
                    .map((attr) => {
                      const val = v.attributes[attr.attribute_id];
                      const valText = Array.isArray(val) ? val.join(', ') : val || '';
                      return valText ? `${attr.attribute_name}: ${valText}` : null;
                    })
                    .filter(Boolean)
                    .join(' • ');

                  return (
                    <div
                      key={v.id}
                      className={`product-workbench-item ${
                        isSelected ? 'product-workbench-item--active' : ''
                      }`}
                      onClick={() => handleSelect(v.id)}
                    >
                      <span className="product-workbench-item__num">#{idx + 1}</span>

                      <div className="product-workbench-item__thumb">
                        {v.imagePreview ? (
                          <img src={v.imagePreview} alt={`Variant ${idx + 1}`} />
                        ) : (
                          <span className="product-workbench-item__thumb-empty">Auto</span>
                        )}
                      </div>

                      <div className="product-workbench-item__info">
                        <span className="product-workbench-item__sku">
                          {v.sku || `Variant ${idx + 1}`}
                        </span>
                        <span
                          className="product-workbench-item__attrs"
                          title={attrSummary || v.other || 'No attributes configured'}
                        >
                          {attrSummary || v.other || 'Standard'}
                        </span>
                      </div>

                      <div className="product-workbench-item__meta">
                        <span className="product-workbench-item__price">
                          {v.unit_price ? `$${Number(v.unit_price).toFixed(2)}` : '$0.00'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Inspector: Focused Variant Canvas */}
            {selectedVariant && (
              <div className="product-workbench-inspector">
                {/* Header */}
                <div className="product-workbench-inspector__header">
                  <div className="product-workbench-inspector__title-box">
                    <span className="product-workbench-inspector__badge">
                      Variant #{selectedVariantIndex + 1} of {variants.length}
                    </span>
                  </div>

                  <div className="product-workbench-inspector__actions">
                    <Button
                      size="sm"
                      variant="outline"
                      icon={<NavigateBeforeIcon sx={{ fontSize: 18 }} />}
                      disabled={selectedVariantIndex <= 0}
                      onClick={handlePrevVariant}
                      title="Previous Variant"
                      responsiveCollapse
                    >
                      Prev
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      endIcon={<NavigateNextIcon sx={{ fontSize: 18 }} />}
                      disabled={selectedVariantIndex >= variants.length - 1}
                      onClick={handleNextVariant}
                      title="Next Variant"
                      responsiveCollapse
                    >
                      Next
                    </Button>

                    {variants.length > 1 && (
                      <Tooltip title="Delete this variant">
                        <Button
                          size="sm"
                          variant="danger-outline"
                          icon={<DeleteIcon sx={{ fontSize: 17 }} />}
                          onClick={() => onRemoveVariant(selectedVariant.id)}
                        />
                      </Tooltip>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div className="product-workbench-inspector__body">
                  {/* Top Row: Variant Photo + SKU & Price */}
                  <div className="product-workbench-hero-grid">
                    <div className="workbench-photo-card">
                      <span className="workbench-photo-label">Variant Photo</span>
                      <ImageDropzone
                        imagePreview={selectedVariant.imagePreview}
                        onFileSelect={(file) => onVariantImageChange(selectedVariant.id, file)}
                        onRemove={() => onVariantImageRemove(selectedVariant.id)}
                        size="compact"
                        emptyIcon={<PhotoCameraIcon sx={{ fontSize: 26 }} />}
                        emptyTitle="Upload Photo"
                        emptySubtitle=""
                      />
                    </div>

                    <div className="workbench-fields-grid">
                      {/* SKU */}
                      <div className="product-form-field workbench-field--sku">
                        <span className="product-form-label">
                          <span>SKU Code</span>
                        </span>
                        <Input
                          type="text"
                          placeholder="Auto-generated"
                          value={selectedVariant.sku}
                          onChange={(e) =>
                            onVariantChange(selectedVariant.id, 'sku', e.target.value)
                          }
                        />
                      </div>

                      {/* Unit Price */}
                      <div className="product-form-field workbench-field--price">
                        <label className="product-form-label">
                          <span>Unit Price</span>
                          <span className="product-form-required">*</span>
                        </label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          leftIcon={<span style={{ fontWeight: 700, color: '#64748b', fontSize: '15px' }}>$</span>}
                          placeholder="0.00"
                          value={selectedVariant.unit_price}
                          onChange={(e) =>
                            onVariantChange(selectedVariant.id, 'unit_price', e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Middle Row: Product Attributes (Full Width, Zero Extra Gap) */}
                  {activeAttributes.length > 0 && (
                    <div className="product-form-field workbench-attr-section">
                      <div className="workbench-attr-list">
                        {activeAttributes.map((attr) => (
                          <div
                            key={attr.attribute_id}
                            className="product-form-field workbench-attr-item"
                          >
                            <span className="workbench-attr-label">{attr.attribute_name}</span>
                            <MultiSelect
                              placeholder={`Select ${attr.attribute_name}...`}
                              options={(attributeValuesMap[attr.attribute_id] || []).map(
                                (val) => ({
                                  value: val.value,
                                  label: val.value,
                                })
                              )}
                              selectedValues={
                                Array.isArray(selectedVariant.attributes[attr.attribute_id])
                                  ? selectedVariant.attributes[attr.attribute_id]
                                  : selectedVariant.attributes[attr.attribute_id]
                                    ? [selectedVariant.attributes[attr.attribute_id]]
                                    : []
                              }
                              onChange={(newValues) =>
                                onVariantAttrChange(
                                  selectedVariant.id,
                                  attr.attribute_id,
                                  newValues
                                )
                              }
                              maxTagsVisible={3}
                              width="100%"
                              popoverWidth="100%"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bottom Row: Specific Detail / Notes */}
                  <div className="product-form-field workbench-field--detail">
                    <label className="product-form-label">
                      <span>Specific Detail</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter variant specific details or notes..."
                      value={selectedVariant.other || ''}
                      onChange={(e) =>
                        onVariantChange(selectedVariant.id, 'other', e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="product-workbench-inspector__footer">
                  <span className="product-workbench-inspector__footer-hint">
                    Editing <strong>#{selectedVariantIndex + 1}</strong> of {variants.length}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductVariantsStudio;
