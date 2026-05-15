const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
});

export const formatPurchaseRequestDate = (value) => {
  if (!value) return '-';

  return dateFormatter.format(new Date(value));
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
