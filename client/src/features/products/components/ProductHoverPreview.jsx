import React from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import './ProductHoverPreview.css';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const ProductHoverPreview = ({ product }) => {
  if (!product) return null;

  const qty = Number(product.qty ?? 0);
  const price =
    product.price != null && product.price !== ''
      ? currencyFormatter.format(Number(product.price))
      : '—';

  return (
    <div className="product-hover-card" onClick={(e) => e.stopPropagation()}>
      <div className="product-hover-card__media">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name || 'Product'}
            className="product-hover-card__img"
            loading="lazy"
          />
        ) : (
          <div className="product-hover-card__placeholder">
            <span>{product.name?.[0]?.toUpperCase() ?? '?'}</span>
          </div>
        )}
      </div>

      <div className="product-hover-card__body">
        <div className="product-hover-card__title" title={product.name}>
          {product.name || 'Unnamed Product'}
        </div>

        <div className="product-hover-card__tags">
          {product.category && product.category !== '—' && (
            <span className="product-hover-card__tag product-hover-card__tag--cat">
              {product.category}
            </span>
          )}
          {product.brand && product.brand !== '—' && (
            <span className="product-hover-card__tag product-hover-card__tag--brand">
              {product.brand}
            </span>
          )}
        </div>

        <div className="product-hover-card__metrics">
          <div className="product-hover-card__metric">
            <span className="product-hover-card__metric-label">Price</span>
            <span className="product-hover-card__metric-val">{price}</span>
          </div>
          <div className="product-hover-card__metric">
            <span className="product-hover-card__metric-label">In Stock</span>
            <span
              className={`product-hover-card__metric-val ${
                qty <= 0
                  ? 'product-hover-card__metric-val--empty'
                  : qty <= 10
                  ? 'product-hover-card__metric-val--low'
                  : 'product-hover-card__metric-val--ok'
              }`}
            >
              {qty} units
            </span>
          </div>
        </div>

        <div className="product-hover-card__footer">
          <VisibilityIcon sx={{ fontSize: 13 }} />
          <span>Click to view full details</span>
        </div>
      </div>
    </div>
  );
};

export default ProductHoverPreview;
