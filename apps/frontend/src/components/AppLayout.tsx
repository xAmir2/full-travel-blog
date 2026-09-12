import { useState, type ReactNode } from "react";

import { Button, Image, Offcanvas } from "react-bootstrap";

import {
  BoxArrowRight,
  Compass,
  FileEarmarkPlus,
  FileText,
  Gear,
  MoonStars,
  Sun,
  HouseDoor,
  JournalText,
  List,
  People,
  PersonBadge,
  Speedometer2,
} from "react-bootstrap-icons";

import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

import { useTheme } from "../context/themeContext";

import { useAuth } from "../context/AuthContext";

interface AdminNavigationLinkProps {
  to: string;
  icon: ReactNode;
  label: string;
  end?: boolean;
  onNavigate?: () => void;
}

function AdminNavigationLink({
  to,
  icon,
  label,
  end = false,
  onNavigate,
}: AdminNavigationLinkProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `admin-navigation-link${isActive ? " active" : ""}`
      }
      onClick={onNavigate}
    >
      <span className="admin-navigation-icon">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}

export function AppLayout() {
  const { user, logout, hasPermission } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [showMobileNavigation, setShowMobileNavigation] = useState(false);

  const canReadPosts = hasPermission("POST_READ");
  const canCreatePosts = hasPermission("POST_CREATE");
  const canManageUsers = hasPermission("USER_MANAGE");
  const canManageSiteContent = hasPermission("SITE_CONTENT_MANAGE");

  function closeMobileNavigation() {
    setShowMobileNavigation(false);
  }

  async function handleLogout() {
    closeMobileNavigation();

    await logout();

    navigate("/");
  }

  function renderNavigation(onNavigate?: () => void) {
    return (
      <nav className="admin-navigation" aria-label="Admin navigation">
        <div className="admin-navigation-group">
          <span className="admin-navigation-label">Workspace</span>

          <AdminNavigationLink
            to="/admin"
            end
            icon={<Speedometer2 />}
            label="Dashboard"
            onNavigate={onNavigate}
          />

          {canReadPosts && (
            <AdminNavigationLink
              to="/admin/posts"
              end
              icon={<FileText />}
              label="Posts"
              onNavigate={onNavigate}
            />
          )}

          {canCreatePosts && (
            <AdminNavigationLink
              to="/admin/posts/new"
              icon={<FileEarmarkPlus />}
              label="New post"
              onNavigate={onNavigate}
            />
          )}
        </div>

        {canManageSiteContent && (
          <div className="admin-navigation-group">
            <span className="admin-navigation-label">Content</span>

            <AdminNavigationLink
              to="/admin/page-heroes"
              icon={<JournalText />}
              label="Page heroes"
              onNavigate={onNavigate}
            />
          </div>
        )}

        {canManageUsers && (
          <div className="admin-navigation-group">
            <span className="admin-navigation-label">Administration</span>

            <AdminNavigationLink
              to="/admin/users"
              icon={<People />}
              label="Users"
              onNavigate={onNavigate}
            />

            <AdminNavigationLink
              to="/admin/roles"
              icon={<PersonBadge />}
              label="Roles and permissions"
              onNavigate={onNavigate}
            />
          </div>
        )}

        <div className="admin-navigation-group">
          <span className="admin-navigation-label">Account</span>

          <button
            type="button"
            className="admin-navigation-link admin-theme-toggle"
            onClick={toggleTheme}
          >
            <span className="admin-navigation-icon">
              {theme === "light" ? <MoonStars /> : <Sun />}
            </span>

            <span>{theme === "light" ? "Dark mode" : "Light mode"}</span>
          </button>

          <AdminNavigationLink
            to="/settings"
            icon={<Gear />}
            label="Profile settings"
            onNavigate={onNavigate}
          />

          <AdminNavigationLink
            to="/"
            icon={<HouseDoor />}
            label="View public blog"
            onNavigate={onNavigate}
          />
        </div>
      </nav>
    );
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link to="/" className="admin-brand">
          <span className="admin-brand-icon">
            <Compass />
          </span>

          <span>
            <strong>Explore & Share</strong>
            <small>Story workspace</small>
          </span>
        </Link>

        <div className="admin-sidebar-content">{renderNavigation()}</div>

        <div className="admin-sidebar-profile">
          {user?.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt=""
              className="admin-profile-avatar"
              roundedCircle
            />
          ) : (
            <div
              className="admin-profile-avatar admin-profile-placeholder"
              aria-hidden="true"
            >
              {(
                `${user?.name?.charAt(0) ?? ""}${
                  user?.surname?.charAt(0) ?? ""
                }` ||
                user?.username?.charAt(0) ||
                "U"
              ).toUpperCase()}
            </div>
          )}

          <div className="admin-profile-copy">
            <strong>{user?.name || user?.username || "Traveller"}</strong>

            <span>{user?.role.name}</span>
          </div>

          <Button
            type="button"
            variant="link"
            className="admin-logout-button"
            aria-label="Log out"
            title="Log out"
            onClick={() => void handleLogout()}
          >
            <BoxArrowRight />
          </Button>
        </div>
      </aside>

      <div className="admin-workspace">
        <header className="admin-mobile-header">
          <Button
            type="button"
            variant="link"
            className="admin-menu-button"
            aria-label="Open navigation"
            onClick={() => setShowMobileNavigation(true)}
          >
            <List />
          </Button>

          <Link to="/admin" className="admin-mobile-brand">
            <Compass />
            <span>Story workspace</span>
          </Link>

          {user?.avatarUrl ? (
            <Link to="/settings">
              <Image
                src={user.avatarUrl}
                alt={`${user.username}'s profile`}
                className="admin-mobile-avatar"
                roundedCircle
              />
            </Link>
          ) : (
            <Link
              to="/settings"
              className="admin-mobile-avatar admin-profile-placeholder"
              aria-label="Profile settings"
            >
              {user?.username?.charAt(0).toUpperCase() ?? "U"}
            </Link>
          )}
        </header>

        <main className="admin-main">
          <div className="admin-page-container">
            <Outlet />
          </div>
        </main>
      </div>

      <Offcanvas
        show={showMobileNavigation}
        onHide={closeMobileNavigation}
        className="admin-mobile-navigation"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            <span className="admin-mobile-offcanvas-title">
              <Compass />
              Story workspace
            </span>
          </Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body>
          {renderNavigation(closeMobileNavigation)}

          <div className="admin-mobile-profile">
            <div>
              <strong>{user?.name || user?.username || "Traveller"}</strong>

              <span>{user?.role.name}</span>
            </div>

            <Button
              type="button"
              variant="outline-secondary"
              size="sm"
              onClick={() => void handleLogout()}
            >
              <BoxArrowRight className="me-2" />
              Log out
            </Button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}
