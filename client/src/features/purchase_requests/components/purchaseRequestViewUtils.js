

export const formatPurchaseRequestDate = (value) => {
  if (!value) return '-';

  const khmerMonths = [
    'មករា',
    'កុម្ភៈ',
    'មីនា',
    'មេសា',
    'ឧសភា',
    'មិថុនា',
    'កក្កដា',
    'សីហា',
    'កញ្ញា',
    'តុលា',
    'វិច្ឆិកា',
    'ធ្នូ',
  ];

  const date = new Date(value);

  const day = date.getDate().toString().padStart(2, '0');
  const month = khmerMonths[date.getMonth()];
  const year = date.getFullYear();

  return `${day}_${month}_${year}`;
};

export const getPurchaseRequestItemName = (item) => {
  const productLabel = [item.productCode, item.productName]
    .filter(Boolean)
    .join(' - ');

  return productLabel || item.customItemName || 'Unknown item';
};

export const getPurchaseRequestItemLabel = (item) => {
  return `${getPurchaseRequestItemName(item)} x${item.requestedQty ?? item.qty ?? 0}`;
};

export const getPurchaseRequestStatusClassName = (status) =>
  `purchase-request-status purchase-request-status--${String(status).toLowerCase()}`;
