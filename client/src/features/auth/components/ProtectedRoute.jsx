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
      <div className="auth-route-state" role="status" aria-live="polite">
        <div className="auth-splash-card">
          <div className="auth-splash-brand">
            <div className="auth-splash-logo-wrapper">
              <img src={logo} alt="Moon IMS" className="auth-splash-logo" />
              <div className="auth-splash-glow"></div>
            </div>
            <div className="auth-splash-title-row">
              <span className="auth-splash-title">MOON</span>
              <span className="auth-splash-badge">IMS</span>
            </div>
          </div>

          <div className="auth-splash-loader-area">
            <div className="auth-splash-spinner"></div>
            <div className="auth-splash-status">
              <span className="auth-splash-status-dot"></span>
              <span className="auth-splash-status-text">Checking session</span>
            </div>
          </div>

          <span className="auth-splash-caption">Preparing your workspace...</span>
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
