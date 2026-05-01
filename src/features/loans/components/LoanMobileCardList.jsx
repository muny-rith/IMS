import React from 'react';

import VisibilityIcon from '@mui/icons-material/Visibility';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';

import MobileCard from '../../../components/ui/MobileCard/MobileCard';

const getInitial = (value) => value?.trim()?.[0]?.toUpperCase() || '?';

const getStatusClassName = (status) => {
  switch (status) {
    case 'RETURNED':
      return 'loan-mobile-status loan-mobile-status--returned';
    case 'PARTIAL':
      return 'loan-mobile-status loan-mobile-status--partial';
    case 'CANCELLED':
      return 'loan-mobile-status loan-mobile-status--cancelled';
    default:
      return 'loan-mobile-status loan-mobile-status--open';
  }
};

const LoanMobileCardList = ({
  rows = [],
  onView,
  onReturn,
}) => {
  if (!rows.length) {
    return <div className="mobile-empty">No loans match this search.</div>;
  }

  return (
    <div className="mobile-list">
      {rows.map((row) => {
        const remainingQty = Number(row.outstandingQty ?? 0);

        return (
          <MobileCard
            key={row.id}
            avatar={getInitial(row.workerName)}
            title={row.code || 'Loan record'}
            subtitle={row.workerName || 'Unknown worker'}
            rightContent={
              <span className={getStatusClassName(row.status)}>
                {row.status || 'OPEN'}
              </span>
            }
            meta={[
              {
                label: 'Loan date',
                value: row.loanDate || '—',
              },
              {
                label: 'Due date',
                value: row.dueDate || '—',
              },
              {
                label: 'Borrowed',
                value: Number(row.totalQty ?? 0),
              },
              {
                label: 'Returned',
                value: Number(row.returnedQty ?? 0),
              },
              {
                label: 'Remaining',
                value: remainingQty,
                className:
                  remainingQty > 0
                    ? 'loan-mobile-remaining loan-mobile-remaining--open'
                    : 'loan-mobile-remaining',
              },
            ]}
            actions={[
              {
                label: 'View',
                icon: <VisibilityIcon fontSize="small" />,
                onClick: () => onView(row),
              },
              ...(remainingQty > 0
                ? [
                    {
                      label: 'Return',
                      icon: <KeyboardReturnIcon fontSize="small" />,
                      onClick: () => onReturn(row),
                    },
                  ]
                : []),
            ]}
          />
        );
      })}
    </div>
  );
};

export default LoanMobileCardList;
