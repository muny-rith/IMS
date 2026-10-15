import React, { useMemo } from 'react';
import MultiSelect from '../../../components/ui/MultiSelect/MultiSelect';

const ProductAttributesSelector = ({
  allAttributes = [],
  categoryAttributes = [],
  productAttributes = [],
  onChange,
}) => {
  // Filter out attributes that are already assigned to this category
  const availableOptions = useMemo(() => {
    return allAttributes
      .filter((a) => !categoryAttributes.find((ca) => ca.attribute_id === a.attribute_id))
      .map((a) => ({
        value: a.attribute_id,
        label: a.attribute_name,
      }));
  }, [allAttributes, categoryAttributes]);

  // Current selected attribute IDs
  const selectedValues = useMemo(() => {
    return (productAttributes || []).map((a) => a.attribute_id);
  }, [productAttributes]);

  const handleChange = (newIds) => {
    const nextAttrs = newIds
      .map((id) => allAttributes.find((a) => String(a.attribute_id) === String(id)))
      .filter(Boolean);
    onChange(nextAttrs);
  };

  return (
    <div className="product-matrix-attrs-box">
      <div className="product-matrix-attrs-box__label">
        <span>Add Custom Attributes</span>
      </div>
      <MultiSelect
        placeholder="Select custom attributes (e.g. Size, Flavor)..."
        options={availableOptions}
        selectedValues={selectedValues}
        onChange={handleChange}
        maxTagsVisible={4}
        width="100%"
        popoverWidth="100%"
      />
    </div>
  );
};

export default ProductAttributesSelector;
