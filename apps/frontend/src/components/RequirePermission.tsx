import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

interface RequirePermissionProps {
  permissions: string[];
  requireAll?: boolean;
}

export function RequirePermission({
  permissions,
  requireAll = false,
}: RequirePermissionProps) {
  const { hasPermission } = useAuth();

  // Checks if the user has all permissions or at least one of them
  const isAllowed = requireAll
    ? permissions.every(hasPermission)
    : permissions.some(hasPermission);

  if (!isAllowed) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
