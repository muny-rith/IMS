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

      {/* ── 2. Split Workspace (Matching exact class .product-form-split) ── */}
      <div className="product-form-split">
        {/* ── LEFT COLUMN: Core Registry ── */}
        <div className="product-form-left-col">
          <div className="product-form-card">
            <h3 className="product-form-card__title">
              <Skeleton variant="text" width={150} height={20} />
            </h3>

            {/* Product Image Dropzone */}
            <div className="product-form-group">
              <label className="product-form-label">
                <Skeleton variant="text" width={100} height={14} />
              </label>
              <ImageDropzone.Skeleton />
            </div>

            {/* Name */}
            <div className="product-form-group">
              <Input.Skeleton label="Product Name" />
            </div>

            {/* Category */}
            <div className="product-form-group">
              <Select.Skeleton label="Category" />
            </div>

            {/* Brand */}
            <div className="product-form-group">
              <Select.Skeleton label="Brand" />
            </div>

            {/* Department */}
            <div className="product-form-group">
              <Input.Skeleton label="Department" />
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Interactive Matrix Studio ── */}
        <div className="product-form-right-col">
          <div className="product-form-card product-form-card--studio">
            {/* Header */}
            <div className="product-matrix-header">
              <div className="product-matrix-header__left">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Skeleton variant="text" width={140} height={20} />
                  <Skeleton
                    variant="rounded"
                    width={70}
                    height={20}
                    style={{ borderRadius: '999px' }}
                  />
                </div>
                <Skeleton variant="text" width={340} height={14} style={{ marginTop: '4px' }} />
              </div>
            </div>

            {/* Dynamic Custom Attributes Banner */}
            <div className="product-matrix-attrs-box">
              <span className="product-matrix-attrs-box__label">
                <Skeleton variant="text" width={140} height={14} />
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                {[90, 110, 85, 100].map((w, idx) => (
                  <Skeleton
                    key={idx}
                    variant="rounded"
                    width={w}
                    height={30}
                    style={{ borderRadius: '8px' }}
                  />
                ))}
              </div>
            </div>

            {/* Variants Studio: Master-Detail Split Workbench */}
            <div className="product-workbench-container" style={{ flex: 1, display: 'flex' }}>
              <div className="product-workbench-layout" style={{ width: '100%', flex: 1 }}>
                {/* Left Sidebar: Variant List */}
                <div className="product-workbench-sidebar">
                  <div className="product-workbench-sidebar__header">
                    <span className="product-workbench-sidebar__title">
                      <Skeleton variant="text" width={90} height={16} />
                    </span>
                    <Skeleton
                      variant="rounded"
                      width={52}
                      height={28}
                      style={{ borderRadius: '6px' }}
                    />
                  </div>

                  <div className="product-workbench-list">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`product-workbench-item ${i === 1 ? 'product-workbench-item--active' : ''}`}
                      >
                        <span className="product-workbench-item__num" style={{ color: '#94a3b8' }}>
                          #{i}
                        </span>

                        <div className="product-workbench-item__thumb">
                          <Skeleton
                            variant="rounded"
                            width={32}
                            height={32}
                            style={{ borderRadius: '6px' }}
                          />
                        </div>

                        <div className="product-workbench-item__info">
                          <Skeleton variant="text" width="75%" height={14} />
                          <Skeleton variant="text" width="55%" height={12} style={{ marginTop: 2 }} />
                        </div>

                        <div className="product-workbench-item__meta">
                          <Skeleton variant="text" width={42} height={14} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Inspector: Focused Variant Canvas */}
                <div className="product-workbench-inspector" style={{ padding: '16px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '18px',
                      paddingBottom: '12px',
                      borderBottom: '1px solid #f1f5f9',
                    }}
                  >
                    <Skeleton
                      variant="rounded"
                      width={130}
                      height={24}
                      style={{ borderRadius: '999px' }}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Skeleton
                        variant="rounded"
                        width={60}
                        height={30}
                        style={{ borderRadius: '6px' }}
                      />
                      <Skeleton
                        variant="rounded"
                        width={60}
                        height={30}
                        style={{ borderRadius: '6px' }}
                      />
                    </div>
                  </div>

                  {/* Inspector Fields Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                    <Input.Skeleton label="Variant SKU" />
                    <Input.Skeleton label="Unit Price ($)" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                    <Input.Skeleton label="Opening Stock" />
                    <Input.Skeleton label="Opening Note" />
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <Input.Skeleton label="Additional Notes" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFormSkeleton;
