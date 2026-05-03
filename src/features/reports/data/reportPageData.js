export const reportTypes = [
  {
    id: "stock",
    eyebrow: "Stock",
    title: "Current Stock Report",
    description: "Review on-hand, reserved, available, low-stock, and out-of-stock items.",
    metric: "1,284 SKUs",
    tone: "amber",
    usesDateRange: false,
    dateHint: "Current stock is live and does not use date range.",
  },
  {
    id: "movement",
    eyebrow: "Movement",
    title: "Stock Movement Report",
    description: "Track adjustment in/out, loan out, returns, issue, and sale activity by date.",
    metric: "342 records",
    tone: "blue",
    usesDateRange: true,
    dateHint: "Filters stock movement history by created date.",
  },
  {
    id: "loan",
    eyebrow: "Loan",
    title: "Outstanding Loan Report",
    description: "See active borrowing, overdue returns, partial returns, and worker ownership.",
    metric: "29 open",
    tone: "rose",
    usesDateRange: true,
    dateHint: "Filters loan records by loan date.",
  },
  {
    id: "worker",
    eyebrow: "Worker",
    title: "Worker Loan History",
    description: "Audit who borrowed what, return behavior, and outstanding responsibilities.",
    metric: "18 workers",
    tone: "green",
    usesDateRange: true,
    dateHint: "Filters worker loan history by loan date.",
  },
];

export const summaryMetrics = [
  { label: "Total Stock Value", value: "$18,420", detail: "+6.8% this month" },
  { label: "Low Stock Items", value: "42", detail: "12 need urgent reorder" },
  { label: "Open Loans", value: "29", detail: "6 overdue today" },
  { label: "Movements Today", value: "86", detail: "38 loan related" },
];

export const reportRows = [
  {
    id: "STK-001",
    name: "Barcode Scanner",
    category: "Equipment",
    owner: "Main Store",
    metric: "4 available",
    status: "Critical",
    updated: "Today",
  },
  {
    id: "STK-002",
    name: "Office Chair",
    category: "Furniture",
    owner: "Admin Team",
    metric: "2 overdue",
    status: "Watch",
    updated: "Today",
  },
  {
    id: "STK-003",
    name: "Packing Tape",
    category: "Packaging",
    owner: "Warehouse",
    metric: "18 available",
    status: "Notice",
    updated: "Yesterday",
  },
  {
    id: "STK-004",
    name: "Receipt Printer",
    category: "Equipment",
    owner: "POS Counter",
    metric: "7 available",
    status: "Healthy",
    updated: "May 1",
  },
];

export const savedReports = [
  {
    title: "Low Stock Report",
    detail: "Check products that need reorder.",
    cadence: "Stock",
  },
  {
    title: "Stock Movement Summary",
    detail: "Review adjustment, loan, and return history.",
    cadence: "Movement",
  },
  {
    title: "Outstanding Loan Report",
    detail: "Find active and overdue borrowed items.",
    cadence: "Loan",
  },
];

export const dateRangeOptions = ["Today", "Last 7 days", "Last 30 days", "This month"];

export const exportFormats = ["PDF", "Excel", "CSV"];
