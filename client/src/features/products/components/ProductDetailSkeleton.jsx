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
      {/* ── 1. Compact Header Bar (Matching ProductDetailPage) ── */}
      <div className="product-header">
        <div className="product-header__left">
          <Skeleton
            variant="rounded"
            width={34}
            height={34}
            style={{ borderRadius: '9px', flexShrink: 0 }}
          />

          <div className="product-detail-header__info">
            <div className="product-detail-breadcrumbs" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Skeleton variant="text" width={55} height={14} style={{ margin: 0 }} />
              <span style={{ color: '#cbd5e1' }}>/</span>
              <Skeleton variant="text" width={110} height={14} style={{ margin: 0 }} />
            </div>
            <div style={{ marginTop: 2 }}>
              <Skeleton
                variant="text"
                height={26}
                className="product-header-skeleton-title"
                style={{ margin: 0 }}
              />
            </div>
          </div>
        </div>

        <div className="product-header__actions">
          <Skeleton
            variant="rounded"
            className="product-header-skeleton-btn"
          />
          <Skeleton
            variant="rounded"
            className="product-header-skeleton-btn"
          />
        </div>
      </div>

      {/* ── 2. Underline Tabs Navigation (Zero Discrepancy with loaded state) ── */}
      <div className="product-detail-tabs">
        <div className="product-detail-tab-btn product-detail-tab-btn--active product-detail-tab-skeleton">
          <Skeleton variant="circular" width={16} height={16} />
          <Skeleton variant="text" width={120} height={14} style={{ margin: 0 }} />
          <Skeleton variant="rounded" width={22} height={16} style={{ borderRadius: '9999px', margin: 0 }} />
        </div>
        <div className="product-detail-tab-btn product-detail-tab-skeleton">
          <Skeleton variant="circular" width={16} height={16} />
          <Skeleton variant="text" width={100} height={14} style={{ margin: 0 }} />
        </div>
        <div className="product-detail-tab-btn product-detail-tab-skeleton">
          <Skeleton variant="circular" width={16} height={16} />
          <Skeleton variant="text" width={90} height={14} style={{ margin: 0 }} />
        </div>
      </div>

      {/* ── 3. Split Content (Sidebar + Workspace) ── */}
      <main className="product-detail-content">
        <div className="product-detail-split">
          {/* Left Sidebar */}
          <aside className="product-detail-sidebar">
            <div className="product-detail-card product-detail-hub-card">
              {/* Main Media Preview: 100% height matches 300px on PC, 240px on mobile */}
              <div className="product-detail-main-media" style={{ padding: 0 }}>
                <Skeleton
                  variant="rounded"
                  width="100%"
                  height="100%"
                  style={{ borderRadius: '12px' }}
                />
              </div>

              {/* Thumbnails strip */}
              <div className="product-detail-thumbs" style={{ marginTop: '10px' }}>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="product-detail-thumb"
                    style={{ border: '2px solid #f1f5f9' }}
                  >
                    <Skeleton
                      variant="rounded"
                      width="100%"
                      height="100%"
                      style={{ borderRadius: '4px' }}
                    />
                  </div>
                ))}
              </div>

              {/* Product Information Skeleton (Unified List) */}
              <div className="product-detail-registry-section">
                <div className="product-detail-meta-list">
                  {/* Hero Row Skeleton (Name & Price) */}
                  <div className="product-detail-hero-row">
                    <div className="product-detail-hero-info">
                      <Skeleton variant="text" width="65%" height={24} style={{ margin: 0 }} />
                    </div>
                    <div className="product-detail-hero-price-wrap">
                      <Skeleton variant="text" width={75} height={26} style={{ margin: 0 }} />
                    </div>
                  </div>

                  {/* Attributes Strip Skeleton */}
                  <div className="product-detail-variant-attrs-strip">
                    <Skeleton variant="rounded" width={80} height={24} style={{ borderRadius: '6px' }} />
                    <Skeleton variant="rounded" width={95} height={24} style={{ borderRadius: '6px' }} />
                    <Skeleton variant="rounded" width={60} height={24} style={{ borderRadius: '6px' }} />
                  </div>

                  {/* Master Catalog Details */}
                  <div className="product-detail-meta-item product-detail-meta-item--divider">
                    <span className="product-detail-meta-label">
                      <Skeleton variant="text" width={65} height={14} style={{ margin: 0 }} />
                    </span>
                    <Skeleton variant="rounded" width={85} height={22} style={{ borderRadius: '9999px', margin: 0 }} />
                  </div>

                  <div className="product-detail-meta-item">
                    <span className="product-detail-meta-label">
                      <Skeleton variant="text" width={50} height={14} style={{ margin: 0 }} />
                    </span>
                    <Skeleton variant="rounded" width={75} height={22} style={{ borderRadius: '9999px', margin: 0 }} />
                  </div>

                  <div className="product-detail-meta-item">
                    <span className="product-detail-meta-label">
                      <Skeleton variant="text" width={80} height={14} style={{ margin: 0 }} />
                    </span>
                    <Skeleton variant="text" width={60} height={16} style={{ margin: 0 }} />
                  </div>

                  <div className="product-detail-meta-item">
                    <span className="product-detail-meta-label">
                      <Skeleton variant="text" width={95} height={14} style={{ margin: 0 }} />
                    </span>
                    <Skeleton variant="text" width={70} height={16} style={{ margin: 0 }} />
                  </div>

                  <div className="product-detail-meta-item">
                    <span className="product-detail-meta-label">
                      <Skeleton variant="text" width={85} height={14} style={{ margin: 0 }} />
                    </span>
                    <Skeleton variant="text" width={55} height={16} style={{ margin: 0 }} />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Workspace */}
          <main className="product-detail-workspace">
            <div className="product-detail-card product-detail-table-card">
              <div className="product-detail-table-header">
                <div>
                  <Skeleton variant="text" width={160} height={20} style={{ margin: 0 }} />
                  <Skeleton variant="text" width={260} height={13} style={{ marginTop: '6px', marginBottom: 0 }} />
                </div>
                <div className="product-detail-table-search">
                  <Skeleton
                    variant="rounded"
                    height={38}
                    className="product-detail-table-search-skeleton"
                    style={{ borderRadius: '8px' }}
                  />
                </div>
              </div>

              {/* Variants Table */}
              <div className="product-detail-table-wrap">
                <table className="product-detail-table">
                  <thead>
                    <tr>
                      <th className="product-detail-th--item"><Skeleton variant="text" width={35} height={14} /></th>
                      <th className="product-detail-th--sku"><Skeleton variant="text" width={65} height={14} /></th>
                      <th className="product-detail-th--attr"><Skeleton variant="text" width={60} height={14} /></th>
                      <th className="product-detail-th--other"><Skeleton variant="text" width={40} height={14} /></th>
                      <th className="product-detail-th--price"><Skeleton variant="text" width={45} height={14} /></th>
                      <th className="product-detail-th--stock"><Skeleton variant="text" width={55} height={14} /></th>
                      <th className="product-detail-th--stock"><Skeleton variant="text" width={55} height={14} /></th>
                      <th className="product-detail-th--stock"><Skeleton variant="text" width={55} height={14} /></th>
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
                        <td className="product-detail-td--sku">
                          <Skeleton variant="text" width={80} height={16} />
                        </td>
                        <td className="product-detail-td--attr">
                          <Skeleton
                            variant="rounded"
                            width={75}
                            height={22}
                            style={{ borderRadius: '6px' }}
                          />
                        </td>
                        <td className="product-detail-td--other">
                          <Skeleton variant="text" width={45} height={14} />
                        </td>
                        <td className="product-detail-price-col">
                          <Skeleton variant="text" width={60} height={16} />
                        </td>
                        <td className="product-detail-td--stock">
                          <Skeleton
                            variant="rounded"
                            width={45}
                            height={22}
                            style={{ borderRadius: '999px' }}
                          />
                        </td>
                        <td className="product-detail-td--stock">
                          <Skeleton
                            variant="rounded"
                            width={40}
                            height={22}
                            style={{ borderRadius: '999px' }}
                          />
                        </td>
                        <td className="product-detail-td--stock">
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
      </main>
    </div>
  );
};

export default ProductDetailSkeleton;
