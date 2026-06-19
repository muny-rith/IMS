import React from 'react';

import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';

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

const getAvailableClassName = (qty) => {
  if (qty <= 0) return 'stock-mobile-available stock-mobile-available--empty';
  if (qty <= 10) return 'stock-mobile-available stock-mobile-available--low';
  return 'stock-mobile-available';
};

const StockMobileCardList = ({
  rows = [],
  onAdjust,
  onViewHistory,
}) => {
  if (!rows.length) {
    return <div className="mobile-empty">No stock items found.</div>;
  }

  return (
    <div className="mobile-list">
      {rows.map((row) => {
        const availableQty = Number(row.availableQty ?? 0);

        return (
          <MobileCard
            key={row.id}
            avatar={getInitial(row.productName)}
            title={row.productName || 'Unnamed product'}
            subtitle={row.productCode ? `SKU ${row.productCode}` : 'No code'}
            rightContent={
              <span className={getAvailableClassName(availableQty)}>
                {availableQty} available
              </span>
            }
            meta={[
              {
                label: 'Category',
                value: row.category || '—',
              },
              {
                label: 'On hand',
                value: Number(row.onHandQty ?? 0),
              },
              {
                label: 'Reserved',
                value: Number(row.reservedQty ?? 0),
              },
              {
                label: 'Updated',
                value: formatDate(row.updatedAt),
              },
            ]}
            actions={[
              {
                label: 'Adjust',
                icon: <TuneOutlinedIcon fontSize="small" />,
                onClick: () => onAdjust(row),
              },
              {
                label: 'History',
                icon: <HistoryOutlinedIcon fontSize="small" />,
                onClick: () => onViewHistory(row),
              },
            ]}
          />
        );
      })}
    </div>
  );
};

export default StockMobileCardList;
