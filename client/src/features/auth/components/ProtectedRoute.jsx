import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ROUTE_PATHS } from "../../../constants/routes";
import { useAuth } from "../hooks/useAuth";
import logo from "../../../assets/images/logo.png";
import "./ProtectedRoute.css";

const ProtectedRoute = ({ allowedRoles }) => {
  const { loading, isAuthenticated, user } = useAuth();
  const location = useLocation();

  // 1. If initializing and we have no cached session, show splash screen to prevent 401 cascades
  if (loading && !isAuthenticated) {
    return (
      <div className="auth-loading-screen" role="status" aria-label="Loading Moon IMS">
        <img src={logo} alt="Moon IMS" className="auth-loading-logo" />
        <div className="auth-loading-spinner" />
      </div>
    );
  }

  // 2. If finished loading and not authenticated, redirect to login
  if (!isAuthenticated && !loading) {
    return (
      <Navigate
        to={ROUTE_PATHS.login}
        replace
        state={{ from: location }}
      />
    );
  }

  // 3. Check role authorization if specified
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role || 'staff';
    if (!allowedRoles.includes(userRole)) {
      // Role not authorized: redirect to products safe landing
      return <Navigate to={ROUTE_PATHS.products} replace />;
    }
  }

  // Directly render Outlet so route pages display their own skeleton loading immediately!
  return <Outlet />;
};

export default ProtectedRoute;
