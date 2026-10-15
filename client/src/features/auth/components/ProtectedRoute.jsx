import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ROUTE_PATHS } from "../../../constants/routes";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = ({ allowedRoles }) => {
  const { loading, isAuthenticated, user } = useAuth();
  const location = useLocation();

  // If not authenticated and finished loading, redirect to login
  if (!isAuthenticated && !loading) {
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

  // Directly render Outlet so route pages display their own skeleton loading immediately!
  return <Outlet />;
};

export default ProtectedRoute;
