import { useState, type SubmitEvent } from "react";

import { Alert, Button, Container, Form, Spinner } from "react-bootstrap";

import {
  ArrowRight,
  Compass,
  Eye,
  EyeSlash,
  JournalText,
} from "react-bootstrap-icons";

import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { user, login } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as {
    from?: string;
    registrationMessage?: string;
  } | null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setError(null);

    try {
      await login({
        email: email.trim(),
        password,
      });

      // Returns the user to the page they tried to access before logging in
      const destination = locationState?.from ?? "/";

      navigate(destination, {
        replace: true,
      });
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "The email or password is incorrect.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <Container>
        <div className="auth-shell">
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
                <span className="auth-eyebrow">Welcome back, traveller</span>

                <h1>Every journey has another chapter waiting.</h1>

                <p>
                  Sign in to follow new stories, share your thoughts and join
                  the conversation as each journey unfolds.
                </p>
              </div>

              <div className="auth-story-note">
                <JournalText />

                <span>
                  A quiet corner for thoughtful stories and memorable journeys.
                </span>
              </div>
            </div>
          </section>

          <section className="auth-form-panel">
            <div className="auth-form-container">
              <header className="auth-form-heading">
                <span className="auth-eyebrow">Your account</span>

                <h2>Welcome back</h2>

                <p>Enter your details to continue your journey.</p>
              </header>
              {locationState?.registrationMessage && (
                <Alert variant="success" className="auth-alert">
                  {locationState.registrationMessage}
                </Alert>
              )}
              {error && (
                <Alert variant="danger" className="auth-alert" role="alert">
                  {error}
                </Alert>
              )}

              <Form onSubmit={(event) => void handleSubmit(event)} noValidate>
                <Form.Group className="mb-3" controlId="login-email">
                  <Form.Label>Email address</Form.Label>

                  <Form.Control
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="traveller@example.com"
                    value={email}
                    disabled={isSubmitting}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="login-password">
                  <div className="auth-label-row">
                    <Form.Label>Password</Form.Label>
                  </div>

                  <div className="auth-password-field">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      placeholder="Enter your password"
                      value={password}
                      disabled={isSubmitting}
                      onChange={(event) => setPassword(event.target.value)}
                    />

                    <button
                      type="button"
                      className="auth-password-toggle"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
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
                </Form.Group>

                <Button
                  type="submit"
                  className="auth-submit-button w-100"
                  disabled={isSubmitting || !email.trim() || !password}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Logging in…
                    </>
                  ) : (
                    <>
                      Log in
                      <ArrowRight />
                    </>
                  )}
                </Button>
              </Form>

              <div className="auth-form-divider">
                <span>New to the journal?</span>
              </div>

              <p className="auth-switch-message">
                Create an account and start sharing your own travel stories.
              </p>

              <Link to="/signup" className="auth-secondary-action">
                Create an account
              </Link>

              <Link to="/" className="auth-home-link">
                Continue reading without logging in
              </Link>
            </div>
          </section>
        </div>
      </Container>
    </main>
  );
}
