import React from 'react';
import Skeleton from '../../../components/ui/Skeleton/Skeleton';
import ImageDropzone from '../../../components/ui/ImageDropzone/ImageDropzone';
import Input from '../../../components/ui/Input/Input';
import Select from '../../../components/ui/Select/Select';
import Button from '../../../components/ui/Button/Button';
import '../pages/ProductFormPage.css';

export const ProductFormSkeleton = ({ isEdit = false }) => {
  return (
    <div
      className="product-form-page product-form-page--skeleton"
      role="status"
      aria-label="Loading product form"
    >
      {/* ── 1. Top Header & Breadcrumbs ── */}
      <div className="product-form-header">
        <div className="product-form-header__left">
          <Skeleton
            variant="rounded"
            width={36}
            height={36}
            style={{ borderRadius: '9px', flexShrink: 0 }}
          />
          <div className="product-form-header__info" style={{ gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Skeleton variant="text" width={60} height={14} />
              <span style={{ color: '#cbd5e1' }}>/</span>
              <Skeleton variant="text" width={100} height={14} />
            </div>
            <Skeleton variant="text" width={220} height={28} />
          </div>
        </div>

        <div className="product-form-header__actions">
          <Button.Skeleton size="md" width={90} />
          <Button.Skeleton size="md" width={130} />
        </div>
      </div>

      {/* ── 2. Form Two-Column Layout ── */}
      <div className="product-form-layout">
        {/* Left Column: General Information & Photo */}
        <div className="product-form-left-col">
          <div className="product-form-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Skeleton variant="text" width={150} height={20} />

            {/* Product Image Dropzone */}
            <div className="product-form-group">
              <Skeleton variant="text" width={100} height={14} style={{ marginBottom: '8px' }} />
              <ImageDropzone.Skeleton />
            </div>

            {/* Name */}
            <Input.Skeleton label="Product Name" />

            {/* Category */}
            <Select.Skeleton label="Category" />

            {/* Brand */}
            <Select.Skeleton label="Brand" />

            {/* Department */}
            <Input.Skeleton label="Department" />
          </div>
        </div>

        {/* Right Column: Attributes & Variants Studio */}
        <div className="product-form-right-col">
          {/* Card 1: Product Attributes */}
          <div className="product-form-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <Skeleton variant="text" width={160} height={20} />
              <Skeleton variant="rounded" width={80} height={22} style={{ borderRadius: '999px' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[100, 80, 110, 95].map((w, i) => (
                <Skeleton key={i} variant="rounded" width={w} height={32} style={{ borderRadius: '8px' }} />
              ))}
            </div>
          </div>

          {/* Card 2: Variants Matrix Studio */}
          <div className="product-form-card product-form-card--studio" style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <Skeleton variant="text" width={140} height={20} />
                <Skeleton variant="text" width={220} height={14} style={{ marginTop: '4px' }} />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Skeleton variant="rounded" width={110} height={34} style={{ borderRadius: '8px' }} />
                <Skeleton variant="rounded" width={120} height={34} style={{ borderRadius: '8px' }} />
              </div>
            </div>

            {/* Variant Navigation Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'hidden' }}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="rounded" width={110} height={36} style={{ borderRadius: '8px' }} />
              ))}
            </div>

            {/* Active Variant Editor Box */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <Input.Skeleton label="Variant SKU" />
                <Input.Skeleton label="Price ($)" />
                <Input.Skeleton label="Opening Stock" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <Input.Skeleton label="Attribute Values" />
                <Input.Skeleton label="Variant Note" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFormSkeleton;
