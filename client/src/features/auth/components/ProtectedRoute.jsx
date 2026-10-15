import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ROUTE_PATHS } from "../../../constants/routes";
import { useAuth } from "../hooks/useAuth";
import logo from "../../../assets/images/logo.png";
import "./ProtectedRoute.css";

const ProtectedRoute = ({ allowedRoles }) => {
  const { loading, isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-loading-page" role="status" aria-label="Loading">
        <div className="auth-loading-inner">
          <img src={logo} alt="Moon IMS" className="auth-loading-logo" />
          <div className="auth-loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={ROUTE_PATHS.login}
        replace
        state={{ from: location }}
      />
    );
  }

  // Check role authorization if specified
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role || 'staff';
    if (!allowedRoles.includes(userRole)) {
      // Role not authorized: redirect to products safe landing
      return <Navigate to={ROUTE_PATHS.products} replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
