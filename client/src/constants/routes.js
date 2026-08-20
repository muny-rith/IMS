export const ROUTE_SEGMENTS = Object.freeze({
  login: "login",
  dashboard: "dashboard",
  products: "products",
  categories: "categories",
  loans: "loans",
  workers: "workers",
  stocks: "stocks",
  reports: "reports",
  attributes: "attributes",
  purchase_requests: "purchase-requests",
  stock_issues: "stock-issues",
  sales: "sales",
});

export const ROUTE_PATHS = Object.freeze({
  login: `/${ROUTE_SEGMENTS.login}`,
  dashboard: `/${ROUTE_SEGMENTS.dashboard}`,
  products: `/${ROUTE_SEGMENTS.products}`,
  categories: `/${ROUTE_SEGMENTS.categories}`,
  loans: `/${ROUTE_SEGMENTS.loans}`,
  workers: `/${ROUTE_SEGMENTS.workers}`,
  stocks: `/${ROUTE_SEGMENTS.stocks}`,
  reports: `/${ROUTE_SEGMENTS.reports}`,
  attributes: `/${ROUTE_SEGMENTS.attributes}`,
  purchase_requests: `/${ROUTE_SEGMENTS.purchase_requests}`,
  stock_issues: `/${ROUTE_SEGMENTS.stock_issues}`,
  sales: `/${ROUTE_SEGMENTS.sales}`,
});
