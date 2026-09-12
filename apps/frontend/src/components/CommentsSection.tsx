import { useEffect, useState, type SyntheticEvent } from "react";

import { Alert, Button, Card, Form, Image, Spinner } from "react-bootstrap";

import {
  ChatLeftText,
  Check2,
  ChevronDown,
  ChevronUp,
  Pencil,
  Reply,
  Send,
  ShieldCheck,
  Trash,
  X,
} from "react-bootstrap-icons";

import { Link, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
  createComment,
  deleteComment,
  getCommentsForPost,
  updateComment,
} from "../services/commentService";

import { getApiErrorMessage } from "../services/apiErrors";
import { reactToComment } from "../services/reactionService";

import type {
  Comment,
  ReactionSummary,
  RichTextContent,
} from "../types/models";

import { Confirmation } from "./Confirmation";
import { ReactionButtons } from "./ReactionButtons";
import { RichTextEditor } from "./rich-text/RichTextEditor";
import { RichTextViewer } from "./rich-text/RichTextViewer";

interface CommentsSectionProps {
  postId: string;
}

const repliesPerStep = 3;

function getInitials(name: string, surname: string, username: string): string {
  const initials = `${name.charAt(0)}${surname.charAt(0)}`.trim();

  return (initials || username.charAt(0) || "U").toUpperCase();
}

// Updates either a main comment or one of its replies
function replaceCommentInTree(
  comments: Comment[],
  updatedComment: Comment,
): Comment[] {
  return comments.map((comment) => {
    if (comment.id === updatedComment.id) {
      return updatedComment;
    }

    return {
      ...comment,
      replies: comment.replies.map((reply) =>
        reply.id === updatedComment.id ? updatedComment : reply,
      ),
    };
  });
}

// Removes the comment from the main comments or replies
function removeCommentFromTree(
  comments: Comment[],
  commentId: string,
): Comment[] {
  return comments
    .filter((comment) => comment.id !== commentId)
    .map((comment) => ({
      ...comment,
      replies: comment.replies.filter((reply) => reply.id !== commentId),
    }));
}

function updateReactionsInTree(
  comments: Comment[],
  commentId: string,
  reactions: ReactionSummary,
): Comment[] {
  return comments.map((comment) => {
    if (comment.id === commentId) {
      return {
        ...comment,
        reactions,
      };
    }

    return {
      ...comment,
      replies: comment.replies.map((reply) =>
        reply.id === commentId
          ? {
              ...reply,
              reactions,
            }
          : reply,
      ),
    };
  });
}

