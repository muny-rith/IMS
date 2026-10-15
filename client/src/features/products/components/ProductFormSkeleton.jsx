import React from 'react';
import Skeleton from '../../../components/ui/Skeleton/Skeleton';
import ImageDropzone from '../../../components/ui/ImageDropzone/ImageDropzone';
import Input from '../../../components/ui/Input/Input';
import Select from '../../../components/ui/Select/Select';
import '../pages/ProductFormPage.css';

export const ProductFormSkeleton = () => {
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

          <div className="product-form-header__info">
            <div className="product-form-breadcrumbs" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Skeleton variant="text" width={55} height={14} />
              <span style={{ color: '#cbd5e1' }}>/</span>
              <Skeleton variant="text" width={110} height={14} />
              <span style={{ color: '#cbd5e1' }}>/</span>
              <Skeleton variant="text" width={80} height={14} />
            </div>

            <div style={{ marginTop: 4 }}>
              <Skeleton variant="text" width={220} height={28} />
            </div>
          </div>
        </div>

        <div className="product-form-header__actions">
          <Skeleton variant="rounded" width={88} height={36} style={{ borderRadius: '9px' }} />
          <Skeleton variant="rounded" width={130} height={36} style={{ borderRadius: '9px' }} />
        </div>
      </div>

      {/* ── 2. Split Workspace ── */}
      <div className="product-form-split">
        {/* ── LEFT COLUMN: Core Registry ── */}
        <div className="product-form-left-col">
          <div className="product-form-card">
            <div style={{ marginBottom: 16 }}>
              <Skeleton variant="text" width={140} height={20} />
            </div>

            {/* Product Image Dropzone */}
            <div className="product-form-group">
              <Skeleton variant="text" width={90} height={14} style={{ marginBottom: 8 }} />
              <ImageDropzone.Skeleton />
            </div>

            {/* Product Name */}
            <div className="product-form-group">
              <Skeleton variant="text" width={100} height={14} style={{ marginBottom: 8 }} />
              <Input.Skeleton fullWidth />
            </div>

            {/* Category */}
            <div className="product-form-group">
              <Skeleton variant="text" width={70} height={14} style={{ marginBottom: 8 }} />
              <Select.Skeleton fullWidth />
            </div>

            {/* Brand */}
            <div className="product-form-group">
              <Skeleton variant="text" width={85} height={14} style={{ marginBottom: 8 }} />
              <Select.Skeleton fullWidth />
            </div>

            {/* Department */}
            <div className="product-form-group">
              <Skeleton variant="text" width={80} height={14} style={{ marginBottom: 8 }} />
              <Input.Skeleton fullWidth />
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
                  <Skeleton variant="text" width={130} height={20} />
                  <Skeleton
                    variant="rounded"
                    width={64}
                    height={20}
                    style={{ borderRadius: '999px' }}
                  />
                </div>
                <Skeleton variant="text" width={380} height={14} style={{ marginTop: 6 }} />
              </div>
            </div>

            {/* Dynamic Custom Attributes Banner */}
            <div className="product-matrix-attrs-box">
              <Skeleton variant="text" width={150} height={12} style={{ marginBottom: 6 }} />
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <Skeleton variant="rounded" width={75} height={30} style={{ borderRadius: '6px' }} />
                <Skeleton variant="rounded" width={85} height={30} style={{ borderRadius: '6px' }} />
              </div>
            </div>

            {/* Variants Studio: Master-Detail Split Workbench */}
            <div className="product-workbench-container">
              <div className="product-workbench-layout">
                {/* Left Sidebar: Variant List */}
                <div className="product-workbench-sidebar">
                  <div className="product-workbench-sidebar__header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Skeleton variant="text" width={80} height={15} />
                      <Skeleton variant="rounded" width={22} height={18} style={{ borderRadius: '999px' }} />
                    </div>
                    <Skeleton
                      variant="rounded"
                      width={52}
                      height={26}
                      style={{ borderRadius: '6px' }}
                    />
                  </div>

                  <div className="product-workbench-list">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`product-workbench-item ${i === 1 ? 'product-workbench-item--active' : ''}`}
                      >
                        <Skeleton variant="text" width={16} height={14} />

                        <div className="product-workbench-item__thumb">
                          <Skeleton
                            variant="rounded"
                            width={34}
                            height={34}
                            style={{ borderRadius: '6px' }}
                          />
                        </div>

                        <div className="product-workbench-item__info">
                          <Skeleton variant="text" width="65%" height={14} />
                          <Skeleton variant="text" width="45%" height={12} style={{ marginTop: 4 }} />
                        </div>

                        <div className="product-workbench-item__meta">
                          <Skeleton variant="text" width={38} height={14} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Inspector: Focused Variant Canvas */}
                <div className="product-workbench-inspector">
                  <div className="product-workbench-inspector__header">
                    <div className="product-workbench-inspector__title-box">
                      <Skeleton variant="rounded" width={110} height={24} style={{ borderRadius: '999px' }} />
                    </div>

                    <div className="product-workbench-inspector__actions">
                      <Skeleton variant="rounded" width={56} height={28} style={{ borderRadius: '6px' }} />
                      <Skeleton variant="rounded" width={56} height={28} style={{ borderRadius: '6px' }} />
                    </div>
                  </div>

                  {/* Inspector Body */}
                  <div className="product-workbench-inspector__body">
                    <div className="product-workbench-hero-grid">
                      <div className="workbench-photo-card">
                        <Skeleton variant="text" width={85} height={14} style={{ marginBottom: 6 }} />
                        <ImageDropzone.Skeleton size="compact" />
                      </div>

                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div className="product-form-group">
                          <Skeleton variant="text" width={65} height={14} style={{ marginBottom: 6 }} />
                          <Input.Skeleton fullWidth />
                        </div>

                        <div className="product-form-group">
                          <Skeleton variant="text" width={85} height={14} style={{ marginBottom: 6 }} />
                          <Input.Skeleton fullWidth />
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                      <div className="product-form-group">
                        <Skeleton variant="text" width={65} height={14} style={{ marginBottom: 6 }} />
                        <Select.Skeleton fullWidth />
                      </div>

                      <div className="product-form-group">
                        <Skeleton variant="text" width={65} height={14} style={{ marginBottom: 6 }} />
                        <Select.Skeleton fullWidth />
                      </div>
                    </div>

                    <div className="product-form-group">
                      <Skeleton variant="text" width={95} height={14} style={{ marginBottom: 6 }} />
                      <Input.Skeleton fullWidth />
                    </div>
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
