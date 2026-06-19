import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../constants/routes";
import { useAuth } from "../hooks/useAuth";
import "./LoginPage.css";

const getRedirectPath = (location) => {
  const pathname = location.state?.from?.pathname;
  return pathname && pathname !== ROUTE_PATHS.login
    ? pathname
    : ROUTE_PATHS.dashboard;
};

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, isAuthenticated, loading } = useAuth();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!loading && isAuthenticated) {
    return <Navigate to={getRedirectPath(location)} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await signIn({
        email: loginId.trim(),
        password,
      });

      navigate(getRedirectPath(location), { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please check username and password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-shell">
        <div className="login-visual-panel" aria-hidden="true">
          <div className="login-visual-orbit login-visual-orbit--large" />
          <div className="login-visual-orbit login-visual-orbit--small" />

          <div className="login-art-wrap">
            <div className="login-art" />
          </div>

          {/* <h1 className="login-visual-title">TECHNOLOGY</h1> */}

          <div className="login-visual-footer">
            <p>
              Create by <strong>MOON</strong>
            </p>
            <p>All rights reserved</p>
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-form-header">
            <p className="login-eyebrow">Moon IMS</p>
            <h2>Sign In</h2>
            <p>Use your IMS username to continue your workday.</p>
          </div>

          {error ? <div className="login-error">{error}</div> : null}

          <label className="login-field" aria-label="Username or email">
            <input
              type="text"
              value={loginId}
              onChange={(event) => setLoginId(event.target.value)}
              placeholder="username"
              autoComplete="username"
              required
            />
          </label>

          <label className="login-field" aria-label="Password">
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="password"
              autoComplete="current-password"
              required
            />
          </label>

          <div className="login-meta-row">
            <span>Remember today?</span>
            <button
              type="button"
              onClick={() =>
                setError("Please contact your IMS admin to reset password.")
              }
            >
              Forgot password
            </button>
          </div>

          <button
            type="submit"
            className="login-submit"
            disabled={submitting || loading}
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>

        </form>
      </section>
    </main>
  );
}

export default LoginPage;
