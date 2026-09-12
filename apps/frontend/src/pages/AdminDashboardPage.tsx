import { useEffect, useMemo, useState } from "react";

import { Alert, Badge, Card, Col, Row, Spinner } from "react-bootstrap";

import {
  ArrowRight,
  Eye,
  FileEarmarkPlus,
  FileText,
  JournalCheck,
  JournalText,
  People,
  PersonBadge,
  PencilSquare,
} from "react-bootstrap-icons";

import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { getAllPosts } from "../services/postService";
import { getApiErrorMessage } from "../services/apiErrors";

import type { Post } from "../types/models";

function formatDashboardDate(date: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function AdminDashboardPage() {
  const { user, hasPermission } = useAuth();

  const canReadPosts = hasPermission("POST_READ");
  const canCreatePosts = hasPermission("POST_CREATE");
  const canUpdatePosts = hasPermission("POST_UPDATE");
  const canManageUsers = hasPermission("USER_MANAGE");
  const canManageSiteContent = hasPermission("SITE_CONTENT_MANAGE");

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(canReadPosts);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canReadPosts) {
      return;
    }

    let isActive = true;

    async function loadPosts() {
      try {
        const allPosts = await getAllPosts();

        if (isActive) {
          setPosts(allPosts);
        }
      } catch (loadError) {
        if (isActive) {
          setError(
            getApiErrorMessage(
              loadError,
              "The dashboard data could not be loaded.",
            ),
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadPosts();

    return () => {
      isActive = false;
    };
  }, [canReadPosts]);

  const publishedCount = posts.filter(
    (post) => post.status === "PUBLISHED",
  ).length;

  const draftCount = posts.filter((post) => post.status === "DRAFT").length;

  const publicationPercentage =
    posts.length > 0 ? Math.round((publishedCount / posts.length) * 100) : 0;

  // Sorts the posts by latest update and keeps the first five
  const recentPosts = useMemo(
    () =>
      [...posts]
        .sort(
          (firstPost, secondPost) =>
            new Date(secondPost.updatedAt).getTime() -
            new Date(firstPost.updatedAt).getTime(),
        )
        .slice(0, 5),
    [posts],
  );

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard-header">
        <div>
          <span className="admin-page-eyebrow">Story workspace</span>

          <h1>
            Welcome back
            {user?.name ? `, ${user.name}` : ""}.
          </h1>

          <p>Here is what is happening across your travel journal today.</p>
        </div>

        {canCreatePosts && (
          <Link
            to="/admin/posts/new"
            className="btn btn-primary admin-header-action"
          >
            <FileEarmarkPlus />
            Write a new story
          </Link>
        )}
      </header>

      {error && (
        <Alert variant="danger" className="admin-dashboard-alert">
          {error}
        </Alert>
      )}

      {isLoading ? (
        <div className="admin-dashboard-loading">
          <Spinner animation="border" role="status" />

          <p>Preparing your workspace…</p>
        </div>
      ) : (
        <>
          {canReadPosts && !error && (
            <Row xs={1} md={2} xl={4} className="g-3">
              <Col>
                <Card className="admin-stat-card">
                  <Card.Body>
                    <div className="admin-stat-card-header">
                      <span className="admin-stat-icon admin-stat-total">
                        <FileText />
                      </span>

                      <span className="admin-stat-label">All stories</span>
                    </div>

                    <strong className="admin-stat-value">{posts.length}</strong>

                    <p>Stories currently in your workspace.</p>
                  </Card.Body>
                </Card>
              </Col>

              <Col>
                <Card className="admin-stat-card">
                  <Card.Body>
                    <div className="admin-stat-card-header">
                      <span className="admin-stat-icon admin-stat-published">
                        <JournalCheck />
                      </span>

                      <span className="admin-stat-label">Published</span>
                    </div>

                    <strong className="admin-stat-value">
                      {publishedCount}
                    </strong>

                    <p>Stories visible to your readers.</p>
                  </Card.Body>
                </Card>
              </Col>

              <Col>
                <Card className="admin-stat-card">
                  <Card.Body>
                    <div className="admin-stat-card-header">
                      <span className="admin-stat-icon admin-stat-draft">
                        <PencilSquare />
                      </span>

                      <span className="admin-stat-label">Drafts</span>
                    </div>

                    <strong className="admin-stat-value">{draftCount}</strong>

                    <p>Stories still being prepared.</p>
                  </Card.Body>
                </Card>
              </Col>

              <Col>
                <Card className="admin-stat-card">
                  <Card.Body>
                    <div className="admin-stat-card-header">
                      <span className="admin-stat-icon admin-stat-progress">
                        <Eye />
                      </span>

                      <span className="admin-stat-label">Publication rate</span>
                    </div>

                    <strong className="admin-stat-value">
                      {publicationPercentage}%
                    </strong>

                    <div
                      className="admin-publication-progress"
                      aria-label={`${publicationPercentage}% of posts are published`}
                    >
                      <span
                        style={{
                          width: `${publicationPercentage}%`,
                        }}
                      />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          <Row className="admin-dashboard-content g-4">
            {canReadPosts && !error && (
              <Col xl={8}>
                <Card className="admin-dashboard-panel h-100">
                  <Card.Body>
                    <div className="admin-panel-heading">
                      <div>
                        <span className="admin-panel-eyebrow">
                          Recently updated
                        </span>

                        <h2>Your latest stories</h2>

                        <p>Continue working from where you left off.</p>
                      </div>

                      <Link to="/admin/posts" className="admin-panel-link">
                        View all
                        <ArrowRight />
                      </Link>
                    </div>

                    {recentPosts.length === 0 ? (
                      <div className="admin-dashboard-empty">
                        <FileText />

                        <strong>Your journal is ready.</strong>

                        <p>
                          Create your first story and begin filling this space.
                        </p>

                        {canCreatePosts && (
                          <Link
                            to="/admin/posts/new"
                            className="btn btn-primary btn-sm"
                          >
                            Create your first post
                          </Link>
                        )}
                      </div>
                    ) : (
                      <div className="admin-recent-posts">
                        {recentPosts.map((post) => (
                          <article key={post.id} className="admin-recent-post">
                            <div className="admin-recent-post-copy">
                              <div className="admin-recent-post-meta">
                                <Badge
                                  className={`admin-status-badge ${
                                    post.status === "PUBLISHED"
                                      ? "published"
                                      : "draft"
                                  }`}
                                >
                                  {post.status === "PUBLISHED"
                                    ? "Published"
                                    : "Draft"}
                                </Badge>

                                <span>
                                  Updated {formatDashboardDate(post.updatedAt)}
                                </span>
                              </div>

                              <h3>{post.title}</h3>

                              <p>{post.summary}</p>
                            </div>

                            <div className="admin-recent-post-actions">
                              {post.status === "PUBLISHED" && (
                                <Link
                                  to={`/posts/${post.slug}`}
                                  className="admin-icon-action"
                                  aria-label={`View ${post.title}`}
                                  title="View published post"
                                >
                                  <Eye />
                                </Link>
                              )}

                              {canUpdatePosts && (
                                <Link
                                  to={`/admin/posts/${post.id}/edit`}
                                  className="admin-icon-action"
                                  aria-label={`Edit ${post.title}`}
                                  title="Edit post"
                                >
                                  <PencilSquare />
                                </Link>
                              )}
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            )}

            <Col xl={canReadPosts ? 4 : 12}>
              <Card className="admin-dashboard-panel h-100">
                <Card.Body>
                  <div className="admin-panel-heading">
                    <div>
                      <span className="admin-panel-eyebrow">Quick access</span>

                      <h2>Management tools</h2>

                      <p>Jump directly to your available tools.</p>
                    </div>
                  </div>

                  <div className="admin-quick-actions">
                    {canCreatePosts && (
                      <Link
                        to="/admin/posts/new"
                        className="admin-quick-action"
                      >
                        <span>
                          <FileEarmarkPlus />
                        </span>

                        <div>
                          <strong>New story</strong>
                          <small>Start writing a new travel post.</small>
                        </div>

                        <ArrowRight />
                      </Link>
                    )}

                    {canReadPosts && (
                      <Link to="/admin/posts" className="admin-quick-action">
                        <span>
                          <FileText />
                        </span>

                        <div>
                          <strong>Manage posts</strong>
                          <small>Review your drafts and published work.</small>
                        </div>

                        <ArrowRight />
                      </Link>
                    )}

                    {canManageSiteContent && (
                      <Link
                        to="/admin/page-heroes"
                        className="admin-quick-action"
                      >
                        <span>
                          <JournalText />
                        </span>

                        <div>
                          <strong>Page heroes</strong>
                          <small>Manage hero content across the site.</small>
                        </div>

                        <ArrowRight />
                      </Link>
                    )}

                    {canManageUsers && (
                      <>
                        <Link to="/admin/users" className="admin-quick-action">
                          <span>
                            <People />
                          </span>

                          <div>
                            <strong>Manage users</strong>
                            <small>Review accounts and assign roles.</small>
                          </div>

                          <ArrowRight />
                        </Link>

                        <Link to="/admin/roles" className="admin-quick-action">
                          <span>
                            <PersonBadge />
                          </span>

                          <div>
                            <strong>Roles and permissions</strong>
                            <small>Control access across the workspace.</small>
                          </div>

                          <ArrowRight />
                        </Link>
                      </>
                    )}

                    {!canReadPosts &&
                      !canCreatePosts &&
                      !canManageUsers &&
                      !canManageSiteContent && (
                        <Alert variant="info" className="mb-0">
                          Your account currently has no management tools
                          assigned to it.
                        </Alert>
                      )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}
