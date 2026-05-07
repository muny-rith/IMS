export const PURCHASE_REQUEST_STATUSES = [
  'ALL',
  'PENDING',
  'APPROVED',
  'REJECTED',
  'RECEIVED',
];

export const purchaseRequestMockRows = [
  {
    id: 1,
    requestNo: 'PR-20260507-001',
    requestedDate: '2026-05-07',
    requestedBy: 'Admin Team',
    purpose: 'Replenish materials that are close to low-stock threshold.',
    status: 'PENDING',
    items: [
      {
        productName: 'Packing Tape',
        qty: 12,
        reason: 'Used daily by warehouse team',
      },
      {
        productName: 'Barcode Label',
        qty: 20,
        reason: 'Needed for new product tagging',
      },
    ],
  },
  {
    id: 2,
    requestNo: 'PR-20260506-002',
    requestedDate: '2026-05-06',
    requestedBy: 'Warehouse',
    purpose: 'Replace damaged office and packing materials.',
    status: 'APPROVED',
    items: [
      {
        productName: 'Office Chair',
        qty: 2,
        reason: 'Damaged stock replacement',
      },
    ],
  },
];
