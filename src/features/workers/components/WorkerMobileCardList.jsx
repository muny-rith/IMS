import React from 'react';

import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import MobileCard from '../../../components/ui/MobileCard/MobileCard';


import './WorkerMobileCardList.css'
const getInitial = (value) => value?.trim()?.[0]?.toUpperCase() || '?';

const WorkerMobileCardList = ({
  rows = [],
  onView,
  onEdit,
  onDelete,
}) => {
  if (!rows.length) {
    return <div className="mobile-empty">No workers match this search.</div>;
  }

  return (
    <div className="mobile-list">
      {rows.map((row) => (
        <MobileCard
          key={row.id}
          avatar={getInitial(row.name)}
          title={row.name || 'Unnamed worker'}
          subtitle={row.code ? `ID ${row.code}` : 'No worker code'}
          rightContent={
            <span className='right-content'>{row.positionTitle || 'Position'}</span>
          }
          meta={[
            {
              label: 'Department',
              value: row.department || '—',
            },
            {
              label: 'Phone',
              value: row.phone || '—',
            },
            {
              label: 'Email',
              value: row.email || '—',
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

export default WorkerMobileCardList;
