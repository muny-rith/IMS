// src/features/loans/pages/LoanPrintModal.jsx
import React, { useMemo } from 'react';

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';

import './LoanPrintModal.css';

const SIGNATURES = [
//   { title: 'Prepared by', khmer: 'អ្នករៀបចំ' },
  { title: 'Checked by', khmer: 'អ្នកពិនិត្យ' },
  { title: 'Received by', khmer: 'អ្នកយក' },
];

const formatDate = (value) => {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

// const formatDateTime = (value) => {
//   const date = value ? new Date(value) : new Date();

//   return new Intl.DateTimeFormat('en-GB', {
//     day: '2-digit',
//     month: 'short',
//     year: 'numeric',
//     hour: '2-digit',
//     minute: '2-digit',
//   }).format(date);
// };

const formatQty = (value) => Number(value ?? 0).toLocaleString('en-US');

const InfoItem = ({ label, value }) => (
  <div className="loan-print-info__item">
    <span>{label}</span>
    <strong>{value || '—'}</strong>
  </div>
);

const LoanPrintModal = ({ open, onClose, loan = null }) => {
  const items = useMemo(() => loan?.items ?? [], [loan]);


  const totals = useMemo(
    () =>
      items.reduce(
        (sum, item) => ({
          borrowed: sum.borrowed + Number(item.qty ?? 0),
          returned: sum.returned + Number(item.returnedQty ?? 0),
          remaining: sum.remaining + Number(item.remainingQty ?? 0),
        }),
        { borrowed: 0, returned: 0, remaining: 0 }
      ),
    [items]
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      className="loan-print-dialog"
    >
      <DialogTitle className="loan-print-title">
        Print loan form
      </DialogTitle>

      <DialogContent className="loan-print-content" dividers>
        <div className="loan-print-area">
          <article className="loan-print-paper">
            <header className="loan-print-header">
              <div className="loan-print-brand">
                <div className="loan-print-logo">M</div>
                <div>
                  <h1>Moon IMS</h1>
                  <p>Inventory Management System</p>
                </div>
              </div>

              <div className="loan-print-document">
                <strong>Loan Issue Form</strong>
                <span>A5 Document</span>
              </div>
            </header>

            <section className="loan-print-info">
              <InfoItem label="Loan Code" value={loan?.code} />
              {/* <InfoItem label="Status" value={loan?.status} /> */}
              <InfoItem label="Loan Date" value={formatDate(loan?.loanDate)} />
              <InfoItem label="Due Date" value={formatDate(loan?.dueDate)} />
              <InfoItem label="Total Items" value={items.length} />

              <InfoItem label="Worker Code" value={loan?.workerCode} />
              <InfoItem label="Worker Name" value={loan?.workerName} />
              <InfoItem label="Printed At" value={formatDate(new Date())} />
              <InfoItem label="Note" value={loan?.notes} />
            </section>


            <section className="loan-print-table-section">
              <h2>Loan Items</h2>

              <table className="loan-print-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Code</th>
                    <th>Product</th>
                    <th>Borrowed</th>
                    {/* <th>Returned</th>
                    <th>Remain</th> */}
                  </tr>
                </thead>

                <tbody>
                  {items.length > 0 ? (
                    items.map((item, index) => (
                      <tr key={item.id ?? index}>
                        <td>{index + 1}</td>
                        <td>{item.productCode || '—'}</td>
                        <td>{item.productName || '—'}</td>
                        <td>{formatQty(item.qty)}</td>
                        {/* <td>{formatQty(item.returnedQty)}</td>
                        <td>{formatQty(item.remainingQty)}</td> */}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="loan-print-empty">
                        No loan items.
                      </td>
                    </tr>
                  )}
                </tbody>

                <tfoot>
                  <tr>
                    <td colSpan="3">Total</td>
                    <td>{formatQty(totals.borrowed)}</td>
                    {/* <td>{formatQty(totals.returned)}</td>
                    <td>{formatQty(totals.remaining)}</td> */}
                  </tr>
                </tfoot>
              </table>
            </section>

            <section className="loan-print-signatures">
              {SIGNATURES.map((item) => (
                <div className="loan-print-signature" key={item.title}>
                  <div className="loan-print-signature__line" />
                  <strong>{item.title}</strong>
                  <span>{item.khmer}</span>
                  <small>Date: ____ / ____ / ______</small>
                </div>
              ))}
            </section>
          </article>
        </div>
      </DialogContent>

      <DialogActions className="loan-print-actions">
        <button
          type="button"
          className="loan-print-btn loan-print-btn--ghost"
          onClick={onClose}
        >
          Close
        </button>

        <button
          type="button"
          className="loan-print-btn"
          onClick={handlePrint}
        >
          Print
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default LoanPrintModal;
