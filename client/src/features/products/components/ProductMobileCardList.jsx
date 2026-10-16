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

const ProductMobileCardList = ({ rows = [], loading = false, onView, onEdit, onDelete }) => {
    if (loading) {
        return (
            <div className="product-mobile-cards-skeleton">
                <MobileCard.Skeleton count={6} hasAvatar={true} metaCount={3} />
            </div>
        );
    }

    if (!rows.length) {
        return <div className="mobile-card-empty">No products match this search.</div>;
    }


    return (
        <div>
            {rows.map((row) => {
                const qty = Number(row.qty ?? 0);
                const hasVariants = Number(row.variantCount ?? 1) > 1;
                const skuCode = row.code || row.sku || '';

                return (
                    <MobileCard
                        key={row.id}
                        onClick={() => onView?.(row)}
                        avatar={
                            <div
                                style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                {row.image ? (
                                    <img src={row.image} alt={row.name} />
                                ) : (
                                    getInitial(row.name)
                                )}
                            </div>
                        }
                        title={row.name || 'Unnamed product'}
                        subtitle={
                            hasVariants ? (
                                <div className="product-mobile-card__subtitle-row">
                                    <span className="product-mobile-card__badge product-mobile-card__badge--variants">
                                        {row.variantCount} {row.variantCount === 1 ? 'Variant' : 'Variants'}
                                    </span>
                                </div>
                            ) : skuCode ? (
                                <div className="product-mobile-card__subtitle-row">
                                    <span className="product-mobile-card__badge product-mobile-card__badge--sku">
                                        #{skuCode}
                                    </span>
                                </div>
                            ) : null
                        }
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
