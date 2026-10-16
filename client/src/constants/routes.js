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
  brands: "brands",
  product_new: "products/new",
  product_edit: "products/edit/:id",
  product_view: "products/view/:id",
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
  brands: `/${ROUTE_SEGMENTS.brands}`,
  product_new: `/${ROUTE_SEGMENTS.product_new}`,
  product_edit: `/${ROUTE_SEGMENTS.product_edit}`,
  product_view: `/${ROUTE_SEGMENTS.product_view}`,
});

/**
 * Returns the default home destination based on the user's role.
 * - Admin / Manager -> Dashboard (/dashboard)
 * - Worker / Staff / Other -> Product Catalog (/products)
 */
export const getHomeRouteByRole = (role = 'staff') => {
  const normalizedRole = String(role || '').toLowerCase();
  if (['admin', 'manager'].includes(normalizedRole)) {
    return ROUTE_PATHS.dashboard;
  }
  return ROUTE_PATHS.products;
};
