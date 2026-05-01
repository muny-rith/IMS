import React from 'react';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MobileCard from '../../../components/ui/MobileCard/MobileCard';

import './ProductMobileCardList.css'

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

const ProductMobileCardList = ({ rows = [], onView, onEdit, onDelete }) => {
    if (!rows.length) {
        return <div className="mobile-card-empty">No products match this search.</div>;
    }

    return (
        <div>
            {rows.map((row) => {
                const qty = Number(row.qty ?? 0);
                return (
                    <MobileCard
                        avatar={getInitial(row.name)}
                        title={row.name || 'Unnamed product'}
                        subtitle={row.code ? `SKU ${row.code}` : 'No code'}
                        rightContent={
                            row.price != null && row.price !== ''
                                ? currencyFormatter.format(Number(row.price))
                                : '—'
                        }
                        meta={[
                            {
                                label: 'Category',
                                value: row.category || '—',
                            },
                            {
                                label: 'Department',
                                value: row.department || 'N/A',
                            },
                            {
                                label: 'Qty',
                                value: `${qty} · ${getQtyLabel(qty)}`,
                                className:
                                    qty <= 0
                                        ? 'mobile-card__qty mobile-card__qty--empty'
                                        : qty <= 10
                                            ? 'mobile-card__qty mobile-card__qty--low'
                                            : 'mobile-card__qty',
                            },
                        ]}
                        actions={[
                            {
                                label: 'View',
                                icon: <VisibilityIcon fontSize="small" />,
                                onClick: () => onView(row),
                            },
                            {
                                label: 'Edit',
                                icon: <EditIcon fontSize="small" />,
                                onClick: () => onEdit(row),
                            },
                            {
                                label: 'Delete',
                                icon: <DeleteIcon fontSize="small" />,
                                onClick: () => onDelete(row.id),
                                className: 'mobile-card__action--danger',
                            },
                        ]}
                    />
                )
            })}
        </div>


    );
};

export default ProductMobileCardList;
