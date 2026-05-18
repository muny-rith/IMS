import { ROUTE_PATHS } from "../../../constants/routes";

export const dashboardHeroMock = {
  eyebrow: "Operations overview",
  title: "See what needs attention before stock becomes a problem.",
  description:
    "Track stock pressure, product health, and operational hotspots from one inventory-focused view.",
  pulseLabel: "Ops pulse",
  pulseValue: "Stock movement is active today",
  pulseDetail:
    "Main pressure is coming from material usage, low stock, and open borrowing follow-up.",
};

export const dashboardStatsMock = [
  {
    title: "Products tracked",
    value: "248",
    detail: "+12 added this month",
    tag: "PR",
    tone: "amber",
  },
  {
    title: "Low stock alerts",
    value: "18",
    detail: "5 items need action today",
    tag: "LS",
    tone: "warning",
  },
  {
    title: "Active loans",
    value: "43",
    detail: "8 due within 7 days",
    tag: "LN",
    tone: "violet",
  },
  {
    title: "Workers borrowing",
    value: "21",
    detail: "3 new borrowers today",
    tag: "WK",
    tone: "sky",
  },
];

export const dashboardAlertsMock = [
  {
    title: "Barcode scanner stock is critically low",
    detail: "Only 4 units remain in the main store and 2 are already reserved.",
    level: "Critical",
  },
  {
    title: "Office chair returns are becoming overdue",
    detail: "2 open loan records passed their due date and need follow-up today.",
    level: "Watch",
  },
  {
    title: "Packing tape should be replenished soon",
    detail: "Available quantity dropped under the preferred operating threshold.",
    level: "Notice",
  },
];

export const dashboardQuickActionsMock = [
  {
    label: "Review stock",
    hint: "Check live stock balances and adjustment history.",
    path: ROUTE_PATHS.stocks,
  },
  {
    label: "Open loans",
    hint: "Follow up active and overdue borrowing records.",
    path: ROUTE_PATHS.loans,
  },
  {
    label: "Manage workers",
    hint: "Update borrower records and department details.",
    path: ROUTE_PATHS.workers,
  },
  {
    label: "View reports",
    hint: "Review summaries and operational snapshots.",
    path: ROUTE_PATHS.reports,
  },
];

export const dashboardStockTrendMock = [
  { label: "Mon", stockIn: 120, stockOut: 74 },
  { label: "Tue", stockIn: 90, stockOut: 52 },
  { label: "Wed", stockIn: 160, stockOut: 88 },
  { label: "Thu", stockIn: 110, stockOut: 93 },
  { label: "Fri", stockIn: 140, stockOut: 105 },
  { label: "Sat", stockIn: 80, stockOut: 62 },
  { label: "Sun", stockIn: 60, stockOut: 42 },
];

export const dashboardLoanTrendMock = dashboardStockTrendMock;
