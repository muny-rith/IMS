const REPORT_COLUMNS = [
  { label: 'Code', key: 'id' },
  { label: 'Item', key: 'name' },
  { label: 'Category', key: 'category' },
  { label: 'Owner', key: 'owner' },
  { label: 'Metric', key: 'metric' },
  { label: 'Status', key: 'status' },
  { label: 'Updated', key: 'updated' },
];

const escapeCsvValue = (value) => {
  if (value === null || value === undefined) return '';

  const stringValue = String(value);

  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const slugify = (value) => {
  const slug = String(value || 'report')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'report';
};

const buildCsvContent = (rows) => {
  const headerRow = REPORT_COLUMNS.map((column) => column.label);
  const bodyRows = rows.map((row) =>
    REPORT_COLUMNS.map((column) => row[column.key])
  );

  return [headerRow, ...bodyRows]
    .map((line) => line.map(escapeCsvValue).join(','))
    .join('\n');
};

export const downloadCsvReport = ({
  rows,
  reportTitle,
  dateRange = 'current',
}) => {
  const csvContent = buildCsvContent(rows);
  const csvWithBom = `\uFEFF${csvContent}`;
  const blob = new Blob([csvWithBom], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const today = new Date().toISOString().slice(0, 10);
  const filename = `${slugify(reportTitle)}-${slugify(dateRange)}-${today}.csv`;

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
};

const buildExcelTable = ({
  rows,
  reportTitle,
  dateRange,
}) => {
  const generatedAt = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date());

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          table {
            border-collapse: collapse;
            font-family: "Noto Sans Khmer", "Segoe UI", Arial, sans-serif;
            font-size: 12px;
          }

          th,
          td {
            border: 1px solid #d1d5db;
            padding: 8px;
            text-align: left;
            vertical-align: top;
          }

          th {
            background: #f1f5f9;
            color: #111827;
            font-weight: 700;
          }

          .report-title {
            background: #ef1744;
            color: #ffffff;
            font-size: 18px;
            font-weight: 800;
          }

          .report-meta {
            background: #fff7ed;
            color: #475569;
            font-weight: 700;
          }
        </style>
      </head>
      <body>
        <table>
          <tr>
            <td class="report-title" colspan="${REPORT_COLUMNS.length}">
              ${escapeHtml(reportTitle)}
            </td>
          </tr>
          <tr>
            <td class="report-meta" colspan="${REPORT_COLUMNS.length}">
              Date range: ${escapeHtml(dateRange)} | Generated: ${escapeHtml(generatedAt)}
            </td>
          </tr>
          <tr>
            ${REPORT_COLUMNS.map((column) => `<th>${escapeHtml(column.label)}</th>`).join('')}
          </tr>
          ${rows
            .map(
              (row) => `
                <tr>
                  ${REPORT_COLUMNS.map(
                    (column) => `<td>${escapeHtml(row[column.key])}</td>`
                  ).join('')}
                </tr>
              `
            )
            .join('')}
        </table>
      </body>
    </html>
  `;
};

export const downloadExcelReport = ({
  rows,
  reportTitle,
  dateRange = 'current',
}) => {
  const excelContent = buildExcelTable({
    rows,
    reportTitle,
    dateRange,
  });
  const excelWithBom = `\uFEFF${excelContent}`;
  const blob = new Blob([excelWithBom], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const today = new Date().toISOString().slice(0, 10);
  const filename = `${slugify(reportTitle)}-${slugify(dateRange)}-${today}.xls`;

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
};

const getStatusClassName = (status) =>
  `status-${slugify(status || 'default')}`;

const buildPdfRows = (rows) =>
  rows
    .map(
      (row) => `
        <tr>
          ${REPORT_COLUMNS.map((column) => {
            const value = row[column.key];
            const isStatusColumn = column.key === 'status';
            const content = isStatusColumn
              ? `<span class="status-pill ${getStatusClassName(value)}">${escapeHtml(value)}</span>`
              : escapeHtml(value);

            return `<td>${content}</td>`;
          }).join('')}
        </tr>
      `
    )
    .join('');

const buildSummaryCards = (summaryMetrics = []) => {
  if (!summaryMetrics.length) return '';

  return `
    <section class="summary-grid">
      ${summaryMetrics
        .map(
          (item) => `
            <article class="summary-card">
              <span>${escapeHtml(item.label)}</span>
              <strong>${escapeHtml(item.value)}</strong>
              <p>${escapeHtml(item.detail)}</p>
            </article>
          `
        )
        .join('')}
    </section>
  `;
};

export const printPdfReport = ({
  rows,
  reportTitle,
  dateRange = 'current',
  summaryMetrics = [],
}) => {
  const printWindow = window.open('', '_blank', 'width=1120,height=760');

  if (!printWindow) {
    return false;
  }

  const generatedAt = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date());

  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(reportTitle)}</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 12mm;
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            color: #0f172a;
            background: #ffffff;
            font-family: "Noto Sans Khmer", "Segoe UI", Arial, sans-serif;
          }

          .report-paper {
            width: 100%;
          }

          .report-header {
            display: flex;
            justify-content: space-between;
            gap: 24px;
            padding-bottom: 16px;
            border-bottom: 2px solid #ef1744;
          }

          .brand {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .brand-mark {
            display: grid;
            place-items: center;
            width: 44px;
            height: 44px;
            border-radius: 14px;
            color: #ffffff;
            background: linear-gradient(135deg, #ef1744, #f97316);
            font-size: 12px;
            font-weight: 900;
            letter-spacing: 0.08em;
          }

          .brand h1 {
            margin: 0;
            font-size: 24px;
            line-height: 1.1;
          }

          .brand p,
          .report-meta p {
            margin: 4px 0 0;
            color: #64748b;
            font-size: 12px;
          }

          .report-meta {
            text-align: right;
          }

          .report-meta strong {
            display: block;
            color: #ef1744;
            font-size: 11px;
            letter-spacing: 0.14em;
            text-transform: uppercase;
          }

          .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 10px;
            margin-top: 16px;
          }

          .summary-card {
            border: 1px solid #e5e7eb;
            border-left: 4px solid #ef1744;
            border-radius: 12px;
            padding: 10px;
          }

          .summary-card span {
            display: block;
            color: #667085;
            font-size: 10px;
            font-weight: 800;
          }

          .summary-card strong {
            display: block;
            margin-top: 5px;
            font-size: 20px;
            line-height: 1;
          }

          .summary-card p {
            margin: 5px 0 0;
            color: #98a2b3;
            font-size: 10px;
          }

          .table-section {
            margin-top: 18px;
          }

          .table-title {
            display: flex;
            justify-content: space-between;
            align-items: end;
            gap: 16px;
            margin-bottom: 10px;
          }

          .table-title h2 {
            margin: 0;
            font-size: 18px;
          }

          .table-title span {
            color: #64748b;
            font-size: 11px;
            font-weight: 800;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
          }

          th,
          td {
            border: 1px solid #e5e7eb;
            padding: 8px;
            text-align: left;
            vertical-align: top;
          }

          th {
            color: #475569;
            background: #f8fafc;
            font-size: 10px;
            font-weight: 900;
            letter-spacing: 0.04em;
            text-transform: uppercase;
          }

          td {
            color: #111827;
          }

          .status-pill {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 999px;
            padding: 4px 8px;
            font-size: 10px;
            font-weight: 900;
            white-space: nowrap;
          }

          .status-critical {
            background: #fee2e2;
            color: #b91c1c;
          }

          .status-watch {
            background: #fef3c7;
            color: #b45309;
          }

          .status-notice {
            background: #dbeafe;
            color: #1d4ed8;
          }

          .status-healthy {
            background: #dcfce7;
            color: #15803d;
          }

          .report-footer {
            margin-top: 18px;
            color: #94a3b8;
            font-size: 10px;
            text-align: right;
          }

          @media print {
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <main class="report-paper">
          <header class="report-header">
            <div class="brand">
              <div class="brand-mark">MOON</div>
              <div>
                <h1>${escapeHtml(reportTitle)}</h1>
                <p>Moon IMS operational report</p>
              </div>
            </div>

            <div class="report-meta">
              <strong>Report Export</strong>
              <p>Date range: ${escapeHtml(dateRange)}</p>
              <p>Generated: ${escapeHtml(generatedAt)}</p>
            </div>
          </header>

          ${buildSummaryCards(summaryMetrics)}

          <section class="table-section">
            <div class="table-title">
              <h2>Report rows</h2>
              <span>${rows.length} rows</span>
            </div>

            <table>
              <thead>
                <tr>
                  ${REPORT_COLUMNS.map((column) => `<th>${escapeHtml(column.label)}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${buildPdfRows(rows)}
              </tbody>
            </table>
          </section>

          <footer class="report-footer">
            Prepared by Moon IMS
          </footer>
        </main>

        <script>
          window.addEventListener('load', function () {
            window.focus();
            setTimeout(function () {
              window.print();
            }, 250);
          });
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();

  return true;
};
