import React from 'react';
import { Controller } from 'react-hook-form';
import Input from '../../../components/ui/Input/Input';
import Select from '../../../components/ui/Select/Select';
import ImageDropzone from '../../../components/ui/ImageDropzone/ImageDropzone';

const ProductBasicInfoForm = ({
  register,
  control,
  errors,
  categories = [],
  brands = [],
  imagePreview,
  onImageSelect,
  onImageRemove,
  rules = {},
}) => {
  return (
    <div className="product-form-left-col">
      {/* Unified Card: Core Information & Media */}
      <div className="product-form-card">
        <h3 className="product-form-card__title">
          <span>General Information</span>
        </h3>

        {/* Product Image Dropzone */}
        <div className="product-form-group">
          <label className="product-form-label">
            <span>Product Image</span>
          </label>
          <ImageDropzone
            imagePreview={imagePreview}
            onFileSelect={onImageSelect}
            onRemove={onImageRemove}
            emptyTitle="Click to browse or drop photo"
            emptySubtitle="PNG, JPG, or WebP"
          />
        </div>

        {/* Product Name */}
        <div className="product-form-group">
          <label className="product-form-label">
            <span>Product Name</span>
            <span className="req">*</span>
          </label>
          <Input
            {...register('name', rules.name)}
            placeholder="e.g. Baby Rice Snack"
            error={errors.name?.message}
          />
        </div>

        {/* Category */}
        <div className="product-form-group">
          <label className="product-form-label">
            <span>Category</span>
            <span className="req">*</span>
          </label>
          <Controller
            name="categoryId"
            control={control}
            rules={rules.categoryId}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="Select category"
                options={categories}
                error={errors.categoryId?.message}
              />
            )}
          />
        </div>

        {/* Brand */}
        <div className="product-form-group">
          <label className="product-form-label">
            <span>Brand</span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>(Optional)</span>
          </label>
          <Controller
            name="brandId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="None"
                options={brands}
              />
            )}
          />
        </div>

        {/* Department */}
        <div className="product-form-group">
          <label className="product-form-label">
            <span>Department</span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>(Optional)</span>
          </label>
          <Input
            {...register('department')}
            placeholder="e.g. Snack, Baby, Beverage"
            error={errors.department?.message}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductBasicInfoForm;
