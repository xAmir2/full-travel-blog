import { useEffect, useMemo, useState } from "react";

import { Alert, Badge, Button, Form, Image, Spinner } from "react-bootstrap";

import {
  Check2,
  People,
  PersonBadge,
  Search,
  ShieldCheck,
} from "react-bootstrap-icons";

import { useAuth } from "../context/AuthContext";

import { changeUserRole, getRoles, getUsers } from "../services/userService";

import { getApiErrorMessage } from "../services/apiErrors";

import type { Role, User } from "../types/models";

export function AdminUsersPage() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  // Stores the selected role for each user
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>(
    {},
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [savingUserId, setSavingUserId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadData() {
      try {
        const [loadedUsers, loadedRoles] = await Promise.all([
          getUsers(),
          getRoles(),
        ]);

        if (!isActive) {
          return;
        }

        const initialRoles = loadedUsers.reduce<Record<string, string>>(
          (result, currentUserEntry) => {
            result[currentUserEntry.id] = currentUserEntry.role.id;

            return result;
          },
          {},
        );

        setUsers(loadedUsers);
        setRoles(loadedRoles);
        setSelectedRoles(initialRoles);
      } catch (loadError) {
        if (isActive) {
          setError(
            getApiErrorMessage(loadError, "The users could not be loaded."),
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      isActive = false;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    return users
      .filter(
        (currentUserEntry) =>
          roleFilter === "ALL" || currentUserEntry.role.id === roleFilter,
      )
      .filter((currentUserEntry) => {
        if (!normalizedSearchTerm) {
          return true;
        }

        const searchableValue = [
          currentUserEntry.name,
          currentUserEntry.surname,
          currentUserEntry.username,
          currentUserEntry.email,
          currentUserEntry.role.name,
        ]
          .join(" ")
          .toLowerCase();

        return searchableValue.includes(normalizedSearchTerm);
      })
      .sort((firstUser, secondUser) =>
        firstUser.username.localeCompare(secondUser.username),
      );
  }, [roleFilter, searchTerm, users]);

  function handleRoleSelection(userId: string, roleId: string) {
    setSelectedRoles((currentRoles) => ({
      ...currentRoles,
      [userId]: roleId,
    }));

    setMessage(null);
    setError(null);
  }

  async function handleSave(userId: string) {
    const roleId = selectedRoles[userId];

    if (!roleId) {
      setError("Select a role first.");
      return;
    }

    setSavingUserId(userId);
    setMessage(null);
    setError(null);

    try {
      const updatedUser = await changeUserRole(userId, roleId);

      setUsers((currentUsers) =>
        currentUsers.map((currentUserEntry) =>
          currentUserEntry.id === userId ? updatedUser : currentUserEntry,
        ),
      );

      setSelectedRoles((currentRoles) => ({
        ...currentRoles,
        [userId]: updatedUser.role.id,
      }));

      setMessage(
        `The role for @${updatedUser.username} was updated to ${updatedUser.role.name}.`,
      );
    } catch (saveError) {
      setError(
        getApiErrorMessage(saveError, "The user role could not be updated."),
      );
    } finally {
      setSavingUserId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="admin-users-loading">
        <Spinner animation="border" role="status" />

        <p>Loading the community…</p>
      </div>
    );
  }

  return (
    <div className="admin-users-page">
      <header className="admin-page-header">
        <div>
          <span className="admin-page-eyebrow">Community access</span>

          <h1>Users</h1>

          <p>
            Review registered accounts and assign the appropriate role to each
            member.
          </p>
        </div>

        <div className="admin-users-total">
          <People />

          <div>
            <strong>{users.length}</strong>

            <span>
              {users.length === 1 ? "registered user" : "registered users"}
            </span>
          </div>
        </div>
      </header>

      {message && (
        <Alert
          variant="success"
          className="admin-feedback-alert"
          dismissible
          onClose={() => setMessage(null)}
        >
          <Check2 className="me-2" />
          {message}
        </Alert>
      )}

      {error && (
        <Alert
          variant="danger"
          className="admin-feedback-alert"
          dismissible
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <section className="admin-users-panel">
        <div className="admin-users-toolbar">
          <div className="admin-search-field">
            <Search aria-hidden="true" />

            <Form.Control
              type="search"
              aria-label="Search users"
              placeholder="Search name, username or email…"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <Form.Select
            className="admin-role-filter"
            aria-label="Filter users by role"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
          >
            <option value="ALL">All roles</option>

            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </Form.Select>
        </div>

        <div className="admin-users-results">
          Showing {filteredUsers.length} of {users.length}{" "}
          {users.length === 1 ? "user" : "users"}
        </div>

        {filteredUsers.length === 0 ? (
          <div className="admin-users-empty">
            <People />

            <strong>No users found.</strong>

            <p>Try changing your search or selected role.</p>

            <Button
              type="button"
              size="sm"
              variant="outline-primary"
              onClick={() => {
                setSearchTerm("");
                setRoleFilter("ALL");
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="admin-user-list">
            {filteredUsers.map((user) => {
              const selectedRoleId = selectedRoles[user.id] ?? user.role.id;

              const selectedRole = roles.find(
                (role) => role.id === selectedRoleId,
              );

              const isSaving = savingUserId === user.id;

              const hasChanged = selectedRoleId !== user.role.id;

              const isCurrentUser = currentUser?.id === user.id;

              return (
                <article
                  key={user.id}
                  className={`admin-user-card${
                    isCurrentUser ? " admin-current-user-card" : ""
                  }`}
                >
                  <div className="admin-user-identity">
                    {user.avatarUrl ? (
                      <Image
                        src={user.avatarUrl}
                        alt=""
                        className="admin-user-avatar"
                        roundedCircle
                      />
                    ) : (
                      <div
                        className="admin-user-avatar admin-user-placeholder"
                        aria-hidden="true"
                      >
                        {(
                          user.name.charAt(0) + user.surname.charAt(0)
                        ).toUpperCase() ||
                          user.username.charAt(0).toUpperCase() ||
                          "U"}
                      </div>
                    )}

                    <div>
                      <div className="admin-user-name">
                        <strong>
                          {user.name} {user.surname}
                        </strong>

                        {isCurrentUser && <Badge>You</Badge>}
                      </div>

                      <span>@{user.username}</span>

                      <a href={`mailto:${user.email}`}>{user.email}</a>
                    </div>
                  </div>

                  <div className="admin-user-role-editor">
                    <div className="admin-user-field-heading">
                      <PersonBadge />

                      <span>Assigned role</span>
                    </div>

                    <Form.Select
                      aria-label={`Role for ${user.username}`}
                      value={selectedRoleId}
                      disabled={isSaving}
                      onChange={(event) =>
                        handleRoleSelection(user.id, event.target.value)
                      }
                    >
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </Form.Select>

                    {isCurrentUser && hasChanged && (
                      <small className="admin-self-role-warning">
                        Changing your own role may affect your access after
                        refreshing or logging in again.
                      </small>
                    )}
                  </div>

                  <div className="admin-user-permissions">
                    <div className="admin-user-field-heading">
                      <ShieldCheck />

                      <span>Permissions</span>
                    </div>

                    {selectedRole?.permissions.length ? (
                      <div className="admin-user-permission-list">
                        {selectedRole.permissions.map((permission) => (
                          <Badge key={permission.id}>{permission.name}</Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="admin-no-permissions">
                        No permissions assigned
                      </span>
                    )}
                  </div>

                  <div className="admin-user-save">
                    <Button
                      type="button"
                      disabled={isSaving || !hasChanged}
                      onClick={() => void handleSave(user.id)}
                    >
                      {isSaving ? (
                        <>
                          <Spinner animation="border" size="sm" />
                          Saving…
                        </>
                      ) : hasChanged ? (
                        <>
                          <Check2 />
                          Save role
                        </>
                      ) : (
                        "Up to date"
                      )}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
