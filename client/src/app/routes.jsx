import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout/MainLayout";

import { ROUTE_PATHS, ROUTE_SEGMENTS } from "../constants/routes";

import ProtectedRoute from "../features/auth/components/ProtectedRoute";
import { useAuth } from "../features/auth/hooks/useAuth";
import LoginPage from "../features/auth/pages/LoginPage";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import ProductPage from "../features/products/pages/ProductPage";
import ProductFormPage from "../features/products/pages/ProductFormPage";
import ProductDetailPage from "../features/products/pages/ProductDetailPage";
import CategoryPage from "../features/categories/pages/CategoryPage";
import BrandPage from "../features/brands/pages/BrandPage";
import LoanPage from "../features/loans/pages/LoanPage";
import WorkerPage from "../features/workers/pages/WorkerPage";
import StockPage from "../features/stocks/pages/StockAdjustmentPage";
import ReportPage from "../features/reports/pages/ReportPage";
import AttributePage from "../features/attributes/pages/AttributePage";
import PurchaseRequestPage from "../features/purchase_requests/pages/PurchaseRequestPage";
import StockIssuePage from "../features/stock_issues/pages/StockIssuePage";
import SalePage from "../features/sales/pages/SalePage";

const HomeRedirect = () => {
  const { user } = useAuth();
  const isStaff = user?.role === 'staff' || user?.role === 'worker';
  return <Navigate to={isStaff ? ROUTE_PATHS.products : ROUTE_PATHS.dashboard} replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTE_SEGMENTS.login} element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomeRedirect />} />

          {/* 1. Routes accessible by Worker (and all roles): Only Product Catalog & Detail View */}
          <Route path={ROUTE_SEGMENTS.products} element={<ProductPage />} />
          <Route path={ROUTE_SEGMENTS.product_view} element={<ProductDetailPage />} />

          {/* 2. Routes accessible by Admin, Manager, and Staff (operational workflow) */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'manager', 'staff']} />}>
            <Route path={ROUTE_SEGMENTS.product_new} element={<ProductFormPage />} />
            <Route path={ROUTE_SEGMENTS.product_edit} element={<ProductFormPage />} />
            <Route path={ROUTE_SEGMENTS.sales} element={<SalePage />} />
            <Route path={ROUTE_SEGMENTS.loans} element={<LoanPage />} />
            <Route path={ROUTE_SEGMENTS.stock_issues} element={<StockIssuePage />} />
            <Route path={ROUTE_SEGMENTS.purchase_requests} element={<PurchaseRequestPage />} />
            <Route path={ROUTE_SEGMENTS.reports} element={<ReportPage />} />
          </Route>

          {/* 3. Management & Admin routes (Admin, Manager) */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'manager']} />}>
            <Route path={ROUTE_SEGMENTS.dashboard} element={<DashboardPage />} />
            <Route path={ROUTE_SEGMENTS.stocks} element={<StockPage />} />
            <Route path={ROUTE_SEGMENTS.categories} element={<CategoryPage />} />
            <Route path={ROUTE_SEGMENTS.brands} element={<BrandPage />} />
            <Route path={ROUTE_SEGMENTS.attributes} element={<AttributePage />} />
            <Route path={ROUTE_SEGMENTS.workers} element={<WorkerPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}

export default AppRoutes;