export function CommentsSection({ postId }: CommentsSectionProps) {
  const { user, hasPermission } = useAuth();
  const location = useLocation();

  const [comments, setComments] = useState<Comment[]>([]);

  const [content, setContent] = useState<RichTextContent>({
    editorState: "",
    plainText: "",
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const [editingContent, setEditingContent] = useState<RichTextContent>({
    editorState: "",
    plainText: "",
  });
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);

  const [replyContent, setReplyContent] = useState<RichTextContent>({
    editorState: "",
    plainText: "",
  });

  const [visibleReplyCounts, setVisibleReplyCounts] = useState<
    Record<string, number>
  >({});

  const [isLoading, setIsLoading] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null,
  );

  const [commentPendingDeletion, setCommentPendingDeletion] =
    useState<Comment | null>(null);

  const [error, setError] = useState<string | null>(null);

  const canModerate = hasPermission("COMMENT_MODERATE");

  const totalCommentCount = comments.reduce(
    (total, comment) => total + 1 + comment.replies.length,
    0,
  );

  useEffect(() => {
    let isActive = true;

    async function loadComments() {
      setIsLoading(true);
      setError(null);

      try {
        const postComments = await getCommentsForPost(postId);

        if (isActive) {
          setComments(postComments);
          setVisibleReplyCounts({});
        }
      } catch (loadError) {
        if (isActive) {
          setError(
            getApiErrorMessage(loadError, "The comments could not be loaded."),
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadComments();

    return () => {
      isActive = false;
    };
  }, [postId]);

  function showReplies(commentId: string) {
    setVisibleReplyCounts((currentCounts) => ({
      ...currentCounts,
      [commentId]: repliesPerStep,
    }));
  }

  function loadMoreReplies(commentId: string) {
    setVisibleReplyCounts((currentCounts) => ({
      ...currentCounts,
      [commentId]:
        (currentCounts[commentId] ?? repliesPerStep) + repliesPerStep,
    }));
  }

  function hideReplies(commentId: string) {
    setVisibleReplyCounts((currentCounts) => ({
      ...currentCounts,
      [commentId]: 0,
    }));
  }

  async function handleCreate(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedContent = content.plainText.trim();

    if (!user || !trimmedContent || trimmedContent.length > 1000) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const newComment = await createComment(postId, {
        content: trimmedContent,
        editorState: content.editorState,
      });

      // Adds the new reply to its parent comment
      setComments((currentComments) => [newComment, ...currentComments]);

      setContent({
        editorState: "",
        plainText: "",
      });
    } catch (createError) {
      setError(
        getApiErrorMessage(createError, "Your comment could not be published."),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function startEditing(comment: Comment) {
    setReplyingTo(null);

    setReplyContent({
      editorState: "",
      plainText: "",
    });

    setEditingId(comment.id);

    setEditingContent({
      editorState: comment.editorState ?? "",
      plainText: comment.content,
    });

    setError(null);
  }

  function cancelEditing() {
    setEditingId(null);

    setEditingContent({
      editorState: "",
      plainText: "",
    });
  }

  async function handleUpdate(commentId: string) {
    const trimmedContent = editingContent.plainText.trim();

    if (!user || !trimmedContent || trimmedContent.length > 1000) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const updatedComment = await updateComment(commentId, {
        content: trimmedContent,
        editorState: editingContent.editorState,
      });

      setComments((currentComments) =>
        replaceCommentInTree(currentComments, updatedComment),
      );

      cancelEditing();
    } catch (updateError) {
      setError(
        getApiErrorMessage(updateError, "The comment could not be updated."),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function startReplying(comment: Comment) {
    setEditingId(null);
    setEditingContent({
      editorState: "",
      plainText: "",
    });
    setReplyingTo(comment);
    setReplyContent({
      editorState: "",
      plainText: "",
    });
    setError(null);
  }

  function cancelReplying() {
    setReplyingTo(null);

    setReplyContent({
      editorState: "",
      plainText: "",
    });
  }

  async function handleReply(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    const parentComment = replyingTo;
    const trimmedContent = replyContent.plainText.trim();

    if (
      !user ||
      !parentComment ||
      !trimmedContent ||
      trimmedContent.length > 1000
    ) {
      return;
    }

    setIsSubmittingReply(true);
    setError(null);

    try {
      const newReply = await createComment(
        postId,
        {
          content: trimmedContent,
          editorState: replyContent.editorState,
        },
        parentComment.id,
      );

      setComments((currentComments) =>
        currentComments.map((comment) =>
          comment.id === parentComment.id
            ? {
                ...comment,
                replies: [...comment.replies, newReply],
              }
            : comment,
        ),
      );

      setVisibleReplyCounts((currentCounts) => ({
        ...currentCounts,
        [parentComment.id]: Math.max(
          currentCounts[parentComment.id] ?? 0,
          repliesPerStep,
        ),
      }));

      cancelReplying();
    } catch (replyError) {
      setError(
        getApiErrorMessage(replyError, "Your reply could not be published."),
      );
    } finally {
      setIsSubmittingReply(false);
    }
  }

  async function confirmCommentDeletion() {
    const comment = commentPendingDeletion;

    if (!user || !comment) {
      return;
    }

    setDeletingCommentId(comment.id);
    setError(null);

    try {
      await deleteComment(comment.id);

      setComments((currentComments) =>
        removeCommentFromTree(currentComments, comment.id),
      );

      if (editingId === comment.id) {
        cancelEditing();
      }

      if (replyingTo?.id === comment.id) {
        cancelReplying();
      }

      if (!comment.parentCommentId) {
        setVisibleReplyCounts((currentCounts) => {
          const updatedCounts = {
            ...currentCounts,
          };

          delete updatedCounts[comment.id];

          return updatedCounts;
        });
      }
    } catch (deleteError) {
      setError(
        getApiErrorMessage(deleteError, "The comment could not be deleted."),
      );
    } finally {
      setDeletingCommentId(null);
      setCommentPendingDeletion(null);
    }
  }

  function updateCommentReactions(
    commentId: string,
    reactions: ReactionSummary,
  ) {
    setComments((currentComments) =>
      updateReactionsInTree(currentComments, commentId, reactions),
    );
  }

  function renderComment(comment: Comment, isReply = false) {
    const isOwner = user?.id === comment.author.id;

    const canDelete = isOwner || canModerate;

    const isEditing = editingId === comment.id;

    const isDeleting = deletingCommentId === comment.id;

    const wasEdited = comment.updatedAt !== comment.createdAt;

    const visibleReplyCount = visibleReplyCounts[comment.id] ?? 0;

    const repliesAreVisible = visibleReplyCount > 0;

    // Shows the latest replies based on the current visible amount
    const displayedReplies = repliesAreVisible
      ? comment.replies.slice(
          -Math.min(visibleReplyCount, comment.replies.length),
        )
      : [];

    const hasMoreReplies = visibleReplyCount < comment.replies.length;

    return (
      <div
        key={comment.id}
        className={
          isReply ? "comment-thread comment-reply-thread" : "comment-thread"
        }
      >
        <Card
          className={
            isReply ? "comment-card comment-reply-card" : "comment-card"
          }
        >
          <Card.Body>
            <div className="comment-card-header">
              <div className="comment-author">
                {comment.author.avatarUrl ? (
                  <Image
                    src={comment.author.avatarUrl}
                    alt=""
                    className="comment-avatar"
                    roundedCircle
                  />
                ) : (
                  <div
                    className="comment-avatar comment-avatar-placeholder"
                    aria-hidden="true"
                  >
                    {getInitials(
                      comment.author.name,
                      comment.author.surname,
                      comment.author.username,
                    )}
                  </div>
                )}

                <div>
                  <div className="comment-author-name">
                    <strong>
                      {comment.author.name} {comment.author.surname}
                    </strong>

                    {isReply && (
                      <span className="comment-reply-label">Reply</span>
                    )}

                    {canModerate && !isOwner && (
                      <span
                        className="comment-moderation-label"
                        title="You can moderate this comment"
                      >
                        <ShieldCheck />
                        Moderation
                      </span>
                    )}
                  </div>

                  <div className="comment-metadata">
                    <span>@{comment.author.username}</span>

                    <span aria-hidden="true">·</span>

                    <time dateTime={comment.createdAt}>
                      {new Date(comment.createdAt).toLocaleString()}
                    </time>

                    {wasEdited && (
                      <>
                        <span aria-hidden="true">·</span>

                        <span>edited</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {user && !isEditing && (
                <div className="comment-actions">
                  {!isReply && (
                    <Button
                      type="button"
                      size="sm"
                      variant="link"
                      disabled={isSubmitting || isSubmittingReply || isDeleting}
                      aria-label={`Reply to @${comment.author.username}`}
                      onClick={() => startReplying(comment)}
                    >
                      <Reply />
                      <span>Reply</span>
                    </Button>
                  )}

                  {isOwner && (
                    <Button
                      type="button"
                      size="sm"
                      variant="link"
                      disabled={isSubmitting || isDeleting}
                      aria-label={isReply ? "Edit reply" : "Edit comment"}
                      onClick={() => startEditing(comment)}
                    >
                      <Pencil />
                      <span>Edit</span>
                    </Button>
                  )}

                  {canDelete && (
                    <Button
                      type="button"
                      size="sm"
                      variant="link"
                      className="comment-delete-button"
                      disabled={isSubmitting || isDeleting}
                      aria-label={isReply ? "Delete reply" : "Delete comment"}
                      onClick={() => setCommentPendingDeletion(comment)}
                    >
                      {isDeleting ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <Trash />
                      )}

                      <span>{isDeleting ? "Deleting" : "Delete"}</span>
                    </Button>
                  )}
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="comment-edit-area">
                <Form.Group controlId={`edit-comment-${comment.id}`}>
                  <Form.Label className="visually-hidden">
                    {isReply ? "Edit reply" : "Edit comment"}
                  </Form.Label>

                  <RichTextEditor
                    key={`edit-comment-${comment.id}`}
                    value={editingContent}
                    onChange={setEditingContent}
                    variant="compact"
                    placeholder={
                      isReply ? "Edit your reply…" : "Edit your comment…"
                    }
                    disabled={isSubmitting}
                    ariaLabel={isReply ? "Edit reply" : "Edit comment"}
                  />
                </Form.Group>

                <div className="comment-edit-footer">
                  <small
                    className={
                      editingContent.plainText.length > 1000
                        ? "text-danger"
                        : undefined
                    }
                  >
                    {editingContent.plainText.length}/1000
                  </small>
                  <div className="d-flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline-secondary"
                      disabled={isSubmitting}
                      onClick={cancelEditing}
                    >
                      <X className="me-1" />
                      Cancel
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      disabled={
                        isSubmitting ||
                        !editingContent.plainText.trim() ||
                        editingContent.plainText.length > 1000
                      }
                      onClick={() => void handleUpdate(comment.id)}
                    >
                      {isSubmitting ? (
                        <>
                          <Spinner
                            animation="border"
                            size="sm"
                            className="me-2"
                          />
                          Saving…
                        </>
                      ) : (
                        <>
                          <Check2 className="me-1" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <RichTextViewer
                editorState={comment.editorState}
                fallbackPlainText={comment.content}
                className="comment-content"
                ariaLabel={
                  isReply
                    ? `Reply by @${comment.author.username}`
                    : `Comment by @${comment.author.username}`
                }
              />
            )}

            {!isEditing && (
              <div className="comment-reactions">
                <ReactionButtons
                  reactions={comment.reactions}
                  label={
                    isReply
                      ? `reply by @${comment.author.username}`
                      : `comment by @${comment.author.username}`
                  }
                  onReact={(reactionType) =>
                    reactToComment(comment.id, reactionType)
                  }
                  onChange={(reactions) =>
                    updateCommentReactions(comment.id, reactions)
                  }
                />
              </div>
            )}

            {!isReply && replyingTo?.id === comment.id && (
              <Form
                className="comment-reply-composer"
                onSubmit={(event) => void handleReply(event)}
              >
                <div className="comment-reply-heading">
                  <div>
                    <strong>Replying to @{comment.author.username}</strong>

                    <span>Replies are limited to one level.</span>
                  </div>

                  <Button
                    type="button"
                    variant="link"
                    className="comment-reply-close"
                    aria-label="Cancel reply"
                    disabled={isSubmittingReply}
                    onClick={cancelReplying}
                  >
                    <X />
                  </Button>
                </div>

                <Form.Group controlId={`reply-to-${comment.id}`}>
                  <Form.Label className="visually-hidden">
                    Write a reply
                  </Form.Label>

                  <RichTextEditor
                    key={`reply-editor-${comment.id}`}
                    value={replyContent}
                    onChange={setReplyContent}
                    variant="compact"
                    placeholder={`Reply to @${comment.author.username}…`}
                    disabled={isSubmittingReply}
                    ariaLabel={`Reply to @${comment.author.username}`}
                  />
                </Form.Group>

                <div className="comment-reply-footer">
                  <small
                    className={
                      replyContent.plainText.length > 1000
                        ? "text-danger"
                        : undefined
                    }
                  >
                    {replyContent.plainText.length}/1000
                  </small>
                  <div className="d-flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline-secondary"
                      disabled={isSubmittingReply}
                      onClick={cancelReplying}
                    >
                      Cancel
                    </Button>

                    <Button
                      type="submit"
                      size="sm"
                      disabled={
                        isSubmittingReply ||
                        !replyContent.plainText.trim() ||
                        replyContent.plainText.length > 1000
                      }
                    >
                      {isSubmittingReply ? (
                        <>
                          <Spinner
                            animation="border"
                            size="sm"
                            className="me-2"
                          />
                          Publishing…
                        </>
                      ) : (
                        <>
                          Publish reply
                          <Send className="ms-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Form>
            )}
          </Card.Body>
        </Card>

        {!isReply && comment.replies.length > 0 && (
          <div className="comment-replies-section">
            {!repliesAreVisible ? (
              <Button
                type="button"
                variant="link"
                className="comment-show-replies"
                aria-expanded="false"
                onClick={() => showReplies(comment.id)}
              >
                <ChevronDown aria-hidden="true" />

                <span>
                  Show {comment.replies.length}{" "}
                  {comment.replies.length === 1 ? "reply" : "replies"}
                </span>
              </Button>
            ) : (
              <>
                <div
                  className="comment-replies"
                  aria-label={`Replies to @${comment.author.username}`}
                >
                  {displayedReplies.map((reply) => renderComment(reply, true))}
                </div>

                <div className="comment-replies-navigation">
                  {hasMoreReplies && (
                    <Button
                      type="button"
                      variant="link"
                      className="comment-load-replies"
                      onClick={() => loadMoreReplies(comment.id)}
                    >
                      <ChevronDown aria-hidden="true" />

                      <span>Load more replies</span>
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="link"
                    className="comment-hide-replies"
                    aria-expanded="true"
                    onClick={() => hideReplies(comment.id)}
                  >
                    <ChevronUp aria-hidden="true" />

                    <span>Hide replies</span>
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <section className="comments-section">
      <header className="comments-heading">
        <div className="comments-heading-icon" aria-hidden="true">
          <ChatLeftText />
        </div>

        <div>
          <p className="comments-eyebrow">The conversation</p>

          <h2>
            Comments
            <span className="comments-count">{totalCommentCount}</span>
          </h2>

          <p>Thoughts, questions and stories from fellow travellers.</p>
        </div>
      </header>

      {error && (
        <Alert variant="danger" className="comments-alert" role="alert">
          {error}
        </Alert>
      )}

      {user ? (
        <Form
          className="comment-composer"
          onSubmit={(event) => void handleCreate(event)}
        >
          <div className="comment-composer-author">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt=""
                className="comment-avatar"
                roundedCircle
              />
            ) : (
              <div
                className="comment-avatar comment-avatar-placeholder"
                aria-hidden="true"
              >
                {getInitials(user.name, user.surname, user.username)}
              </div>
            )}

            <div>
              <strong>Join the conversation</strong>

              <span>Commenting as @{user.username}</span>
            </div>
          </div>

          <Form.Group controlId={`new-comment-${postId}`}>
            <Form.Label className="visually-hidden">Write a comment</Form.Label>

            <RichTextEditor
              value={content}
              onChange={setContent}
              variant="compact"
              placeholder="Share a thought, memory or useful travel tip…"
              disabled={isSubmitting}
              ariaLabel="Write a comment"
            />
          </Form.Group>

          <div className="comment-composer-footer">
            <small
              className={
                content.plainText.length > 1000 ? "text-danger" : undefined
              }
            >
              {content.plainText.length}/1000
            </small>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !content.plainText.trim() ||
                content.plainText.length > 1000
              }
            >
              {isSubmitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Publishing…
                </>
              ) : (
                <>
                  Publish comment
                  <Send className="ms-2" />
                </>
              )}
            </Button>
          </div>
        </Form>
      ) : (
        <div className="comments-login-prompt">
          <div className="comments-login-icon" aria-hidden="true">
            <ChatLeftText />
          </div>

          <div>
            <strong>Have something to add?</strong>

            <p>
              <Link
                to="/login"
                state={{
                  from: `${location.pathname}${location.search}`,
                }}
              >
                Log in
              </Link>{" "}
              or <Link to="/signup">create an account</Link> to join the
              conversation.
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="comments-loading">
          <Spinner animation="border" size="sm" role="status" />

          <span>Gathering the conversation…</span>
        </div>
      ) : comments.length === 0 ? (
        <div className="comments-empty">
          <ChatLeftText aria-hidden="true" />

          <strong>It is quiet here for now.</strong>

          <p>Be the first traveller to leave a thought.</p>
        </div>
      ) : (
        <div className="comments-list">
          {comments.map((comment) => renderComment(comment))}
        </div>
      )}

      <Confirmation
        show={commentPendingDeletion !== null}
        title={
          commentPendingDeletion?.parentCommentId
            ? "Delete this reply?"
            : "Delete this comment?"
        }
        message={
          commentPendingDeletion
            ? commentPendingDeletion.parentCommentId
              ? `The reply by @${commentPendingDeletion.author.username} will be permanently removed.`
              : `"${commentPendingDeletion.content}" and all its replies will be permanently removed.`
            : ""
        }
        confirmLabel={
          commentPendingDeletion?.parentCommentId
            ? "Delete reply"
            : "Delete comment"
        }
        warning="This action cannot be undone."
        destructive
        isConfirming={deletingCommentId !== null}
        onCancel={() => {
          if (!deletingCommentId) {
            setCommentPendingDeletion(null);
          }
        }}
        onConfirm={() => void confirmCommentDeletion()}
      />
    </section>
  );
}
