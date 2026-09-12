import { useState, type SubmitEvent } from "react";

import { Alert, Button, Col, Form, Row, Spinner } from "react-bootstrap";

import {
  ArrowRight,
  Compass,
  Eye,
  EyeSlash,
  JournalText,
} from "react-bootstrap-icons";

import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import type { SignupFormData } from "../types/models";

const emptyForm: SignupFormData = {
  name: "",
  surname: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export function SignupPage() {
  const { user, signup } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<SignupFormData>(emptyForm);

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  function updateField(field: keyof SignupFormData, value: string) {
    setFormData((currentFormData) => ({
      ...currentFormData,
      [field]: value,
    }));

    if (error) {
      setError(null);
    }
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedFormData: SignupFormData = {
      ...formData,
      name: formData.name.trim(),
      surname: formData.surname.trim(),
      username: formData.username.trim(),
      email: formData.email.trim(),
    };

    if (
      !normalizedFormData.name ||
      !normalizedFormData.surname ||
      !normalizedFormData.username ||
      !normalizedFormData.email
    ) {
      setError("Please complete all the required fields.");
      return;
    }

    if (normalizedFormData.username.length < 3) {
      setError("The username must contain at least 3 characters.");
      return;
    }

    if (normalizedFormData.password.length < 8) {
      setError("The password must contain at least 8 characters.");
      return;
    }

    if (normalizedFormData.password !== normalizedFormData.confirmPassword) {
      setError("The two passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await signup(normalizedFormData);

      navigate("/login", {
        replace: true,
        state: {
          registrationMessage:
            "Account created successfully. You can now log in.",
        },
      });
    } catch (signupError) {
      setError(
        signupError instanceof Error
          ? signupError.message
          : "The account could not be created.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const passwordsMatch =
    !formData.confirmPassword || formData.password === formData.confirmPassword;

  const formIsIncomplete =
    !formData.name.trim() ||
    !formData.surname.trim() ||
    !formData.username.trim() ||
    !formData.email.trim() ||
    !formData.password ||
    !formData.confirmPassword;

  return (
    <main className="auth-page auth-signup-page">
      <div className="container">
        <div className="auth-shell auth-signup-shell">
          <section className="auth-story-panel">
            <div className="auth-story-decoration auth-story-decoration-one" />
            <div className="auth-story-decoration auth-story-decoration-two" />

            <div className="auth-story-content">
              <Link to="/" className="auth-brand">
                <span className="auth-brand-icon">
                  <Compass />
                </span>

                <span>Explore & Share</span>
              </Link>

              <div className="auth-story-message">
                <span className="auth-eyebrow">Begin your journey</span>

                <h1>Every journey is better when shared.</h1>

                <p>
                  Create your account, discover new stories, share your thoughts
                  and join thoughtful conversations with fellow travellers
                </p>
              </div>

              <div className="auth-story-note">
                <JournalText />

                <span>
                  One account opens the door to inspiring stories, thoughtful
                  conversations and a community of fellow travellers.
                </span>
              </div>
            </div>
          </section>

          <section className="auth-form-panel">
            <div className="auth-form-container auth-signup-form">
              <header className="auth-form-heading">
                <span className="auth-eyebrow">Join the journal</span>

                <h2>Create your account</h2>

                <p>Tell us a little about yourself before you begin.</p>
              </header>

              {error && (
                <Alert variant="danger" className="auth-alert" role="alert">
                  {error}
                </Alert>
              )}

              <Form noValidate onSubmit={(event) => void handleSubmit(event)}>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group controlId="signup-name">
                      <Form.Label>First name</Form.Label>

                      <Form.Control
                        required
                        autoComplete="given-name"
                        maxLength={50}
                        placeholder="Your first name"
                        value={formData.name}
                        disabled={isSubmitting}
                        onChange={(event) =>
                          updateField("name", event.target.value)
                        }
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group controlId="signup-surname">
                      <Form.Label>Surname</Form.Label>

                      <Form.Control
                        required
                        autoComplete="family-name"
                        maxLength={50}
                        placeholder="Your surname"
                        value={formData.surname}
                        disabled={isSubmitting}
                        onChange={(event) =>
                          updateField("surname", event.target.value)
                        }
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group controlId="signup-username">
                      <Form.Label>Username</Form.Label>

                      <Form.Control
                        required
                        autoComplete="username"
                        minLength={3}
                        maxLength={50}
                        placeholder="Choose a username"
                        value={formData.username}
                        disabled={isSubmitting}
                        onChange={(event) =>
                          updateField("username", event.target.value)
                        }
                      />

                      <Form.Text>
                        This is how other travellers will recognise you.
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group controlId="signup-email">
                      <Form.Label>Email address</Form.Label>

                      <Form.Control
                        type="email"
                        autoComplete="email"
                        required
                        maxLength={100}
                        placeholder="traveller@example.com"
                        value={formData.email}
                        disabled={isSubmitting}
                        onChange={(event) =>
                          updateField("email", event.target.value)
                        }
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group controlId="signup-password">
                      <Form.Label>Password</Form.Label>

                      <div className="auth-password-field">
                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          minLength={8}
                          required
                          placeholder="At least 8 characters"
                          value={formData.password}
                          disabled={isSubmitting}
                          onChange={(event) =>
                            updateField("password", event.target.value)
                          }
                        />

                        <button
                          type="button"
                          className="auth-password-toggle"
                          aria-label={
                            showPassword ? "Hide passwords" : "Show passwords"
                          }
                          aria-pressed={showPassword}
                          disabled={isSubmitting}
                          onClick={() =>
                            setShowPassword((currentValue) => !currentValue)
                          }
                        >
                          {showPassword ? <EyeSlash /> : <Eye />}
                        </button>
                      </div>

                      <Form.Text>Use at least 8 characters.</Form.Text>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group controlId="signup-confirm-password">
                      <Form.Label>Confirm password</Form.Label>

                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        minLength={8}
                        required
                        isInvalid={!passwordsMatch}
                        placeholder="Repeat your password"
                        value={formData.confirmPassword}
                        disabled={isSubmitting}
                        onChange={(event) =>
                          updateField("confirmPassword", event.target.value)
                        }
                      />

                      <Form.Control.Feedback type="invalid">
                        The two passwords do not match.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Button
                  type="submit"
                  className="auth-submit-button mt-4 w-100"
                  disabled={isSubmitting || formIsIncomplete || !passwordsMatch}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Creating your account…
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowRight />
                    </>
                  )}
                </Button>
              </Form>

              <div className="auth-form-divider">
                <span>Already travelling with us?</span>
              </div>

              <Link to="/login" className="auth-secondary-action">
                Log in to your account
              </Link>

              <Link to="/" className="auth-home-link">
                Continue reading without an account
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
