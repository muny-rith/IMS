import React from 'react';
import Skeleton from '../../../components/ui/Skeleton/Skeleton';
import '../pages/ProductDetailPage.css';

export const ProductDetailSkeleton = () => {
  return (
    <div
      className="product-detail-page product-detail-page--skeleton"
      role="status"
      aria-label="Loading product details"
    >
      {/* ── 1. Compact Header Bar ── */}
      <div className="product-header">
        <div className="product-header__left">
          <Skeleton
            variant="rounded"
            width={34}
            height={34}
            style={{ borderRadius: '9px', flexShrink: 0 }}
          />

          <div className="product-detail-header__info" style={{ gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Skeleton variant="text" width={60} height={14} />
              <span style={{ color: '#cbd5e1' }}>/</span>
              <Skeleton variant="text" width={120} height={14} />
            </div>
            <Skeleton variant="text" width={240} height={26} />
          </div>
        </div>

        <div className="product-header__actions">
          <Skeleton
            variant="rounded"
            width={100}
            height={36}
            style={{ borderRadius: '8px' }}
          />
          <Skeleton
            variant="rounded"
            width={110}
            height={36}
            style={{ borderRadius: '8px' }}
          />
        </div>
      </div>

      {/* ── 2. Tabs Navigation ── */}
      <div className="product-detail-tabs" style={{ display: 'flex', gap: '8px', padding: '4px' }}>
        <Skeleton variant="rounded" width={180} height={36} style={{ borderRadius: '8px' }} />
        <Skeleton variant="rounded" width={200} height={36} style={{ borderRadius: '8px' }} />
        <Skeleton variant="rounded" width={190} height={36} style={{ borderRadius: '8px' }} />
      </div>

      {/* ── 3. Split Content (Sidebar + Workspace) ── */}
      <div className="product-detail-split">
        {/* Left Sidebar */}
        <aside className="product-detail-sidebar">
          <div className="product-detail-card product-detail-hub-card">
            {/* Main Media Preview */}
            <div className="product-detail-main-media" style={{ padding: 0, minHeight: 220 }}>
              <Skeleton
                variant="rounded"
                width="100%"
                height={240}
                style={{ borderRadius: '12px' }}
              />
            </div>

            {/* Thumbnails strip */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  variant="rounded"
                  width={52}
                  height={52}
                  style={{ borderRadius: '8px' }}
                />
              ))}
            </div>

            {/* Catalog Details */}
            <div className="product-detail-registry-section" style={{ marginTop: '18px' }}>
              <Skeleton variant="text" width={120} height={18} style={{ marginBottom: '14px' }} />
              <div className="product-detail-meta-list">
                {[
                  { labelWidth: 60, valWidth: 80 },
                  { labelWidth: 50, valWidth: 90 },
                  { labelWidth: 80, valWidth: 100 },
                  { labelWidth: 90, valWidth: 70 },
                  { labelWidth: 75, valWidth: 65 },
                ].map((item, idx) => (
                  <div className="product-detail-meta-item" key={idx}>
                    <Skeleton variant="text" width={item.labelWidth} height={14} />
                    <Skeleton
                      variant="rounded"
                      width={item.valWidth}
                      height={22}
                      style={{ borderRadius: '6px' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Right Workspace */}
        <main className="product-detail-workspace">
          <div className="product-detail-card product-detail-table-card">
            <div className="product-detail-table-header">
              <div>
                <Skeleton variant="text" width={160} height={20} />
                <Skeleton variant="text" width={280} height={14} style={{ marginTop: '4px' }} />
              </div>
              <div className="product-detail-table-search">
                <Skeleton
                  variant="rounded"
                  width={220}
                  height={38}
                  style={{ borderRadius: '8px' }}
                />
              </div>
            </div>

            {/* Variants Table */}
            <div className="product-detail-table-wrap">
              <table className="product-detail-table">
                <thead>
                  <tr>
                    <th className="product-detail-th--item">Item</th>
                    <th className="product-detail-th--sku">SKU Code</th>
                    <th className="product-detail-th--attr">Attribute</th>
                    <th className="product-detail-th--other">Other</th>
                    <th className="product-detail-th--price">Price</th>
                    <th className="product-detail-th--stock">On-Hand</th>
                    <th className="product-detail-th--stock">Reserved</th>
                    <th className="product-detail-th--stock">Available</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((idx) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Skeleton variant="circular" width={32} height={32} />
                          <Skeleton variant="text" width={60} height={14} />
                        </div>
                      </td>
                      <td>
                        <Skeleton variant="text" width={80} height={16} />
                      </td>
                      <td>
                        <Skeleton
                          variant="rounded"
                          width={75}
                          height={22}
                          style={{ borderRadius: '6px' }}
                        />
                      </td>
                      <td>
                        <Skeleton variant="text" width={45} height={14} />
                      </td>
                      <td>
                        <Skeleton variant="text" width={60} height={16} />
                      </td>
                      <td>
                        <Skeleton
                          variant="rounded"
                          width={45}
                          height={22}
                          style={{ borderRadius: '999px' }}
                        />
                      </td>
                      <td>
                        <Skeleton
                          variant="rounded"
                          width={40}
                          height={22}
                          style={{ borderRadius: '999px' }}
                        />
                      </td>
                      <td>
                        <Skeleton
                          variant="rounded"
                          width={45}
                          height={22}
                          style={{ borderRadius: '999px' }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProductDetailSkeleton;
