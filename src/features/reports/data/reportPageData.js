export const reportTypes = [
  {
    id: "stock",
    eyebrow: "Stock",
    title: "Current Stock Report",
    tone: "amber",
    usesDateRange: false,
  },
  {
    id: "movement",
    eyebrow: "Movement",
    title: "Stock Movement Report",
    tone: "blue",
    usesDateRange: true,
  },
  {
    id: "loan",
    eyebrow: "Loan",
    title: "Outstanding Loan Report",
    tone: "rose",
    usesDateRange: true,
  },
  {
    id: "usage",
    eyebrow: "Usage",
    title: "Monthly Inventory Usage Report",
    tone: "green",
    usesDateRange: false,
    scopeLabel: "This month",
  },
];

export const summaryMetrics = [

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
  {
    title: "Monthly Usage Report",
    detail: "Review daily adjustment-out usage by product.",
    cadence: "Usage",
  },
];

export const dateRangeOptions = ["Today", "Last 7 days", "Last 30 days", "This month"];

export const exportFormats = ["PDF", "Excel", "CSV"];
