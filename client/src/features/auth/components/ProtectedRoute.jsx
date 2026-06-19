import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ROUTE_PATHS } from "../../../constants/routes";
import { useAuth } from "../hooks/useAuth";
import "./ProtectedRoute.css";

const ProtectedRoute = () => {
  const { loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-route-state">
        <div>
          <strong>Checking session</strong>
          <span>Preparing Moon IMS...</span>
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

  return <Outlet />;
};

export default ProtectedRoute;
