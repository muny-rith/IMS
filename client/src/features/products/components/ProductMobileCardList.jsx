import React from 'react';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MobileCard from '../../../components/ui/MobileCard/MobileCard';

import './ProductMobileCardList.css'

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
                        key={row.id}
                        avatar={
                            <div
                                onClick={() => onView?.(row)}
                                style={{ cursor: 'pointer', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                title="View details"
                            >
                                {row.image ? (
                                    <img src={row.image} alt={row.name} />
                                ) : (
                                    getInitial(row.name)
                                )}
                            </div>
                        }
                        title={
                            <span
                                onClick={() => onView?.(row)}
                                style={{ cursor: 'pointer' }}
                                title="View details"
                            >
                                {row.name || 'Unnamed product'}
                            </span>
                        }
                        subtitle={row.code ? `SKU ${row.code}` : 'No code'}
                        actionsPlacement="top-right"
                        meta={[
                            {
                                label: 'Category',
                                value: row.category || '—',
                            },
                            {
                                label: 'Brand',
                                value: row.brand || '—',
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
                            ...(onView
                                ? [{
                                    label: 'View',
                                    icon: <VisibilityIcon fontSize="small" />,
                                    onClick: () => onView(row),
                                    className: 'mobile-card__action--view',
                                }]
                                : []),
                            ...(onEdit
                                ? [{
                                    label: 'Edit',
                                    icon: <EditIcon fontSize="small" />,
                                    onClick: () => onEdit(row),
                                    className: 'mobile-card__action--edit',
                                }]
                                : []),
                            ...(onDelete
                                ? [{
                                    label: 'Delete',
                                    icon: <DeleteIcon fontSize="small" />,
                                    onClick: () => onDelete(row.id),
                                    className: 'mobile-card__action--danger',
                                }]
                                : []),
                        ]}
                    />
                );
            })}
        </div>
    );
};

export default ProductMobileCardList;
