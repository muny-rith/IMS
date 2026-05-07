const BASE_REPORT_COLUMNS = [
  { label: 'Code', key: 'id' },
  { label: 'Item', key: 'name' },
  { label: 'Category', key: 'category' },
  { label: 'Owner', key: 'owner' },
  { label: 'Metric', key: 'metric' },
  { label: 'Status', key: 'status' },
  { label: 'Updated', key: 'updated' },
];

const getMonthlyUsageColumns = (rows) => {
  const daysInMonth = rows[0]?.daysInMonth ?? 31;

  const dayColumns = Array.from({ length: daysInMonth }, (_, index) => ({
    label: String(index + 1),
    getValue: (row) => row.dailyUsage?.[index] || '',
  }));

  return [
    { label: 'ល.រ', getValue: (_row, index) => index + 1 },
    { label: 'ឈ្មោះសម្ភារៈ', key: 'name' },
    { label: 'ស្តុកថ្មី', key: 'newStock' },
    { label: 'ស្តុកចាស់', key: 'oldStock' },
    ...dayColumns,
    { label: 'ចំនួនបើក', key: 'totalUsed' },
    { label: 'ចំនួនសល់', key: 'balance' },
  ];
};

const getMonthlyUsagePdfColumns = (rows) => {
  const columns = getMonthlyUsageColumns(rows);

  return [
    ...columns.slice(0, 2),
    { label: 'រូបភាព', key: 'image', isImage: true },
    ...columns.slice(2),
  ];
};

const isMonthlyUsageRows = (rows) => rows[0]?.reportType === 'monthlyUsage';

const getReportColumns = (rows) =>
  isMonthlyUsageRows(rows) ? getMonthlyUsageColumns(rows) : BASE_REPORT_COLUMNS;

const getPdfReportColumns = (rows) =>
  isMonthlyUsageRows(rows) ? getMonthlyUsagePdfColumns(rows) : BASE_REPORT_COLUMNS;

