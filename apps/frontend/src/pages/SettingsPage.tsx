import { useState, type SubmitEvent } from "react";

import {
  Alert,
  Button,
  Col,
  Container,
  Form,
  Image,
  Row,
  Spinner,
} from "react-bootstrap";

import {
  Envelope,
  Image as ImageIcon,
  Key,
  Person,
  ShieldCheck,
} from "react-bootstrap-icons";

import { Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useConfirmation } from "../context/ConfirmationContext";

import { getApiErrorMessage } from "../services/apiErrors";

import {
  updateMyAvatar,
  updateMyData,
  updateMyPassword,
} from "../services/userService";

import type { PasswordUpdateForm, ProfileDataForm } from "../types/models";

type SettingsSection = "personal" | "avatar" | "password";

const emptyPasswordForm: PasswordUpdateForm = {
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
};

export function SettingsPage() {
  const { user, refreshUser, deleteAccount } = useAuth();
  const { requestConfirmation } = useConfirmation();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] =
    useState<SettingsSection>("personal");

  const [profileData, setProfileData] = useState<ProfileDataForm>({
    name: user?.name ?? "",
    surname: user?.surname ?? "",
    username: user?.username ?? "",
    email: user?.email ?? "",
  });

  const [passwordData, setPasswordData] =
    useState<PasswordUpdateForm>(emptyPasswordForm);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [deletePassword, setDeletePassword] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(
    null,
  );

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const displayedAvatar = avatarPreview ?? user.avatarUrl;

  const initials =
    (user.name.charAt(0) + user.surname.charAt(0)).toUpperCase() ||
    user.username.charAt(0).toUpperCase() ||
    "U";

  function selectSection(section: SettingsSection) {
    setActiveSection(section);
    setError(null);
    setMessage(null);
  }

  function updateProfileField(field: keyof ProfileDataForm, value: string) {
    setProfileData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updatePasswordField(field: keyof PasswordUpdateForm, value: string) {
    setPasswordData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleAvatarSelection(input: HTMLInputElement) {
    const file = input.files?.[0] ?? null;

    input.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    const maximumSize = 5 * 1024 * 1024;

    if (file.size > maximumSize) {
      setError("The avatar must be smaller than 5 MB.");
      return;
    }

    setError(null);
    setMessage(null);
    setAvatarFile(file);

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarPreview(reader.result);
      }
    };

    reader.onerror = () => {
      setAvatarPreview(null);
      setError("The avatar preview could not be loaded.");
    };

    reader.readAsDataURL(file);
  }

  async function handleProfileSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const confirmed = await requestConfirmation({
      title: "Save profile changes?",
      message: "Your personal information will be updated.",
      confirmLabel: "Save changes",
    });

    if (!confirmed) {
      return;
    }

    setIsSavingProfile(true);
    setError(null);
    setMessage(null);

    try {
      await updateMyData(profileData);

      // Reloads the user so the updated data is shown across the app
      await refreshUser();

      setMessage("Your personal information was updated.");
    } catch (updateError) {
      setError(
        getApiErrorMessage(updateError, "Your profile could not be updated."),
      );
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setError("The new passwords do not match.");
      return;
    }

    const confirmed = await requestConfirmation({
      title: "Change your password?",
      message:
        "Your account password will be replaced. You will need to use the new password the next time you log in.",
      confirmLabel: "Update password",
    });

    if (!confirmed) {
      return;
    }

    setIsSavingPassword(true);
    setError(null);
    setMessage(null);

    try {
      await updateMyPassword(passwordData);

      setPasswordData(emptyPasswordForm);

      setMessage("Your password was updated successfully.");
    } catch (updateError) {
      setError(
        getApiErrorMessage(updateError, "Your password could not be updated."),
      );
    } finally {
      setIsSavingPassword(false);
    }
  }

  async function handleAvatarSubmit() {
    if (!avatarFile) {
      setError("Select an avatar first.");
      return;
    }

    const confirmed = await requestConfirmation({
      title: "Update profile picture?",
      message: `Your current profile picture will be replaced with "${avatarFile.name}".`,
      confirmLabel: "Update picture",
    });

    if (!confirmed) {
      return;
    }

    setIsSavingAvatar(true);
    setError(null);
    setMessage(null);

    try {
      await updateMyAvatar(avatarFile);
      await refreshUser();

      setAvatarFile(null);
      setAvatarPreview(null);

      setMessage("Your avatar was updated.");
    } catch (uploadError) {
      setError(
        getApiErrorMessage(uploadError, "Your avatar could not be uploaded."),
      );
    } finally {
      setIsSavingAvatar(false);
    }
  }

  async function handleDeleteAccount() {
    if (!deletePassword.trim() || isDeletingAccount) {
      return;
    }

    const confirmed = await requestConfirmation({
      title: "Delete your account?",
      message:
        "Your account will be permanently deleted along with your associated data.",
      confirmLabel: "Delete account",
      warning: "This action cannot be undone.",
      destructive: true,
    });

    if (!confirmed) {
      return;
    }

    setIsDeletingAccount(true);
    setDeleteAccountError(null);

    try {
      await deleteAccount(deletePassword);

      navigate("/", {
        replace: true,
      });
    } catch (deleteError) {
      setDeleteAccountError(
        getApiErrorMessage(deleteError, "Your account could not be deleted."),
      );
    } finally {
      setIsDeletingAccount(false);
    }
  }

  return (
    <div className="settings-page">
      <Container>
        <header className="settings-heading">
          <span className="settings-eyebrow">Your account</span>

          <h1>Profile settings</h1>

          <p>Keep your details comfortable, current and uniquely yours.</p>
        </header>

        <Row className="g-4 align-items-start">
          <Col lg={4} xl={3}>
            <aside className="settings-sidebar">
              <div className="settings-user-summary">
                {displayedAvatar ? (
                  <Image
                    src={displayedAvatar}
                    alt={`${user.username}'s profile`}
                    className="settings-avatar"
                    roundedCircle
                  />
                ) : (
                  <div className="settings-avatar settings-avatar-placeholder">
                    {initials}
                  </div>
                )}

                <h2>
                  {user.name} {user.surname}
                </h2>

                <p className="settings-username">@{user.username}</p>

                <div className="settings-user-detail">
                  <Envelope />
                  <span>{user.email}</span>
                </div>

                <div className="settings-role">
                  <ShieldCheck />
                  <span>{user.role.name}</span>
                </div>
              </div>

              <nav
                className="settings-navigation"
                aria-label="Settings sections"
              >
                <button
                  type="button"
                  className={
                    activeSection === "personal"
                      ? "settings-nav-button active"
                      : "settings-nav-button"
                  }
                  aria-pressed={activeSection === "personal"}
                  onClick={() => selectSection("personal")}
                >
                  <Person />
                  <span>Personal information</span>
                </button>

                <button
                  type="button"
                  className={
                    activeSection === "avatar"
                      ? "settings-nav-button active"
                      : "settings-nav-button"
                  }
                  aria-pressed={activeSection === "avatar"}
                  onClick={() => selectSection("avatar")}
                >
                  <ImageIcon />
                  <span>Profile picture</span>
                </button>

                <button
                  type="button"
                  className={
                    activeSection === "password"
                      ? "settings-nav-button active"
                      : "settings-nav-button"
                  }
                  aria-pressed={activeSection === "password"}
                  onClick={() => selectSection("password")}
                >
                  <Key />
                  <span>Password</span>
                </button>
              </nav>
            </aside>
          </Col>

          <Col lg={8} xl={9}>
            <main className="settings-panel">
              {error && <Alert variant="danger">{error}</Alert>}

              {message && <Alert variant="success">{message}</Alert>}

              {activeSection === "personal" && (
                <section>
                  <div className="settings-panel-heading">
                    <div className="settings-panel-icon">
                      <Person />
                    </div>

                    <div>
                      <h2>Personal information</h2>

                      <p>
                        Update the details other travellers see on your profile.
                      </p>
                    </div>
                  </div>

                  <Form onSubmit={(event) => void handleProfileSubmit(event)}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3" controlId="settings-name">
                          <Form.Label>Name</Form.Label>

                          <Form.Control
                            required
                            value={profileData.name}
                            disabled={isSavingProfile}
                            onChange={(event) =>
                              updateProfileField("name", event.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group
                          className="mb-3"
                          controlId="settings-surname"
                        >
                          <Form.Label>Surname</Form.Label>

                          <Form.Control
                            required
                            value={profileData.surname}
                            disabled={isSavingProfile}
                            onChange={(event) =>
                              updateProfileField("surname", event.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3" controlId="settings-username">
                      <Form.Label>Username</Form.Label>

                      <Form.Control
                        required
                        minLength={3}
                        maxLength={50}
                        value={profileData.username}
                        disabled={isSavingProfile}
                        onChange={(event) =>
                          updateProfileField("username", event.target.value)
                        }
                      />
                    </Form.Group>

                    <Form.Group className="mb-4" controlId="settings-email">
                      <Form.Label>Email</Form.Label>

                      <Form.Control
                        type="email"
                        required
                        value={profileData.email}
                        disabled={isSavingProfile}
                        onChange={(event) =>
                          updateProfileField("email", event.target.value)
                        }
                      />
                    </Form.Group>

                    <Button type="submit" disabled={isSavingProfile}>
                      {isSavingProfile ? "Saving…" : "Save changes"}
                    </Button>
                  </Form>
                </section>
              )}

              {activeSection === "avatar" && (
                <section>
                  <div className="settings-panel-heading">
                    <div className="settings-panel-icon">
                      <ImageIcon />
                    </div>

                    <div>
                      <h2>Profile picture</h2>
                      <p>Choose an image that feels like you.</p>
                    </div>
                  </div>

                  <div className="settings-avatar-editor">
                    {displayedAvatar ? (
                      <Image
                        src={displayedAvatar}
                        alt="Avatar preview"
                        className="settings-avatar settings-avatar-large"
                        roundedCircle
                      />
                    ) : (
                      <div className="settings-avatar settings-avatar-large settings-avatar-placeholder">
                        {initials}
                      </div>
                    )}

                    <div className="flex-grow-1">
                      <Form.Group controlId="profile-avatar">
                        <Form.Label>Select a new image</Form.Label>

                        <Form.Control
                          type="file"
                          accept="image/*"
                          disabled={isSavingAvatar}
                          onChange={(event) =>
                            handleAvatarSelection(
                              event.currentTarget as HTMLInputElement,
                            )
                          }
                        />

                        <Form.Text>JPG, PNG or WEBP, up to 5 MB.</Form.Text>
                      </Form.Group>

                      {avatarFile && (
                        <p className="settings-selected-file">
                          Selected: {avatarFile.name}
                        </p>
                      )}

                      <Button
                        type="button"
                        className="mt-3"
                        disabled={!avatarFile || isSavingAvatar}
                        onClick={() => void handleAvatarSubmit()}
                      >
                        {isSavingAvatar ? (
                          <>
                            <Spinner
                              animation="border"
                              size="sm"
                              className="me-2"
                            />
                            Uploading…
                          </>
                        ) : (
                          "Update picture"
                        )}
                      </Button>
                    </div>
                  </div>
                </section>
              )}

              {activeSection === "password" && (
                <section>
                  <div className="settings-panel-heading">
                    <div className="settings-panel-icon">
                      <Key />
                    </div>

                    <div>
                      <h2>Change password</h2>
                      <p>Use a strong password you do not use elsewhere.</p>
                    </div>
                  </div>

                  <Form onSubmit={(event) => void handlePasswordSubmit(event)}>
                    <Form.Group className="mb-3" controlId="current-password">
                      <Form.Label>Current password</Form.Label>

                      <Form.Control
                        type="password"
                        autoComplete="current-password"
                        required
                        value={passwordData.currentPassword}
                        disabled={isSavingPassword}
                        onChange={(event) =>
                          updatePasswordField(
                            "currentPassword",
                            event.target.value,
                          )
                        }
                      />
                    </Form.Group>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3" controlId="new-password">
                          <Form.Label>New password</Form.Label>

                          <Form.Control
                            type="password"
                            autoComplete="new-password"
                            required
                            minLength={8}
                            value={passwordData.newPassword}
                            disabled={isSavingPassword}
                            onChange={(event) =>
                              updatePasswordField(
                                "newPassword",
                                event.target.value,
                              )
                            }
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group
                          className="mb-4"
                          controlId="confirm-password"
                        >
                          <Form.Label>Confirm password</Form.Label>

                          <Form.Control
                            type="password"
                            autoComplete="new-password"
                            required
                            minLength={8}
                            value={passwordData.confirmNewPassword}
                            disabled={isSavingPassword}
                            onChange={(event) =>
                              updatePasswordField(
                                "confirmNewPassword",
                                event.target.value,
                              )
                            }
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Button type="submit" disabled={isSavingPassword}>
                      {isSavingPassword ? "Updating…" : "Update password"}
                    </Button>
                  </Form>
                </section>
              )}

              <section className="settings-danger-zone">
                <div className="settings-danger-zone-header">
                  <span className="cozy-eyebrow">Danger zone</span>

                  <h2>Delete account</h2>

                  <p>
                    Permanently remove your account and associated activity from
                    Explore & Share.
                  </p>
                </div>

                {deleteAccountError && (
                  <Alert variant="danger">{deleteAccountError}</Alert>
                )}

                <Form.Group controlId="delete-account-password">
                  <Form.Label>Current password</Form.Label>

                  <Form.Control
                    type="password"
                    value={deletePassword}
                    autoComplete="current-password"
                    placeholder="Enter your current password"
                    disabled={isDeletingAccount}
                    onChange={(event) => setDeletePassword(event.target.value)}
                  />

                  <Form.Text className="text-secondary">
                    Your current password is required before the account can be
                    deleted.
                  </Form.Text>
                </Form.Group>

                <Button
                  type="button"
                  variant="danger"
                  className="mt-3"
                  disabled={!deletePassword.trim() || isDeletingAccount}
                  onClick={() => void handleDeleteAccount()}
                >
                  {isDeletingAccount ? "Deleting account…" : "Delete account"}
                </Button>
              </section>
            </main>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
