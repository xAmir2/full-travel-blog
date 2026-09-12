import { useEffect, useRef, useState } from "react";

import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Image,
  Pagination,
  Row,
  Spinner,
} from "react-bootstrap";

import { ArrowRight, Book, Compass, Search, X } from "react-bootstrap-icons";

import { Link, useSearchParams } from "react-router-dom";

import { getPageHeroContent } from "../services/pageHeroContentService";
import { getPublishedPosts } from "../services/postService";

import type { PageHeroContent, Post } from "../types/models";

const postsPerPage = 6;

const defaultJournalHeroContent: PageHeroContent = {
  page: "JOURNAL",
  preTitle: "The travel journal",
  title: "Stories, places and moments worth remembering.",
  description:
    "Browse honest travel experiences, photographs and useful discoveries gathered from journeys near and far.",
  primaryButtonLabel: null,
  guestButtonLabel: null,
  note: null,
  featuredLabel: null,
  readStoryLabel: null,
  fallbackBrand: null,
  fallbackTitle: null,
  fallbackDescription: null,
  createdAt: "",
  updatedAt: "",
};

function getPostCover(post: Post): string | null {
  const imageBlock = post.contentBlocks.find((block) => block.type === "IMAGE");

  return imageBlock?.type === "IMAGE" ? imageBlock.content.url : null;
}

