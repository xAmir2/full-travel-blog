import { useEffect, useMemo, useState, type SubmitEvent } from "react";

import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Row,
  Spinner,
} from "react-bootstrap";

import {
  Check2,
  Key,
  PencilSquare,
  PersonBadge,
  Plus,
  ShieldCheck,
  Trash,
  X,
} from "react-bootstrap-icons";

import { getApiErrorMessage } from "../services/apiErrors";
import { useConfirmation } from "../context/ConfirmationContext";

import {
  createRole,
  deleteRole,
  getPermissions,
  getRoles,
  updateRole,
} from "../services/userService";

import type { Permission, Role, RoleFormData } from "../types/models";

const emptyForm: RoleFormData = {
  name: "",
  permissionIds: [],
};

function formatPermissionName(name: string): string {
  return name
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  const [formData, setFormData] = useState<RoleFormData>(emptyForm);

  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null);
  const { requestConfirmation } = useConfirmation();

  const [message, setMessage] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadData() {
      try {
        const [loadedRoles, loadedPermissions] = await Promise.all([
          getRoles(),
          getPermissions(),
        ]);

        if (isActive) {
          setRoles(loadedRoles);
          setPermissions(loadedPermissions);
        }
      } catch (loadError) {
        if (isActive) {
          setError(
            getApiErrorMessage(
              loadError,
              "Roles and permissions could not be loaded.",
            ),
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

  const sortedRoles = useMemo(
    () =>
      [...roles].sort((firstRole, secondRole) =>
        firstRole.name.localeCompare(secondRole.name),
      ),
    [roles],
  );

  const editingRole = roles.find((role) => role.id === editingRoleId);

  const allPermissionsSelected =
    permissions.length > 0 &&
    permissions.every((permission) =>
      formData.permissionIds.includes(permission.id),
    );

  function resetForm() {
    setFormData(emptyForm);
    setEditingRoleId(null);
  }

  function startEditing(role: Role) {
    setEditingRoleId(role.id);

    setFormData({
      name: role.name,
      permissionIds: role.permissions.map((permission) => permission.id),
    });

    setMessage(null);
    setError(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function updateRoleName(value: string) {
    setFormData((currentFormData) => ({
      ...currentFormData,
      name: value,
    }));

    setMessage(null);
    setError(null);
  }

  function togglePermission(permissionId: string) {
    setFormData((currentFormData) => {
      const isSelected = currentFormData.permissionIds.includes(permissionId);

      return {
        ...currentFormData,
        // Removes the permission if selected, otherwise adds it
        permissionIds: isSelected
          ? currentFormData.permissionIds.filter(
              (currentId) => currentId !== permissionId,
            )
          : [...currentFormData.permissionIds, permissionId],
      };
    });

    setMessage(null);
    setError(null);
  }

  function selectAllPermissions() {
    setFormData((currentFormData) => ({
      ...currentFormData,
      permissionIds: permissions.map((permission) => permission.id),
    }));
  }

  function clearPermissions() {
    setFormData((currentFormData) => ({
      ...currentFormData,
      permissionIds: [],
    }));
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formData.name.trim()) {
      setError("The role name is required.");
      return;
    }

    setIsSaving(true);
    setMessage(null);
    setError(null);

    try {
      if (editingRoleId) {
        const updatedRole = await updateRole(editingRoleId, formData);

        setRoles((currentRoles) =>
          currentRoles.map((role) =>
            role.id === updatedRole.id ? updatedRole : role,
          ),
        );

        setMessage(`The ${updatedRole.name} role was updated.`);
      } else {
        const createdRole = await createRole(formData);

        setRoles((currentRoles) => [...currentRoles, createdRole]);

        setMessage(`The ${createdRole.name} role was created.`);
      }

      resetForm();
    } catch (saveError) {
      setError(
        getApiErrorMessage(
          saveError,
          editingRoleId
            ? "The role could not be updated."
            : "The role could not be created.",
        ),
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(role: Role) {
    const confirmed = await requestConfirmation({
      title: "Delete this role?",
      message: `The ${role.name} role will be permanently removed.`,
      confirmLabel: "Delete role",
      warning:
        "Users assigned to this role may need to be reassigned first. This action cannot be undone.",
      destructive: true,
    });

    if (!confirmed) {
      return;
    }

    setDeletingRoleId(role.id);
    setMessage(null);
    setError(null);

    try {
      await deleteRole(role.id);

      setRoles((currentRoles) =>
        currentRoles.filter((currentRole) => currentRole.id !== role.id),
      );

      if (editingRoleId === role.id) {
        resetForm();
      }

      setMessage(`The ${role.name} role was deleted.`);
    } catch (deleteError) {
      setError(
        getApiErrorMessage(
          deleteError,
          "The role could not be deleted. Make sure no users are currently assigned to it.",
        ),
      );
    } finally {
      setDeletingRoleId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="admin-roles-loading">
        <Spinner animation="border" role="status" />

        <p>Loading roles and permissions…</p>
      </div>
    );
  }

  return (
    <div className="admin-roles-page">
      <header className="admin-page-header">
        <div>
          <span className="admin-page-eyebrow">Access control</span>

          <h1>Roles and permissions</h1>

          <p>
            Create access profiles and decide which operations each role can
            perform.
          </p>
        </div>

        <div className="admin-roles-summary">
          <div>
            <PersonBadge />

            <span>
              <strong>{roles.length}</strong>
              Roles
            </span>
          </div>

          <div>
            <Key />

            <span>
              <strong>{permissions.length}</strong>
              Permissions
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

      <Row className="g-4">
        <Col xl={5}>
          <Card className="admin-role-form-card">
            <Card.Body>
              <div className="admin-role-form-heading">
                <span>{editingRoleId ? <PencilSquare /> : <Plus />}</span>

                <div>
                  <span className="admin-panel-eyebrow">
                    {editingRoleId ? "Editing role" : "New access profile"}
                  </span>

                  <h2>{editingRoleId ? editingRole?.name : "Create a role"}</h2>

                  <p>
                    {editingRoleId
                      ? "Update its name and available permissions."
                      : "Choose a name and the permissions this role should receive."}
                  </p>
                </div>
              </div>

              <Form onSubmit={(event) => void handleSubmit(event)}>
                <Form.Group className="mb-4" controlId="role-name">
                  <div className="admin-editor-label-row">
                    <Form.Label>Role name</Form.Label>

                    <small>{formData.name.length}/50</small>
                  </div>

                  <Form.Control
                    required
                    maxLength={50}
                    value={formData.name}
                    disabled={isSaving}
                    placeholder="For example: EDITOR"
                    onChange={(event) => updateRoleName(event.target.value)}
                  />

                  <Form.Text>
                    Role names are stored in uppercase by the backend.
                  </Form.Text>
                </Form.Group>

                <fieldset
                  className="admin-permission-fieldset"
                  disabled={isSaving}
                >
                  <div className="admin-permission-heading">
                    <div>
                      <legend>Permissions</legend>

                      <p>
                        {formData.permissionIds.length} of {permissions.length}{" "}
                        selected
                      </p>
                    </div>

                    {permissions.length > 0 && (
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={
                          allPermissionsSelected
                            ? clearPermissions
                            : selectAllPermissions
                        }
                      >
                        {allPermissionsSelected ? "Clear all" : "Select all"}
                      </Button>
                    )}
                  </div>

                  {permissions.length === 0 ? (
                    <Alert variant="warning">
                      No permissions are available.
                    </Alert>
                  ) : (
                    <div className="admin-permission-options">
                      {permissions.map((permission) => {
                        const isSelected = formData.permissionIds.includes(
                          permission.id,
                        );

                        return (
                          <label
                            key={permission.id}
                            htmlFor={`permission-${permission.id}`}
                            className={`admin-permission-option${
                              isSelected ? " selected" : ""
                            }`}
                          >
                            <Form.Check
                              id={`permission-${permission.id}`}
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => togglePermission(permission.id)}
                            />

                            <span className="admin-permission-icon">
                              <ShieldCheck />
                            </span>

                            <span>
                              <strong>
                                {formatPermissionName(permission.name)}
                              </strong>

                              <small>{permission.name}</small>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </fieldset>

                <div className="admin-role-form-actions">
                  <Button
                    type="submit"
                    disabled={isSaving || !formData.name.trim()}
                  >
                    {isSaving ? (
                      <>
                        <Spinner animation="border" size="sm" />
                        Saving…
                      </>
                    ) : editingRoleId ? (
                      <>
                        <Check2 />
                        Update role
                      </>
                    ) : (
                      <>
                        <Plus />
                        Create role
                      </>
                    )}
                  </Button>

                  {editingRoleId && (
                    <Button
                      type="button"
                      variant="outline-secondary"
                      disabled={isSaving}
                      onClick={resetForm}
                    >
                      <X />
                      Cancel editing
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={7}>
          <Card className="admin-role-list-card">
            <Card.Body>
              <div className="admin-role-list-heading">
                <div>
                  <span className="admin-panel-eyebrow">Existing roles</span>

                  <h2>Access profiles</h2>

                  <p>Review the permissions attached to each role.</p>
                </div>
              </div>

              {sortedRoles.length === 0 ? (
                <div className="admin-roles-empty">
                  <PersonBadge />

                  <strong>No roles have been created.</strong>

                  <p>Use the form to create the first access profile.</p>
                </div>
              ) : (
                <div className="admin-role-list">
                  {sortedRoles.map((role) => {
                    const isDeleting = deletingRoleId === role.id;

                    const isBeingEdited = editingRoleId === role.id;

                    const isCoreRole =
                      role.name === "ADMIN" || role.name === "USER";

                    return (
                      <article
                        key={role.id}
                        className={`admin-role-item${
                          isBeingEdited ? " editing" : ""
                        }`}
                      >
                        <div className="admin-role-item-header">
                          <div className="admin-role-identity">
                            <span>
                              <PersonBadge />
                            </span>

                            <div>
                              <div>
                                <h3>{role.name}</h3>

                                {isCoreRole && <Badge>Core role</Badge>}
                              </div>

                              <p>
                                {role.permissions.length}{" "}
                                {role.permissions.length === 1
                                  ? "permission"
                                  : "permissions"}
                              </p>
                            </div>
                          </div>

                          <div className="admin-role-actions">
                            <Button
                              type="button"
                              variant="link"
                              disabled={isDeleting || isSaving}
                              onClick={() => startEditing(role)}
                            >
                              <PencilSquare />
                              Edit
                            </Button>

                            <Button
                              type="button"
                              variant="link"
                              className="admin-role-delete"
                              disabled={isDeleting || isSaving}
                              onClick={() => void handleDelete(role)}
                            >
                              {isDeleting ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                <Trash />
                              )}

                              {isDeleting ? "Deleting" : "Delete"}
                            </Button>
                          </div>
                        </div>

                        {role.permissions.length > 0 ? (
                          <div className="admin-role-permissions">
                            {role.permissions.map((permission) => (
                              <Badge key={permission.id}>
                                {formatPermissionName(permission.name)}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="admin-role-no-permissions">
                            This role has no permissions.
                          </span>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
