import { Spinner } from "react-bootstrap";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export function RequireAuth() {
  const { user, isAuthLoading } = useAuth();
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

  return <Outlet />;
}