function formatPostDate(post: Post): string {
  const date = post.publishedAt ?? post.createdAt;

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function PublicPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);

  const [heroContent, setHeroContent] = useState<PageHeroContent>(
    defaultJournalHeroContent,
  );

  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();

  const searchTerm = searchParams.get("search")?.trim() ?? "";

  const [currentPage, setCurrentPage] = useState(1);

  const [pageCursors, setPageCursors] = useState<(string | null)[]>([null]);

  const postsStartRef = useRef<HTMLDivElement | null>(null);
  const shouldScrollToPostsRef = useRef(false);

  useEffect(() => {
    if (!shouldScrollToPostsRef.current) {
      return;
    }

    shouldScrollToPostsRef.current = false;

    const animationFrame = window.requestAnimationFrame(() => {
      const postsElement = postsStartRef.current;

      if (!postsElement) {
        return;
      }

      const navbarOffset = 90;

      const targetPosition =
        postsElement.getBoundingClientRect().top +
        window.scrollY -
        navbarOffset;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [currentPage]);

  useEffect(() => {
    let isActive = true;

    async function loadFirstPage() {
      setIsLoading(true);
      setError(null);

      const [postsResult, heroResult] = await Promise.allSettled([
        getPublishedPosts({
          limit: postsPerPage,
          search: searchTerm,
        }),
        getPageHeroContent("JOURNAL"),
      ]);

      if (!isActive) {
        return;
      }

      if (postsResult.status === "fulfilled") {
        const publishedPage = postsResult.value;

        setPosts(publishedPage.content);
        setNextCursor(publishedPage.nextCursor);
        setHasNext(publishedPage.hasNext);
        setCurrentPage(1);
        setPageCursors([null]);
      } else {
        setPosts([]);
        setNextCursor(null);
        setHasNext(false);
        setCurrentPage(1);
        setPageCursors([null]);
        setError("The journal could not be loaded.");
      }

      if (heroResult.status === "fulfilled") {
        setHeroContent(heroResult.value);
      }

      setIsLoading(false);
    }

    void loadFirstPage();

    return () => {
      isActive = false;
    };
  }, [searchTerm]);

  async function loadPage(cursor: string | null, pageNumber: number) {
    setIsLoading(true);
    setError(null);

    try {
      const publishedPage = await getPublishedPosts({
        limit: postsPerPage,
        cursor,
        search: searchTerm,
      });

      setPosts(publishedPage.content);
      setNextCursor(publishedPage.nextCursor);
      setHasNext(publishedPage.hasNext);

      shouldScrollToPostsRef.current = true;
      setCurrentPage(pageNumber);
    } catch {
      setError("The requested page could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleNextPage() {
    if (!hasNext || !nextCursor || isLoading) {
      return;
    }

    const nextPage = currentPage + 1;
    const cursorForNextPage = nextCursor;

    setPageCursors((currentCursors) => {
      const updatedCursors = currentCursors.slice(0, nextPage);

      updatedCursors[nextPage - 1] = cursorForNextPage;

      return updatedCursors;
    });

    await loadPage(cursorForNextPage, nextPage);
  }

  async function handlePreviousPage() {
    if (currentPage <= 1 || isLoading) {
      return;
    }

    const previousPage = currentPage - 1;
    const cursorForPreviousPage = pageCursors[previousPage - 1] ?? null;

    await loadPage(cursorForPreviousPage, previousPage);
  }

  function clearSearch() {
    setSearchParams({});
  }

  return (
    <div className={`journal-page ${searchTerm ? "journal-search-mode" : ""}`}>
      {!searchTerm && (
        <header className="journal-header">
          <Container>
            <div className="journal-heading-content">
              <div className="journal-heading-icon">
                <Book />
              </div>

              <span className="cozy-eyebrow">{heroContent.preTitle}</span>

              <h1>{heroContent.title}</h1>

              <p>{heroContent.description}</p>

              {!isLoading && !error && posts.length > 0 && (
                <span className="journal-story-count">
                  Showing {posts.length}{" "}
                  {posts.length === 1 ? "story" : "stories"}
                  {hasNext ? " — more available" : ""}
                </span>
              )}
            </div>
          </Container>
        </header>
      )}

      <section className="journal-content">
        <Container>
          {isLoading && (
            <div className="cozy-loading-state">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading journal</span>
              </Spinner>

              <p>Opening the travel journal…</p>
            </div>
          )}

          {!isLoading && error && <Alert variant="danger">{error}</Alert>}

          {!isLoading && !error && searchTerm && (
            <div className="journal-search-heading">
              <div>
                <span className="cozy-eyebrow">Search results</span>

                <h1>
                  Stories matching <span>“{searchTerm}”</span>
                </h1>

                <p>
                  Showing {posts.length}{" "}
                  {posts.length === 1 ? "story" : "stories"}
                  {hasNext ? " — more available" : ""}
                </p>
              </div>

              <Button
                type="button"
                variant="outline-primary"
                onClick={clearSearch}
              >
                <X />
                Clear search
              </Button>
            </div>
          )}

          {!isLoading && !error && posts.length === 0 && !searchTerm && (
            <div className="cozy-empty-state">
              <Compass />

              <h2>The journal is waiting for its first story</h2>

              <p>New travel memories will appear here soon.</p>
            </div>
          )}

          {!isLoading && !error && posts.length === 0 && searchTerm && (
            <div className="cozy-empty-state">
              <Search />

              <h2>No stories found</h2>

              <p>
                We couldn&apos;t find a published story matching{" "}
                <strong>“{searchTerm}”</strong>.
              </p>

              <Button
                type="button"
                variant="outline-primary"
                onClick={clearSearch}
              >
                View all stories
              </Button>
            </div>
          )}

          {!isLoading && posts.length > 0 && (
            <>
              <div ref={postsStartRef} className="journal-results-grid">
                <Row xs={1} md={2} lg={3} className="g-4">
                  {posts.map((post) => {
                    const cover = getPostCover(post);

                    return (
                      <Col key={post.id}>
                        <Card className="cozy-post-card journal-post-card h-100">
                          <div className="cozy-card-cover">
                            {cover ? (
                              <Card.Img variant="top" src={cover} alt="" />
                            ) : (
                              <div className="cozy-cover-placeholder">
                                <Compass />
                              </div>
                            )}
                          </div>

                          <Card.Body className="d-flex flex-column">
                            <div className="journal-card-meta">
                              <p className="cozy-post-date">
                                {formatPostDate(post)}
                              </p>

                              <span>Travel story</span>
                            </div>

                            <Card.Title>{post.title}</Card.Title>

                            <Card.Text>{post.summary}</Card.Text>

                            <div className="cozy-card-footer mt-auto">
                              <div className="cozy-card-author">
                                {post.author.avatarUrl ? (
                                  <Image
                                    src={post.author.avatarUrl}
                                    alt={`${post.author.username}'s profile`}
                                    roundedCircle
                                  />
                                ) : (
                                  <div
                                    className="cozy-author-placeholder"
                                    aria-hidden="true"
                                  >
                                    {post.author.username
                                      .charAt(0)
                                      .toUpperCase()}
                                  </div>
                                )}

                                <div>
                                  <span className="d-block">
                                    @{post.author.username}
                                  </span>

                                  <small>Story author</small>
                                </div>
                              </div>

                              <Link
                                to={`/posts/${post.slug}`}
                                className="cozy-card-arrow stretched-link"
                                aria-label={`Read ${post.title}`}
                              >
                                <ArrowRight />
                              </Link>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </div>

              <Pagination className="journal-pagination mt-5 justify-content-center">
                <Pagination.Prev
                  disabled={currentPage === 1 || isLoading}
                  onClick={() => void handlePreviousPage()}
                >
                  Previous
                </Pagination.Prev>

                <Pagination.Next
                  disabled={!hasNext || !nextCursor || isLoading}
                  onClick={() => void handleNextPage()}
                >
                  Next
                </Pagination.Next>
              </Pagination>
            </>
          )}
        </Container>
      </section>
    </div>
  );
}
