import React from 'react';

import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import MobileCard from '../../../components/ui/MobileCard/MobileCard';

const getInitial = (value) => value?.trim()?.[0]?.toUpperCase() || '?';

const formatDate = (value) => {
    if (!value) return '—';

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    }).format(new Date(value));
};

const CategoryMobileCardList = ({
    rows = [],
    onView,
    onEdit,
    onDelete,
}) => {
    if (!rows.length) {
        return <div className="mobile-empty">No categories match this search.</div>;
    }

    return (
        <div className="mobile-list">
            {rows.map((row) => (
                <MobileCard
                    key={row.id}
                    avatar={getInitial(row.name)}
                    title={row.name || 'Unnamed category'}
                    subtitle={row.code ? `Code ${row.code}` : 'No code'}
                    rightContent={row.productCount != null ? `${row.productCount} items` : 'Category'}
                    meta={[
                        {
                            label: 'Description',
                            value: row.description || 'No description',
                        },
                        {
                            label: 'Updated',
                            value: formatDate(row.updatedAt),
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
            ))}
        </div>
    );
};

export default CategoryMobileCardList;
