import React from 'react';

import {
  formatPurchaseRequestDate,
  getPurchaseRequestItemName,
} from './purchaseRequestViewUtils';
import './PurchaseRequestPrintModal.css';

const MIN_PRINT_ROWS = 8;

const createPrintRows = (items) => {
  const rows = items.map((item, index) => ({
    key: item.id ?? `${item.productId ?? item.customItemName}-${index}`,
    no: index + 1,
    description: getPurchaseRequestItemName(item),
    qty: item.requestedQty ?? item.qty ?? '',
    reason: item.reason ?? '',
  }));

  while (rows.length < MIN_PRINT_ROWS) {
    rows.push({
      key: `empty-${rows.length}`,
      no: rows.length + 1,
      description: '',
      qty: '',
      reason: '',
    });
  }

  return rows;
};

const PurchaseRequestPrintModal = ({ open, request, onClose }) => {
  if (!open || !request) return null;

  const rows = createPrintRows(request.items ?? []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="purchase-print-modal" role="dialog" aria-modal="true">
      <div className="purchase-print-modal__backdrop" onClick={onClose} />

      <section className="purchase-print-modal__shell">
        <header className="purchase-print-modal__title">
          <h3>Print purchase request form</h3>
          <button type="button" onClick={onClose} aria-label="Close print preview">
            x
          </button>
        </header>

        <div className="purchase-print-modal__content">
          <main className="purchase-print-paper">
            <header className="purchase-print-company">
              <h1>ស៊ុនវ៉េហ្វូ(ខេមបូឌា)ឌីវេលប៉មិនធី 新彩福（柬埔寨）有限公司</h1>
            </header>

            <section className="purchase-print-document-title">
              <h2>បណ្ណស្នើសុំទិញ 采购申请单</h2>
              <span>{request.requestNo}</span>
            </section>

            <section className="purchase-print-meta-row">
              <div>
                <span>ផ្នែក申请部门：</span>
                <strong>{request.requestedBy || ''}</strong>
              </div>
              <div>
                <span>ថ្ងៃខែ日期：</span>
                <strong>{formatPurchaseRequestDate(request.requestedDate)}</strong>
              </div>
            </section>

            <table className="purchase-print-table">
              <thead>
                <tr>
                  <th>编号</th>
                  <th>ឈ្មោះសម្ភារៈ 摘要</th>
                  <th>ចំនួន 数量</th>
                  <th>预计单价</th>
                  <th>实际单价</th>
                  <th>总单价</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.key}>
                    <td>{row.no}</td>
                    <td>
                      <strong>{row.description}</strong>
                      {row.reason && <span>{row.reason}</span>}
                    </td>
                    <td>{row.qty}</td>
                    <td />
                    <td />
                    <td />
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="5">សរុប TOTAL</td>
                  <td />
                </tr>
              </tfoot>
            </table>

            <section className="purchase-print-purpose-lines">
              <div>
                <strong>ប្រើប្រាស់ 用途：</strong>
                <span>{request.purpose || ''}</span>
              </div>
              <div />
              <div />
            </section>

            <footer className="purchase-print-signatures">
              <div>
                <span>ស្នើសុំ 申请人</span>
                <strong />
              </div>
              <div>
                <span>អ្នកអនុម័ត 批准人</span>
                <strong />
              </div>
              <div>
                <span>អគ្គនាយក 总经理</span>
                <strong />
              </div>
            </footer>
          </main>
        </div>

        <footer className="purchase-print-modal__actions">
          <button
            type="button"
            className="purchase-print-btn purchase-print-btn--ghost"
            onClick={onClose}
          >
            Close
          </button>
          <button type="button" className="purchase-print-btn" onClick={handlePrint}>
            Print
          </button>
        </footer>
      </section>
    </div>
  );
};

export default PurchaseRequestPrintModal;
