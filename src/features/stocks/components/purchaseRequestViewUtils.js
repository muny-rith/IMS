const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
});

export const formatPurchaseRequestDate = (value) => {
  if (!value) return '-';

  return dateFormatter.format(new Date(value));
};

export const getPurchaseRequestItemLabel = (item) => {
  const productLabel = [item.productCode, item.productName]
    .filter(Boolean)
    .join(' - ');

  return `${productLabel || 'Unknown product'} x${item.requestedQty}`;
};

export const getPurchaseRequestStatusClassName = (status) =>
  `purchase-request-status purchase-request-status--${String(status).toLowerCase()}`;
