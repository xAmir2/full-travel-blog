import { useEffect, useMemo, useState } from "react";

import { Alert, Badge, Button, Form, Image, Spinner } from "react-bootstrap";

import {
  ArrowRight,
  Eye,
  FileEarmarkPlus,
  FileText,
  PencilSquare,
  Search,
  Trash,
} from "react-bootstrap-icons";

import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import { deletePost, getAllPosts } from "../services/postService";

import { getApiErrorMessage } from "../services/apiErrors";

import type { Post, PostContentBlock } from "../types/models";
import { Confirmation } from "../components/Confirmation";

type StatusFilter = "ALL" | "PUBLISHED" | "DRAFT";

function getPostCover(contentBlocks: PostContentBlock[]): string | null {
  const imageBlock = contentBlocks.find((block) => block.type === "IMAGE");

  return imageBlock?.type === "IMAGE" ? imageBlock.content.url : null;
}

function formatPostDate(date: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function AdminPostsPage() {
  const { hasPermission } = useAuth();

  const canCreatePosts = hasPermission("POST_CREATE");
  const canUpdatePosts = hasPermission("POST_UPDATE");
  const canDeletePosts = hasPermission("POST_DELETE");

  const [posts, setPosts] = useState<Post[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const [isLoading, setIsLoading] = useState(true);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [postPendingDeletion, setPostPendingDeletion] = useState<Post | null>(
    null,
  );

  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
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
            getApiErrorMessage(loadError, "The posts could not be loaded."),
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
  }, []);

  // Filters the posts by status and search, then shows the latest updated first
  const filteredPosts = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    return posts
      .filter((post) => statusFilter === "ALL" || post.status === statusFilter)
      .filter((post) => {
        if (!normalizedSearchTerm) {
          return true;
        }

        return (
          post.title.toLowerCase().includes(normalizedSearchTerm) ||
          post.summary.toLowerCase().includes(normalizedSearchTerm) ||
          post.author.username.toLowerCase().includes(normalizedSearchTerm)
        );
      })
      .sort(
        (firstPost, secondPost) =>
          new Date(secondPost.updatedAt).getTime() -
          new Date(firstPost.updatedAt).getTime(),
      );
  }, [posts, searchTerm, statusFilter]);

  async function confirmPostDeletion() {
    const post = postPendingDeletion;

    if (!post) {
      return;
    }

    setDeletingPostId(post.id);
    setError(null);
    setMessage(null);

    try {
      await deletePost(post.id);

      setPosts((currentPosts) =>
        currentPosts.filter((currentPost) => currentPost.id !== post.id),
      );

      setMessage(`"${post.title}" was deleted.`);
    } catch (deleteError) {
      setError(
        getApiErrorMessage(deleteError, "The post could not be deleted."),
      );
    } finally {
      setDeletingPostId(null);
      setPostPendingDeletion(null);
    }
  }

  if (isLoading) {
    return (
      <div className="admin-posts-loading">
        <Spinner animation="border" role="status" />

        <p>Gathering your stories…</p>
      </div>
    );
  }

  return (
    <div className="admin-posts-page">
      <header className="admin-page-header">
        <div>
          <span className="admin-page-eyebrow">Content library</span>

          <h1>Posts</h1>

          <p>Review, edit and organise the stories in your journal.</p>
        </div>

        {canCreatePosts && (
          <Link
            to="/admin/posts/new"
            className="btn btn-primary admin-header-action"
          >
            <FileEarmarkPlus />
            New story
          </Link>
        )}
      </header>

      {message && (
        <Alert
          variant="success"
          className="admin-feedback-alert"
          dismissible
          onClose={() => setMessage(null)}
        >
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

      <section className="admin-posts-panel">
        <div className="admin-posts-toolbar">
          <div className="admin-search-field">
            <Search aria-hidden="true" />

            <Form.Control
              type="search"
              aria-label="Search posts"
              placeholder="Search title, summary or author…"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div
            className="admin-status-filter"
            role="group"
            aria-label="Filter posts by status"
          >
            {(["ALL", "PUBLISHED", "DRAFT"] as StatusFilter[]).map((status) => (
              <button
                key={status}
                type="button"
                className={statusFilter === status ? "active" : ""}
                aria-pressed={statusFilter === status}
                onClick={() => setStatusFilter(status)}
              >
                {status === "ALL"
                  ? "All"
                  : status === "PUBLISHED"
                    ? "Published"
                    : "Drafts"}
              </button>
            ))}
          </div>
        </div>

        <div className="admin-posts-results">
          <span>
            {filteredPosts.length}{" "}
            {filteredPosts.length === 1 ? "story" : "stories"}
          </span>

          {(searchTerm || statusFilter !== "ALL") && (
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("ALL");
              }}
            >
              Clear filters
            </Button>
          )}
        </div>

        {filteredPosts.length === 0 ? (
          <div className="admin-posts-empty">
            <FileText />

            <strong>
              {posts.length === 0
                ? "Your journal is empty."
                : "No stories match your search."}
            </strong>

            <p>
              {posts.length === 0
                ? "Create your first post and begin building your travel journal."
                : "Try changing the search term or selected status."}
            </p>

            {posts.length === 0 && canCreatePosts && (
              <Link to="/admin/posts/new" className="btn btn-primary btn-sm">
                Create your first story
              </Link>
            )}
          </div>
        ) : (
          <div className="admin-post-list">
            {filteredPosts.map((post) => {
              const coverImage = getPostCover(post.contentBlocks);
              const isDeleting = deletingPostId === post.id;

              return (
                <article key={post.id} className="admin-post-row">
                  <div className="admin-post-cover">
                    {coverImage ? (
                      <Image src={coverImage} alt="" />
                    ) : (
                      <div className="admin-post-cover-placeholder">
                        <FileText />
                      </div>
                    )}
                  </div>

                  <div className="admin-post-details">
                    <div className="admin-post-row-meta">
                      <Badge
                        className={`admin-status-badge ${
                          post.status === "PUBLISHED" ? "published" : "draft"
                        }`}
                      >
                        {post.status === "PUBLISHED" ? "Published" : "Draft"}
                      </Badge>

                      <span>Updated {formatPostDate(post.updatedAt)}</span>
                    </div>

                    <h2>{post.title}</h2>

                    <p>{post.summary}</p>

                    <div className="admin-post-author">
                      <span>
                        By <strong>@{post.author.username}</strong>
                      </span>

                      <span aria-hidden="true">·</span>

                      <span>
                        {post.contentBlocks.length}{" "}
                        {post.contentBlocks.length === 1 ? "block" : "blocks"}
                      </span>
                    </div>
                  </div>

                  <div className="admin-post-row-actions">
                    {post.status === "PUBLISHED" && (
                      <Link
                        to={`/posts/${post.slug}`}
                        className="admin-post-action"
                        aria-label={`View ${post.title}`}
                        title="View published story"
                      >
                        <Eye />
                        <span>View</span>
                      </Link>
                    )}

                    {canUpdatePosts && (
                      <Link
                        to={`/admin/posts/${post.id}/edit`}
                        className="admin-post-action"
                        aria-label={`Edit ${post.title}`}
                      >
                        <PencilSquare />
                        <span>Edit</span>
                      </Link>
                    )}

                    {canDeletePosts && (
                      <Button
                        type="button"
                        variant="link"
                        className="admin-post-action admin-post-delete"
                        disabled={isDeleting}
                        aria-label={`Delete ${post.title}`}
                        onClick={() => setPostPendingDeletion(post)}
                      >
                        {isDeleting ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          <Trash />
                        )}

                        <span>{isDeleting ? "Deleting" : "Delete"}</span>
                      </Button>
                    )}

                    {!canUpdatePosts &&
                      !canDeletePosts &&
                      post.status !== "PUBLISHED" && (
                        <span className="admin-post-no-actions">
                          No available actions
                        </span>
                      )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {filteredPosts.length > 0 && (
        <div className="admin-posts-footer">
          <Link to="/" className="admin-panel-link">
            View the public journal
            <ArrowRight />
          </Link>
        </div>
      )}
      <Confirmation
        show={postPendingDeletion !== null}
        title="Delete this post?"
        message={
          postPendingDeletion
            ? `"${postPendingDeletion.title}" and all its comments and content will be permanently removed.`
            : ""
        }
        confirmLabel="Delete post"
        warning="This action cannot be undone."
        destructive
        isConfirming={deletingPostId !== null}
        onCancel={() => {
          if (!deletingPostId) {
            setPostPendingDeletion(null);
          }
        }}
        onConfirm={() => void confirmPostDeletion()}
      />
    </div>
  );
}
