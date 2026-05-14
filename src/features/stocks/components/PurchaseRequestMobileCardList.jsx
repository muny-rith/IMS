import React from 'react';

import {
  formatPurchaseRequestDate,
  getPurchaseRequestItemLabel,
  getPurchaseRequestStatusClassName,
} from './purchaseRequestViewUtils';

const PurchaseRequestMobileCardList = ({ rows = [] }) => (
  <>
    {rows.map((row) => {
      const items = row.items ?? [];

      return (
        <article className="purchase-request-card" key={row.id}>
          <div className="purchase-request-card__top">
            <div>
              <strong>{row.requestNo}</strong>
              <span>{formatPurchaseRequestDate(row.requestedDate)}</span>
            </div>

            <span className={getPurchaseRequestStatusClassName(row.status)}>
              {row.status}
            </span>
          </div>

          <div className="purchase-request-card__meta">
            <span>Requested by</span>
            <strong>{row.requestedBy}</strong>
          </div>

          <div className="purchase-request-card__meta">
            <span>Items</span>
            <strong>{items.map(getPurchaseRequestItemLabel).join(', ')}</strong>
          </div>

          <p>{row.purpose || 'No purpose provided.'}</p>

          <div className="purchase-request-actions">
            <button type="button">View</button>
            <button type="button">Print</button>
          </div>
        </article>
      );
    })}
  </>
);

export default PurchaseRequestMobileCardList;
