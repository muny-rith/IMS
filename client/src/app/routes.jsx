import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout/MainLayout";

import { ROUTE_PATHS, ROUTE_SEGMENTS } from "../constants/routes";

import ProtectedRoute from "../features/auth/components/ProtectedRoute";
import LoginPage from "../features/auth/pages/LoginPage";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import ProductPage from "../features/products/pages/ProductPage";
import CategoryPage from "../features/categories/pages/CategoryPage";
import LoanPage from "../features/loans/pages/LoanPage";
import WorkerPage from "../features/workers/pages/WorkerPage";
import StockPage from "../features/stocks/pages/StockAdjustmentPage";
import ReportPage from "../features/reports/pages/ReportPage";
import AttributePage from "../features/attributes/pages/AttributePage";
import PurchaseRequestPage from "../features/purchase_requests/pages/PurchaseRequestPage";
import StockIssuePage from "../features/stock_issues/pages/StockIssuePage";
import SalePage from "../features/sales/pages/SalePage";

function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTE_SEGMENTS.login} element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to={ROUTE_PATHS.dashboard} replace />} />
          <Route path={ROUTE_SEGMENTS.dashboard} element={<DashboardPage />} />
          <Route path={ROUTE_SEGMENTS.products} element={<ProductPage />} />
          <Route path={ROUTE_SEGMENTS.stocks} element={<StockPage />} />
          <Route path={ROUTE_SEGMENTS.categories} element={<CategoryPage />} />
          <Route path={ROUTE_SEGMENTS.loans} element={<LoanPage />} />
          <Route path={ROUTE_SEGMENTS.workers} element={<WorkerPage />} />
          <Route path={ROUTE_SEGMENTS.reports} element={<ReportPage />} />
          <Route path={ROUTE_SEGMENTS.attributes} element={<AttributePage />} />
          <Route path={ROUTE_SEGMENTS.purchase_requests} element={<PurchaseRequestPage />} />
          <Route path={ROUTE_SEGMENTS.stock_issues} element={<StockIssuePage />} />
          <Route path={ROUTE_SEGMENTS.sales} element={<SalePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={ROUTE_PATHS.dashboard} replace />} />
    </Routes>
  );
}

export default AppRoutes;
