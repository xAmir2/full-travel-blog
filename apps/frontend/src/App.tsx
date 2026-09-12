import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "./components/AppLayout";
import { PublicLayout } from "./components/PublicLayout";
import { RequireAdmin } from "./components/RequireAdmin";
import { RequirePermission } from "./components/RequirePermission";

import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdminPageHeroContentPage } from "./pages/AdminPageHeroContentPage";
import { AdminPostFormPage } from "./pages/AdminPostFormPage";
import { AdminPostsPage } from "./pages/AdminPostsPage";
import { AdminRolesPage } from "./pages/AdminRolesPage";
import { AdminUsersPage } from "./pages/AdminUsersPage";
import { LoginPage } from "./pages/LoginPage";
import { PublicHomePage } from "./pages/PublicHomePage";
import { PublicPostPage } from "./pages/PublicPostPage";
import { PublicPostsPage } from "./pages/PublicPostsPage";
import { RequireAuth } from "./components/RequireAuth";
import { SettingsPage } from "./pages/SettingsPage";
import { SignupPage } from "./pages/SignupPage";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<PublicHomePage />} />
          <Route path="posts" element={<PublicPostsPage />} />
          <Route path="posts/:slug" element={<PublicPostPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />

          <Route element={<RequireAuth />}>
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route element={<RequireAdmin />}>
          <Route path="admin" element={<AppLayout />}>
            <Route index element={<AdminDashboardPage />} />

            <Route element={<RequirePermission permissions={["POST_READ"]} />}>
              <Route path="posts" element={<AdminPostsPage />} />
            </Route>

            <Route
              element={<RequirePermission permissions={["POST_CREATE"]} />}
            >
              <Route path="posts/new" element={<AdminPostFormPage />} />
            </Route>

            <Route
              element={
                <RequirePermission
                  permissions={["POST_READ", "POST_UPDATE"]}
                  requireAll
                />
              }
            >
              <Route
                path="posts/:postId/edit"
                element={<AdminPostFormPage />}
              />
            </Route>

            <Route
              element={<RequirePermission permissions={["USER_MANAGE"]} />}
            >
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="roles" element={<AdminRolesPage />} />
            </Route>

            <Route
              element={
                <RequirePermission permissions={["SITE_CONTENT_MANAGE"]} />
              }
            >
              <Route
                path="page-heroes"
                element={<AdminPageHeroContentPage />}
              />
            </Route>

            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
