import { useEffect, useRef, type SyntheticEvent } from "react";

import {
  Button,
  Container,
  Dropdown,
  Form,
  Image,
  Nav,
  Navbar,
} from "react-bootstrap";

import {
  BoxArrowRight,
  Compass,
  Gear,
  MoonStars,
  PersonCircle,
  Search,
  Speedometer2,
  Sun,
  X,
} from "react-bootstrap-icons";

import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import { useTheme } from "../context/themeContext";

import { NotificationMenu } from "./NotificationMenu";

const searchDelay = 450;

export function PublicLayout() {
  const { user, logout, hasPermission } = useAuth();

  const { theme, toggleTheme } = useTheme();

  const location = useLocation();

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const searchTimerRef = useRef<number | null>(null);

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const navbarSearchTerm =
    location.pathname === "/posts" ? (searchParams.get("search") ?? "") : "";

  const canAccessAdmin =
    hasPermission("POST_READ") ||
    hasPermission("POST_CREATE") ||
    hasPermission("POST_UPDATE") ||
    hasPermission("POST_DELETE") ||
    hasPermission("USER_MANAGE") ||
    hasPermission("SITE_CONTENT_MANAGE");

  useEffect(() => {
    const input = searchInputRef.current;

    if (input && input.value !== navbarSearchTerm) {
      input.value = navbarSearchTerm;
    }
  }, [navbarSearchTerm]);

  useEffect(() => {
    return () => {
      if (searchTimerRef.current !== null) {
        window.clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  function handleSearchSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  function handleSearchChange(value: string) {
    if (searchTimerRef.current !== null) {
      window.clearTimeout(searchTimerRef.current);
    }

    const normalizedValue = value.trimStart();

    // Waits until the user stops typing before starting the search
    searchTimerRef.current = window.setTimeout(() => {
      searchTimerRef.current = null;

      if (!normalizedValue.trim()) {
        navigate("/posts", {
          replace: location.pathname === "/posts",
        });

        return;
      }

      navigate(`/posts?search=${encodeURIComponent(normalizedValue)}`, {
        replace: location.pathname === "/posts",
      });
    }, searchDelay);
  }

  function handleClearSearch() {
    if (searchTimerRef.current !== null) {
      window.clearTimeout(searchTimerRef.current);
      searchTimerRef.current = null;
    }

    if (searchInputRef.current) {
      searchInputRef.current.value = "";
      searchInputRef.current.focus();
    }

    navigate("/posts", {
      replace: true,
    });
  }

  return (
    <div className="public-shell d-flex min-vh-100 flex-column">
      <Navbar expand="md" sticky="top" className="cozy-navbar">
        <Container>
          <Link to="/" className="navbar-brand cozy-brand">
            <span className="cozy-brand-icon">
              <Compass />
            </span>

            <span>Explore & Share</span>
          </Link>

          <Navbar.Toggle aria-controls="public-navigation" />

          <Navbar.Collapse id="public-navigation">
            <Form
              className="public-navbar-search ms-md-auto"
              role="search"
              onSubmit={handleSearchSubmit}
            >
              <Search aria-hidden="true" />

              <Form.Control
                ref={(element) => {
                  searchInputRef.current = element as HTMLInputElement | null;
                }}
                type="text"
                inputMode="search"
                aria-label="Search travel stories"
                placeholder="Search stories…"
                defaultValue={navbarSearchTerm}
                onChange={(event) => handleSearchChange(event.target.value)}
              />

              {navbarSearchTerm && (
                <Button
                  type="button"
                  variant="link"
                  className="public-navbar-search-clear"
                  aria-label="Clear search"
                  onClick={handleClearSearch}
                >
                  <X />
                </Button>
              )}
            </Form>

            <Nav className="align-items-md-center">
              <Link to="/" className="nav-link">
                Home
              </Link>

              <Link to="/posts" className="nav-link">
                Journal
              </Link>

              <Button
                type="button"
                variant="link"
                className="cozy-theme-toggle"
                aria-label={
                  theme === "light"
                    ? "Switch to dark mode"
                    : "Switch to light mode"
                }
                title={theme === "light" ? "Dark mode" : "Light mode"}
                onClick={toggleTheme}
              >
                {theme === "light" ? <MoonStars /> : <Sun />}
              </Button>

              {user && <NotificationMenu />}

              {user ? (
                <Dropdown align="end" className="cozy-user-dropdown">
                  <Dropdown.Toggle
                    as={Button}
                    type="button"
                    variant="link"
                    className="cozy-user-dropdown-toggle"
                    aria-label="Open account menu"
                  >
                    {user.avatarUrl ? (
                      <Image
                        src={user.avatarUrl}
                        alt=""
                        className="cozy-navbar-avatar"
                        roundedCircle
                      />
                    ) : (
                      <PersonCircle className="cozy-navbar-avatar-icon" />
                    )}

                    <span>{user.name || user.username}</span>
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="cozy-user-dropdown-menu">
                    <div className="cozy-user-dropdown-header">
                      <strong>{user.name || user.username}</strong>

                      <span>@{user.username}</span>
                    </div>

                    <Dropdown.Divider />

                    <Dropdown.Item
                      as={Link}
                      to="/settings"
                      className="cozy-user-dropdown-item"
                    >
                      <Gear />

                      <span>Profile settings</span>
                    </Dropdown.Item>

                    {canAccessAdmin && (
                      <Dropdown.Item
                        as={Link}
                        to="/admin"
                        className="cozy-user-dropdown-item"
                      >
                        <Speedometer2 />

                        <span>Admin panel</span>
                      </Dropdown.Item>
                    )}

                    <Dropdown.Divider />

                    <Dropdown.Item
                      as="button"
                      type="button"
                      className="cozy-user-dropdown-item cozy-user-dropdown-logout"
                      onClick={() => void handleLogout()}
                    >
                      <BoxArrowRight />

                      <span>Log out</span>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <Link to="/login" className="btn btn-primary cozy-login-button">
                  Log in
                </Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main className="flex-grow-1">
        <Outlet />
      </main>

      <footer className="cozy-footer">
        <Container>
          <div className="cozy-footer-content">
            <div>
              <p className="cozy-footer-brand">Explore & Share</p>

              <p className="mb-0">Thoughtful stories from near and far.</p>
            </div>

            <Link to="/posts">Browse the journal</Link>
          </div>
        </Container>
      </footer>
    </div>
  );
}
