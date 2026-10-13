import React from 'react';
import { Skeleton } from '@mui/material';
import './ProductTableSkeleton.css';

export const ProductStatsSkeleton = () => (
  <div className="product-stats">
    {[1, 2, 3, 4].map((key) => (
      <div key={key} className="product-stat-card">
        <Skeleton variant="rounded" width={38} height={38} sx={{ borderRadius: '10px' }} animation="wave" />
        <div className="product-stat-card__info" style={{ width: '100%' }}>
          <Skeleton variant="text" width="45%" height={16} animation="wave" />
          <Skeleton variant="text" width="65%" height={24} animation="wave" />
        </div>
      </div>
    ))}
  </div>
);

export const ProductTableSkeleton = ({ rowsCount = 7 }) => {
  return (
    <div className="product-skeleton-table" aria-label="Loading products table">
      {/* Skeleton Header */}
      <div className="product-skeleton-header">
        <div className="product-skeleton-cell product-skeleton-cell--checkbox">
          <Skeleton variant="rounded" width={18} height={18} sx={{ borderRadius: '4px' }} />
        </div>
        <div className="product-skeleton-cell product-skeleton-cell--avatar">Photo</div>
        <div className="product-skeleton-cell product-skeleton-cell--name">Name</div>
        <div className="product-skeleton-cell product-skeleton-cell--cat">Category</div>
        <div className="product-skeleton-cell product-skeleton-cell--brand">Brand</div>
        <div className="product-skeleton-cell product-skeleton-cell--dept">Department</div>
        <div className="product-skeleton-cell product-skeleton-cell--price">Price</div>
        <div className="product-skeleton-cell product-skeleton-cell--qty">Qty</div>
        <div className="product-skeleton-cell product-skeleton-cell--actions">Actions</div>
      </div>

      {/* Skeleton Rows */}
      <div className="product-skeleton-body">
        {Array.from({ length: rowsCount }).map((_, idx) => (
          <div key={idx} className="product-skeleton-row">
            <div className="product-skeleton-cell product-skeleton-cell--checkbox">
              <Skeleton variant="rounded" width={18} height={18} sx={{ borderRadius: '4px' }} animation="wave" />
            </div>
            <div className="product-skeleton-cell product-skeleton-cell--avatar">
              <Skeleton variant="circular" width={32} height={32} animation="wave" />
            </div>
            <div className="product-skeleton-cell product-skeleton-cell--name">
              <Skeleton variant="text" width={`${55 + (idx % 3) * 15}%`} height={22} animation="wave" />
            </div>
            <div className="product-skeleton-cell product-skeleton-cell--cat">
              <Skeleton variant="rounded" width={75} height={22} sx={{ borderRadius: '6px' }} animation="wave" />
            </div>
            <div className="product-skeleton-cell product-skeleton-cell--brand">
              <Skeleton variant="text" width={65} height={20} animation="wave" />
            </div>
            <div className="product-skeleton-cell product-skeleton-cell--dept">
              <Skeleton variant="text" width={70} height={20} animation="wave" />
            </div>
            <div className="product-skeleton-cell product-skeleton-cell--price">
              <Skeleton variant="text" width={55} height={20} animation="wave" />
            </div>
            <div className="product-skeleton-cell product-skeleton-cell--qty">
              <Skeleton variant="rounded" width={38} height={22} sx={{ borderRadius: '999px' }} animation="wave" />
            </div>
            <div className="product-skeleton-cell product-skeleton-cell--actions">
              <Skeleton variant="circular" width={26} height={26} animation="wave" />
              <Skeleton variant="circular" width={26} height={26} animation="wave" />
              <Skeleton variant="circular" width={26} height={26} animation="wave" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductTableSkeleton;