const getColumnValue = (row, column, index) => {
  const value = column.getValue ? column.getValue(row, index) : row[column.key];
  return value === null || value === undefined ? '' : value;
};

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
  const columns = getReportColumns(rows);
  const headerRow = columns.map((column) => column.label);
  const bodyRows = rows.map((row, index) =>
    columns.map((column) => getColumnValue(row, column, index))
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
  const columns = getReportColumns(rows);
  const monthlyUsageReport = isMonthlyUsageRows(rows);

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

          .monthly-usage th,
          .monthly-usage td {
            padding: 4px;
            text-align: center;
            white-space: nowrap;
          }

          .monthly-usage th:nth-child(1),
          .monthly-usage td:nth-child(1) {
            width: 32px;
          }

          .monthly-usage th:nth-child(2),
          .monthly-usage td:nth-child(2) {
            width: 146px;
            text-align: left;
          }

          .monthly-usage th:nth-child(3),
          .monthly-usage th:nth-child(4),
          .monthly-usage td:nth-child(3),
          .monthly-usage td:nth-child(4) {
            width: 58px;
          }

          .monthly-usage th:nth-child(n + 5):not(:nth-last-child(1)):not(:nth-last-child(2)),
          .monthly-usage td:nth-child(n + 5):not(:nth-last-child(1)):not(:nth-last-child(2)) {
            width: 30px;
          }
        </style>
      </head>
      <body>
        <table class="${monthlyUsageReport ? 'monthly-usage' : ''}">
          <tr>
            <td class="report-title" colspan="${columns.length}">
              ${escapeHtml(reportTitle)}
            </td>
          </tr>
          <tr>
            <td class="report-meta" colspan="${columns.length}">
              Date range: ${escapeHtml(dateRange)} | Generated: ${escapeHtml(generatedAt)}
            </td>
          </tr>
          <tr>
            ${columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join('')}
          </tr>
          ${rows
      .map(
        (row, rowIndex) => `
                <tr>
                  ${columns
            .map(
              (column) =>
                `<td>${escapeHtml(getColumnValue(row, column, rowIndex))}</td>`
            )
            .join('')}
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

const renderPdfCellContent = ({ row, column, rowIndex }) => {
  const value = getColumnValue(row, column, rowIndex);

  if (column.isImage) {
    return value
      ? `<img src="${escapeHtml(value)}" alt="" class="export-image" />`
      : '';
  }

  if (column.key === 'status') {
    return `<span class="status-pill ${getStatusClassName(value)}">${escapeHtml(value)}</span>`;
  }

  return escapeHtml(value);
};

const buildPdfRows = (rows, columns) =>
  rows
    .map(
      (row, rowIndex) => `
        <tr>
          ${columns
          .map(
            (column) =>
              `<td>${renderPdfCellContent({ row, column, rowIndex })}</td>`
          )
          .join('')}
        </tr>
      `
    )
    .join('');

// const buildSummaryCards = (summaryMetrics = []) => {
//   if (!summaryMetrics.length) return '';

//   return `
//     <section class="summary-grid">
//       ${summaryMetrics
//       .map(
//         (item) => `
//             <article class="summary-card">
//               <span>${escapeHtml(item.label)}</span>
//               <strong>${escapeHtml(item.value)}</strong>
//               <p>${escapeHtml(item.detail)}</p>
//             </article>
//           `
//       )
//       .join('')}
//     </section>
//   `;
// };

export const printPdfReport = ({
  rows,
  reportTitle,
  dateRange = 'current',
  summaryMetrics = [],
}) => {
  const columns = getPdfReportColumns(rows);
  const monthlyUsageReport = isMonthlyUsageRows(rows);
  const printWindow = window.open('', '_blank', 'width=1120,height=760');

  if (!printWindow) {
    return false;
  }


  // const generatedAt = new Intl.DateTimeFormat('en-US', {
  //   dateStyle: 'medium',
  //   timeStyle: 'short',
  // }).format(new Date());
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

  const now = new Date();
  const title = `តារាងបើកសម្ភារៈប្រចាំខែ ${khmerMonths[now.getMonth()]}`;

  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(reportTitle)}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Battambang:wght@100;300;400;700;900&family=Epilogue:ital,wght@0,100..900;1,100..900&display=swap');
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
            font-family: "Battambang", "Segoe UI", Arial, sans-serif;

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
            // margin-top: 18px;
          }

          .table-title {
            display: flex;
            justify-content: center;
            align-items: center;
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
            border: 1px solid #000000;
            padding: 8px;
            text-align: left;
            vertical-align: top;
          }

          th {
            color: #313131;
            font-size: 10px;
            font-weight: 900;
            letter-spacing: 0.04em;
            text-transform: uppercase;
          }

          td {
            color: #000000;
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

          .export-image {
            display: block;
            width: 36px;
            height: 20px;
            object-fit: contain;
            margin: 0 auto;
          }

          .report-paper-usage table {
            table-layout: fixed;
            font-size: 7px;
          }

          .report-paper-usage th,
          .report-paper-usage td {
            height: 24px;
            padding: 2px;
            white-space: nowrap;
            vertical-align: middle;
          }

          .report-paper-usage th:nth-child(1),
          .report-paper-usage td:nth-child(1) {
            width: 24px;
            max-width: 24px;
            text-align: center;
          }

          .report-paper-usage th:nth-child(2) {          
            width: 132px;
            max-width: 132px;
            text-align: center;
          }
          .report-paper-usage td:nth-child(2) {
            width: 146px;
            max-width: 146px;
            text-align: left;
          }

          .report-paper-usage th:nth-child(3),
          .report-paper-usage td:nth-child(3) {
            width: 50px;
            max-width: 50px;
            overflow: hidden;
            text-overflow: ellipsis;
            text-align: center;
          }

          .report-paper-usage th:nth-child(4),
          .report-paper-usage th:nth-child(5),
          .report-paper-usage td:nth-child(4),
          .report-paper-usage td:nth-child(5) {
            width: 42px;
            max-width: 42px;
            text-align: center;
          }

          .report-paper-usage th:nth-child(n + 6):not(:nth-last-child(1)):not(:nth-last-child(2)),
          .report-paper-usage td:nth-child(n + 6):not(:nth-last-child(1)):not(:nth-last-child(2)) {
            width: 20px;
            min-width: 1px;
            max-width: 20x;
            text-align: center;
          }

          .report-paper-usage .summary-grid {
            display: none;
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
        <main class="report-paper${monthlyUsageReport ? ' report-paper-usage' : ''}">
          <section class="table-section">
            <div class="table-title">
              <h2>${monthlyUsageReport ? title : escapeHtml(reportTitle)}</h2>
            </div>


            <table>
              <thead>
                <tr>
                  ${columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${buildPdfRows(rows, columns)}
              </tbody>
            </table>
          </section>

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