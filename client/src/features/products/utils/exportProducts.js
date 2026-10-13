/**
 * Utility to export product catalog to Excel (.xls) or CSV format.
 * Formats data with UTF-8 BOM to ensure Khmer and international characters display correctly.
 */

const escapeXml = (unsafe = '') => {
  if (unsafe == null) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

export const exportProductsToExcel = (products = [], filenamePrefix = 'moon-ims-products') => {
  if (!products || products.length === 0) {
    alert('No products available to export.');
    return;
  }

  const generatedAt = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const totalQty = products.reduce((sum, p) => sum + (Number(p.qty) || 0), 0);
  const totalValue = products.reduce(
    (sum, p) => sum + (Number(p.qty) || 0) * (Number(p.price) || 0),
    0
  );

  let tableHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Product Catalog</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          body { font-family: 'Battambang', 'Khmer OS Battambang', 'Segoe UI', Arial, sans-serif; font-size: 11pt; }
          .title { font-size: 16pt; font-weight: bold; color: #0f172a; height: 35px; }
          .meta { font-size: 10pt; color: #64748b; height: 22px; }
          .th { background-color: #1e293b; color: #ffffff; font-weight: bold; text-align: left; padding: 10px; border: 1px solid #cbd5e1; }
          .th-num { text-align: center; }
          .th-right { text-align: right; }
          .td { padding: 8px 10px; border: 1px solid #e2e8f0; vertical-align: middle; }
          .td-num { text-align: center; }
          .td-right { text-align: right; mso-number-format: "\\$#,##0.00"; }
          .td-qty { text-align: center; font-weight: bold; }
          .even { background-color: #f8fafc; }
          .status-in { color: #16a34a; font-weight: bold; }
          .status-low { color: #d97706; font-weight: bold; }
          .status-out { color: #dc2626; font-weight: bold; }
          .total-row { background-color: #f1f5f9; font-weight: bold; border-top: 2px solid #0f172a; }
        </style>
      </head>
      <body>
        <table>
          <tr>
            <td colspan="9" class="title">Moon IMS &mdash; Product Catalog</td>
          </tr>
          <tr>
            <td colspan="9" class="meta">Exported on: ${escapeXml(generatedAt)} &bull; Total Products: ${products.length} items</td>
          </tr>
          <tr><td colspan="9"></td></tr>
          <thead>
            <tr>
              <th class="th th-num" style="width: 50px;">#</th>
              <th class="th" style="width: 250px;">Product Name</th>
              <th class="th" style="width: 140px;">Category</th>
              <th class="th" style="width: 140px;">Brand</th>
              <th class="th" style="width: 130px;">Department</th>
              <th class="th th-right" style="width: 100px;">Price ($)</th>
              <th class="th th-num" style="width: 90px;">Qty</th>
              <th class="th th-num" style="width: 120px;">Status</th>
              <th class="th th-right" style="width: 130px;">Total Value ($)</th>
            </tr>
          </thead>
          <tbody>
  `;

  products.forEach((product, idx) => {
    const isEven = idx % 2 === 1;
    const qty = Number(product.qty) || 0;
    const price = Number(product.price) || 0;
    const rowValue = qty * price;

    let statusText = 'In Stock';
    let statusClass = 'status-in';
    if (qty <= 0) {
      statusText = 'Out of Stock';
      statusClass = 'status-out';
    } else if (qty <= 10) {
      statusText = 'Low Stock';
      statusClass = 'status-low';
    }

    tableHtml += `
      <tr class="${isEven ? 'even' : ''}">
        <td class="td td-num">${idx + 1}</td>
        <td class="td" style="font-weight: 600;">${escapeXml(product.name || 'Unnamed')}</td>
        <td class="td">${escapeXml(product.category || '—')}</td>
        <td class="td">${escapeXml(product.brand || '—')}</td>
        <td class="td">${escapeXml(product.department || 'N/A')}</td>
        <td class="td td-right">$${price.toFixed(2)}</td>
        <td class="td td-qty">${qty}</td>
        <td class="td td-num ${statusClass}">${statusText}</td>
        <td class="td td-right">$${rowValue.toFixed(2)}</td>
      </tr>
    `;
  });

  tableHtml += `
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="5" class="td" style="text-align: right; font-weight: bold;">TOTAL:</td>
              <td class="td td-right">—</td>
              <td class="td td-qty">${totalQty}</td>
              <td class="td td-num">—</td>
              <td class="td td-right">$${totalValue.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([`\uFEFF${tableHtml}`], {
    type: 'application/vnd.ms-excel;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `${filenamePrefix}-${dateStr}.xls`;

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const exportProductsToCsv = (products = [], filenamePrefix = 'moon-ims-products') => {
  if (!products || products.length === 0) {
    alert('No products available to export.');
    return;
  }

  const headers = ['#', 'Product Name', 'Category', 'Brand', 'Department', 'Price ($)', 'Qty', 'Status', 'Total Value ($)'];

  const rows = products.map((p, idx) => {
    const qty = Number(p.qty) || 0;
    const price = Number(p.price) || 0;
    const rowValue = qty * price;
    const status = qty <= 0 ? 'Out of Stock' : qty <= 10 ? 'Low Stock' : 'In Stock';

    return [
      idx + 1,
      `"${String(p.name || '').replace(/"/g, '""')}"`,
      `"${String(p.category || '').replace(/"/g, '""')}"`,
      `"${String(p.brand || '').replace(/"/g, '""')}"`,
      `"${String(p.department || '').replace(/"/g, '""')}"`,
      price.toFixed(2),
      qty,
      status,
      rowValue.toFixed(2),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `${filenamePrefix}-${dateStr}.csv`;

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
