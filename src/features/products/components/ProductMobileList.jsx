import React from 'react';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';

import './ProductMobileList.css'

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

const getInitial = (name) => name?.[0]?.toUpperCase() ?? '?';

const getQtyLabel = (qty) => {
    const value = Number(qty ?? 0);

    if (value <= 0) return 'Out';
    if (value <= 10) return 'Low';
    return 'In stock';
};

const ProductMobileList = ({ rows = [], onView, onEdit, onDelete }) => {
    if (!rows.length) {
        return <div className="product-mobile-empty">No products match this search.</div>;
    }

    return (
        <div className="product-mobile-list">
            {rows.map((row) => {
                const qty = Number(row.qty ?? 0);

                return (
                    <article className="product-mobile-card" key={row.id}>
                        <div className="product-mobile-card__top">
                            <div className="product-mobile-card__avatar">
                                {getInitial(row.name)}
                            </div>

                            <div className="product-mobile-card__main">
                                <strong>{row.name || 'Unnamed product'}</strong>
                                <span>{row.code ? `SKU ${row.code}` : 'No code'}</span>
                            </div>

                            <div className="product-mobile-card__price">
                                {row.price != null && row.price !== ''
                                    ? currencyFormatter.format(Number(row.price))
                                    : '—'}
                            </div>
                        </div>

                        <div className="product-mobile-card__meta">
                            <div className="product-mobile-card__meta-item">
                                <span>Category</span>
                                <strong>{row.category || '—'}</strong>
                            </div>




                            <div className="product-mobile-card__meta-item">
                                <span>Department</span>
                                <strong>{row.department || 'N/A'}</strong>
                            </div>



                            <div className="product-mobile-card__meta-item">
                                <span>Qty</span>
                                <strong
                                    className={
                                        qty <= 0
                                            ? 'product-mobile-card__qty--empty'
                                            : qty <= 10
                                                ? 'product-mobile-card__qty--low'
                                                : 'product-mobile-card__qty'
                                    }
                                >
                                    {qty} · {getQtyLabel(qty)}
                                </strong>
                            </div>


                        </div>

                        <div className="product-mobile-card__actions">
                            <button type="button" onClick={() => onView(row)}>
                                <VisibilityIcon fontSize="small" />
                                View
                            </button>

                            <button type="button" onClick={() => onEdit(row)}>
                                <EditIcon fontSize="small" />
                                Edit
                            </button>

                            <button type="button" onClick={() => onDelete(row.id)}>
                                <DeleteIcon fontSize="small" />
                                Delete
                            </button>
                        </div>
                    </article>
                );
            })}
        </div>
    );
};

export default ProductMobileList;
