import { ROUTE_PATHS } from "../../../constants/routes";

export const dashboardHeroMock = {
  eyebrow: "Operations overview",
  title: "See what needs attention before stock becomes a problem.",
  description:
    "Track loan pressure, product health, and operational hotspots from one inventory-focused view.",
  pulseLabel: "Ops pulse",
  pulseValue: "87% of scheduled returns are on track",
  pulseDetail:
    "Main pressure is coming from barcode scanners, packaging materials, and overdue office equipment loans.",
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
    label: "Review products",
    hint: "Check item master data and current catalog health.",
    path: ROUTE_PATHS.products,
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

export const dashboardLoanTrendMock = [
  { label: "Mon", loanOut: 12, returned: 7 },
  { label: "Tue", loanOut: 9, returned: 5 },
  { label: "Wed", loanOut: 16, returned: 8 },
  { label: "Thu", loanOut: 11, returned: 9 },
  { label: "Fri", loanOut: 14, returned: 10 },
  { label: "Sat", loanOut: 8, returned: 6 },
  { label: "Sun", loanOut: 6, returned: 4 },
];
