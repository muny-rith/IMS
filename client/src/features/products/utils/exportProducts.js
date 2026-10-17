/**
 * Utility to export product catalog & variants to Excel (.xls) or CSV format.
 * Dynamically respects active/selected columns matching the Google Sheet layout:
 * [ # No. | Product Name | Attributes | Other (Detail) | Price ($) | optional SKU / Category / Stock ]
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

export const formatVariantAttributesString = (item) => {
  if (!item) return '-';
  if (item.formattedAttributes) return item.formattedAttributes;
  if (Array.isArray(item.attribute_values) && item.attribute_values.length > 0) {
    const formatted = item.attribute_values
      .map((attr) => {
        const name = attr.attribute_name || 'Attr';
        const val = attr.value || '';
        return `${name}: ${val}`;
      })
      .filter((s) => s.trim().length > 0)
      .join(' / ');
    return formatted || '-';
  }
  if (item.attributes && typeof item.attributes === 'object') {
    const entries = Object.entries(item.attributes);
    if (entries.length > 0) {
      return entries
        .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
        .join(' / ');
    }
  }
  return '-';
};

const extractField = (item, colId, idx) => {
  switch (colId) {
    case 'no':
      return idx + 1;
    case 'name':
      return item.product_name || item.name || 'Unnamed';
    case 'attributes':
      return formatVariantAttributesString(item);
    case 'other':
      return (item.other && String(item.other).trim()) || '-';
    case 'price':
      return Number(item.unit_price ?? item.price ?? 0);
    case 'sku':
      return item.sku || item.code || '-';
    case 'category':
      return item.category_name || item.category || '-';
    case 'brand':
      return item.brand_name || item.brand || '-';
    case 'stock':
      return Number(item.on_hand_qty ?? item.qty ?? 0);
    default:
      return item[colId] ?? '-';
  }
};

const CORE_COL_IDS = ['no', 'name', 'attributes', 'other', 'price'];

const buildColumnDefinitions = (selectedCols = []) => {
  const allDefs = [
    { id: 'no', label: '# No.', align: 'center', width: '60px' },
    { id: 'name', label: 'Product Name', align: 'left', width: '220px' },
    { id: 'attributes', label: 'Attributes', align: 'left', width: '200px' },
    { id: 'other', label: 'Other (Detail)', align: 'left', width: '130px' },
    { id: 'price', label: 'Price ($)', align: 'right', width: '100px' },
    { id: 'sku', label: 'SKU', align: 'left', width: '110px' },
    { id: 'category', label: 'Category', align: 'left', width: '140px' },
    { id: 'brand', label: 'Brand', align: 'left', width: '130px' },
    { id: 'stock', label: 'Stock Qty', align: 'right', width: '90px' },
  ];

  const activeCols = Array.isArray(selectedCols) ? selectedCols : [];
  return allDefs.filter((d) => CORE_COL_IDS.includes(d.id) || activeCols.includes(d.id));
};

export const exportProductsToExcel = (
  items = [],
  selectedCols = [],
  filenamePrefix = 'Report_Products'
) => {
  if (!items || items.length === 0) {
    alert('No products available to export.');
    return;
  }

  const cols = buildColumnDefinitions(selectedCols);
  const generatedAt = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  let tableHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Product Variants</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; }
          .title { font-size: 15pt; font-weight: bold; color: #0f172a; height: 32px; }
          .meta { font-size: 9.5pt; color: #64748b; height: 20px; }
          .th { background-color: #1e293b; color: #ffffff; font-weight: bold; text-align: left; padding: 8px 10px; border: 1px solid #cbd5e1; }
          .th-num { text-align: center; }
          .th-right { text-align: right; }
          .td { padding: 6px 10px; border: 1px solid #e2e8f0; vertical-align: middle; }
          .td-num { text-align: center; color: #64748b; }
          .td-name { font-weight: 600; color: #0f172a; }
          .td-attr { color: #334155; }
          .td-right { text-align: right; mso-number-format: "\\$#,##0.00"; font-weight: bold; color: #0f766e; }
          .td-qty { text-align: right; font-weight: 600; }
          .even { background-color: #f8fafc; }
          .total-row { background-color: #f1f5f9; font-weight: bold; border-top: 2px solid #0f172a; }
        </style>
      </head>
      <body>
        <table>
          <tr>
            <td colspan="${cols.length}" class="title">INVENTORY MANAGEMENT SYSTEM &mdash; Product Variants Report</td>
          </tr>
          <tr>
            <td colspan="${cols.length}" class="meta">Exported on: ${escapeXml(generatedAt)} &bull; Total Variants: ${items.length} items</td>
          </tr>
          <tr><td colspan="${cols.length}"></td></tr>
          <thead>
            <tr>
              ${cols
                .map((col) => {
                  const alignClass = col.align === 'center' ? 'th-num' : col.align === 'right' ? 'th-right' : '';
                  return `<th class="th ${alignClass}" style="width: ${col.width};">${escapeXml(col.label)}</th>`;
                })
                .join('')}
            </tr>
          </thead>
          <tbody>
  `;

  items.forEach((item, idx) => {
    const isEven = idx % 2 === 1;
    tableHtml += `<tr class="${isEven ? 'even' : ''}">`;

    cols.forEach((col) => {
      const val = extractField(item, col.id, idx);
      if (col.id === 'no') {
        tableHtml += `<td class="td td-num">${val}</td>`;
      } else if (col.id === 'name') {
        tableHtml += `<td class="td td-name">${escapeXml(val)}</td>`;
      } else if (col.id === 'price') {
        tableHtml += `<td class="td td-right">$${Number(val).toFixed(2)}</td>`;
      } else if (col.id === 'stock') {
        tableHtml += `<td class="td td-qty">${val}</td>`;
      } else if (col.id === 'attributes') {
        tableHtml += `<td class="td td-attr">${escapeXml(val)}</td>`;
      } else {
        tableHtml += `<td class="td">${escapeXml(val)}</td>`;
      }
    });

    tableHtml += `</tr>`;
  });

  tableHtml += `
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td class="td td-num" style="font-weight: bold;">—</td>
              <td class="td td-name">Total: ${items.length} variants</td>
              ${cols
                .slice(2)
                .map((col) => {
                  if (col.id === 'stock') {
                    const totalQty = items.reduce((s, i) => s + Number(extractField(i, 'stock', 0)), 0);
                    return `<td class="td td-qty">${totalQty}</td>`;
                  }
                  return `<td class="td" style="text-align: center;">—</td>`;
                })
                .join('')}
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
  const filename = `${filenamePrefix}_${dateStr}.xls`;

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const exportProductsToCsv = (
  items = [],
  selectedCols = [],
  filenamePrefix = 'Report_Products'
) => {
  if (!items || items.length === 0) {
    alert('No products available to export.');
    return;
  }

  const cols = buildColumnDefinitions(selectedCols);
  const headers = cols.map((c) => c.label);

  const rows = items.map((item, idx) => {
    return cols
      .map((col) => {
        const raw = extractField(item, col.id, idx);
        if (col.id === 'price') {
          return `$${Number(raw).toFixed(2)}`;
        }
        const stringified = String(raw ?? '');
        return `"${stringified.replace(/"/g, '""')}"`;
      })
      .join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `${filenamePrefix}_${dateStr}.csv`;

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
