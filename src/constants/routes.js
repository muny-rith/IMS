export const ROUTE_SEGMENTS = Object.freeze({
  dashboard: "dashboard",
  products: "products",
  categories: "categories",
  loans: "loans",
  workers: "workers",
  stocks: "stocks",
  reports: "reports",
});

export const ROUTE_PATHS = Object.freeze({
  dashboard: `/${ROUTE_SEGMENTS.dashboard}`,
  products: `/${ROUTE_SEGMENTS.products}`,
  categories: `/${ROUTE_SEGMENTS.categories}`,
  loans: `/${ROUTE_SEGMENTS.loans}`,
  workers: `/${ROUTE_SEGMENTS.workers}`,
  stocks: `/${ROUTE_SEGMENTS.stocks}`,
  reports: `/${ROUTE_SEGMENTS.reports}`,
});