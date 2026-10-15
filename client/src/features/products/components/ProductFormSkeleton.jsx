import React from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';

import Skeleton from '../../../components/ui/Skeleton/Skeleton';
import ImageDropzone from '../../../components/ui/ImageDropzone/ImageDropzone';
import Input from '../../../components/ui/Input/Input';
import Select from '../../../components/ui/Select/Select';
import Button from '../../../components/ui/Button/Button';
import '../pages/ProductFormPage.css';

export const ProductFormSkeleton = ({ isEdit = false }) => {
  const navigate = useNavigate();

  return (
    <div
      className="product-form-page product-form-page--skeleton"
      role="status"
      aria-label="Loading product form"
    >
      {/* ── 1. Top Header & Breadcrumbs ── */}
      <div className="product-form-header">
        <div className="product-form-header__left">
          <button
            type="button"
            className="product-form-back-btn"
            onClick={() => navigate('/products')}
            title="Back to products"
          >
            <ArrowBackIcon fontSize="small" />
          </button>

          <div className="product-form-header__info">
            <div className="product-form-breadcrumbs">
              <span className="clickable" onClick={() => navigate('/products')}>
                Products
              </span>
              <span>/</span>
              <Skeleton variant="text" width={110} height={14} style={{ display: 'inline-block' }} />
              <span>/</span>
              <span className="product-form-breadcrumbs__current">
                {isEdit ? 'Edit Product' : 'Add Product'}
              </span>
            </div>

            <h1 className="product-form-header__title" style={{ marginTop: 2 }}>
              <Skeleton variant="text" width={240} height={28} />
            </h1>
          </div>
        </div>

        <div className="product-form-header__actions">
          <Button
            type="button"
            variant="outline"
            icon={<CloseIcon sx={{ fontSize: 16 }} />}
            onClick={() => navigate('/products')}
            disabled
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="primary"
            icon={<SaveIcon sx={{ fontSize: 17 }} />}
            loading
            disabled
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* ── 2. Split Workspace ── */}
      <div className="product-form-split">
        {/* ── LEFT COLUMN: Core Registry ── */}
        <div className="product-form-left-col">
          <div className="product-form-card">
            <h3 className="product-form-card__title">
              <span>General Information</span>
            </h3>

            {/* Product Image Dropzone */}
            <div className="product-form-group">
              <label className="product-form-label">
                <span>Product Image</span>
              </label>
              <ImageDropzone.Skeleton />
            </div>

            {/* Product Name */}
            <div className="product-form-group">
              <label className="product-form-label">
                <span>Product Name</span>
                <span className="req">*</span>
              </label>
              <Input.Skeleton fullWidth />
            </div>

            {/* Category */}
            <div className="product-form-group">
              <label className="product-form-label">
                <span>Category</span>
                <span className="req">*</span>
              </label>
              <Select.Skeleton fullWidth />
            </div>

            {/* Brand */}
            <div className="product-form-group">
              <label className="product-form-label">
                <span>Brand</span>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>(Optional)</span>
              </label>
              <Select.Skeleton fullWidth />
            </div>

            {/* Department */}
            <div className="product-form-group">
              <label className="product-form-label">
                <span>Department</span>
                <span className="req">*</span>
              </label>
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
                <h3 className="product-matrix-title">
                  <span>Variants Studio</span>
                  <Skeleton
                    variant="rounded"
                    width={68}
                    height={20}
                    style={{ borderRadius: '999px' }}
                  />
                </h3>
                <p className="product-matrix-subtitle">
                  Manage SKU codes, pricing, inventory stock, photography, and attributes in a focused workbench.
                </p>
              </div>
            </div>

            {/* Dynamic Custom Attributes Banner */}
            <div className="product-matrix-attrs-box">
              <span className="product-matrix-attrs-box__label">
                ADD CUSTOM ATTRIBUTES
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                <Skeleton variant="rounded" width={80} height={32} style={{ borderRadius: '6px' }} />
                <Skeleton variant="rounded" width={90} height={32} style={{ borderRadius: '6px' }} />
              </div>
            </div>

            {/* Variants Studio: Master-Detail Split Workbench */}
            <div className="product-workbench-container">
              <div className="product-workbench-layout">
                {/* Left Sidebar: Variant List */}
                <div className="product-workbench-sidebar">
                  <div className="product-workbench-sidebar__header">
                    <span className="product-workbench-sidebar__title">
                      <span>Variants List</span>
                      <Skeleton variant="rounded" width={22} height={18} style={{ borderRadius: '999px' }} />
                    </span>
                    <Skeleton
                      variant="rounded"
                      width={58}
                      height={28}
                      style={{ borderRadius: '6px' }}
                    />
                  </div>

                  <div className="product-workbench-list">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`product-workbench-item ${i === 1 ? 'product-workbench-item--active' : ''}`}
                      >
                        <span className="product-workbench-item__num">#{i}</span>

                        <div className="product-workbench-item__thumb">
                          <Skeleton
                            variant="rounded"
                            width={34}
                            height={34}
                            style={{ borderRadius: '6px' }}
                          />
                        </div>

                        <div className="product-workbench-item__info">
                          <Skeleton variant="text" width={70} height={14} />
                          <Skeleton variant="text" width={90} height={12} style={{ marginTop: 2 }} />
                        </div>

                        <div className="product-workbench-item__meta">
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>
                            $0.00
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Inspector: Focused Variant Canvas */}
                <div className="product-workbench-inspector">
                  <div className="product-workbench-inspector__header">
                    <div className="product-workbench-inspector__title-box">
                      <span className="product-workbench-inspector__badge">
                        Variant #1 of 5
                      </span>
                    </div>

                    <div className="product-workbench-inspector__actions">
                      <Button
                        size="sm"
                        variant="outline"
                        icon={<NavigateBeforeIcon sx={{ fontSize: 18 }} />}
                        disabled
                      >
                        Prev
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        endIcon={<NavigateNextIcon sx={{ fontSize: 18 }} />}
                        disabled
                      >
                        Next
                      </Button>
                    </div>
                  </div>

                  {/* Inspector Body */}
                  <div className="product-workbench-inspector__body">
                    <div className="product-workbench-hero-grid">
                      <div className="workbench-photo-card">
                        <label className="product-form-label" style={{ marginBottom: 6 }}>
                          <span>Variant Photo</span>
                        </label>
                        <ImageDropzone.Skeleton size="compact" />
                      </div>

                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div className="product-form-group">
                          <label className="product-form-label">
                            <span>SKU Code</span>
                          </label>
                          <Input.Skeleton fullWidth />
                        </div>

                        <div className="product-form-group">
                          <label className="product-form-label">
                            <span>Unit Price ($)</span>
                          </label>
                          <Input.Skeleton fullWidth />
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                      <div className="product-form-group">
                        <label className="product-form-label">
                          <span>Attribute 1</span>
                        </label>
                        <Select.Skeleton fullWidth />
                      </div>

                      <div className="product-form-group">
                        <label className="product-form-label">
                          <span>Attribute 2</span>
                        </label>
                        <Select.Skeleton fullWidth />
                      </div>
                    </div>

                    <div className="product-form-group">
                      <label className="product-form-label">
                        <span>Specific Detail</span>
                      </label>
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
