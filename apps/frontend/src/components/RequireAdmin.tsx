import { Spinner } from "react-bootstrap";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const adminPermissions = [
  "POST_READ",
  "POST_CREATE",
  "POST_UPDATE",
  "POST_DELETE",
  "USER_MANAGE",
  "SITE_CONTENT_MANAGE",
];

export function RequireAdmin() {
  const { user, isAuthLoading, hasPermission } = useAuth();
  const location = useLocation();

  if (isAuthLoading) {
    return (
      <div className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading account</span>
        </Spinner>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: `${location.pathname}${location.search}`,
        }}
      />
    );
  }

  const canAccessDashboard = adminPermissions.some(hasPermission);

  if (!canAccessDashboard) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
