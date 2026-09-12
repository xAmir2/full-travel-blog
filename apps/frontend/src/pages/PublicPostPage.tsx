import { useEffect, useState } from "react";

import { Alert, Container, Image, Spinner } from "react-bootstrap";

import { ArrowLeft, Calendar3 } from "react-bootstrap-icons";

import { Link, useParams } from "react-router-dom";

import { CommentsSection } from "../components/CommentsSection";
import { PostContent } from "../components/PostContent";

import { getPublishedPostBySlug } from "../services/postService";

import { ReactionButtons } from "../components/ReactionButtons";

import { reactToPost } from "../services/reactionService";

import type { Post, ReactionSummary } from "../types/models";

function formatPostDate(post: Post): string {
  const date = post.publishedAt ?? post.createdAt;

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function PublicPostPage() {
  const { slug } = useParams<{
    slug: string;
  }>();

  const [post, setPost] = useState<Post | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      return;
    }

    let isActive = true;

    async function loadPost() {
      try {
        const publishedPost = await getPublishedPostBySlug(slug!);

        if (isActive) {
          setPost(publishedPost);
        }
      } catch {
        if (isActive) {
          setError("The story was not found.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadPost();

    return () => {
      isActive = false;
    };
  }, [slug]);

  function updatePostReactions(reactions: ReactionSummary) {
    setPost((currentPost) => {
      if (!currentPost) {
        return currentPost;
      }

      return {
        ...currentPost,
        reactions,
      };
    });
  }

  if (!slug) {
    return (
      <Container className="py-5">
        <Alert variant="warning">The story address is not valid.</Alert>

        <Link to="/posts">Return to the journal</Link>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <div className="article-loading-state">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading story</span>
        </Spinner>

        <p>Opening the story…</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <Container className="py-5">
        <div className="cozy-empty-state">
          <h1 className="h2">This story could not be found</h1>

          <p>It may have been moved, unpublished or removed.</p>

          <Link to="/posts" className="btn btn-primary mt-3">
            Return to the journal
          </Link>
        </div>
      </Container>
    );
  }

  const authorInitial = post.author.username.charAt(0).toUpperCase() || "U";

  return (
    <main className="article-page">
      <Container>
        <div className="article-navigation">
          <Link to="/posts" className="article-back-link">
            <ArrowLeft />
            Back to the journal
          </Link>

          <span className="article-type">Travel story</span>
        </div>

        <article className="article-paper">
          <header className="article-introduction">
            <h1>{post.title}</h1>

            <p className="article-summary">{post.summary}</p>

            <div className="article-author">
              {post.author.avatarUrl ? (
                <Image
                  src={post.author.avatarUrl}
                  alt=""
                  className="article-author-avatar"
                  roundedCircle
                />
              ) : (
                <div className="article-author-avatar article-author-placeholder">
                  {authorInitial}
                </div>
              )}

              <div>
                <p className="article-author-name">@{post.author.username}</p>

                <p className="article-date">
                  <Calendar3 />
                  {formatPostDate(post)}
                </p>
              </div>
            </div>
          </header>

          <div className="article-divider" />

          <PostContent post={post} />

          <div className="article-reactions">
            <span className="article-reactions-label">
              Did you like the story?
            </span>

            <ReactionButtons
              reactions={post.reactions}
              label={`post “${post.title}”`}
              onReact={(reactionType) => reactToPost(post.id, reactionType)}
              onChange={updatePostReactions}
            />
          </div>

          <div className="article-end-mark">
            <span />
            <span className="article-end-symbol">✦</span>
            <span />
          </div>

          <CommentsSection postId={post.id} />
        </article>
      </Container>
    </main>
  );
}
