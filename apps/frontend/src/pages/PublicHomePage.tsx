import { useEffect, useState } from "react";

import {
  Alert,
  Card,
  Col,
  Container,
  Image,
  Row,
  Spinner,
} from "react-bootstrap";

import { ArrowRight, Book, Compass } from "react-bootstrap-icons";

import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { getPageHeroContent } from "../services/pageHeroContentService";
import { getPublishedPosts } from "../services/postService";

import type { PageHeroContent, Post } from "../types/models";

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

const defaultHomeHeroContent: PageHeroContent = {
  page: "HOME",
  preTitle: "A journal for curious travellers",
  title: "Stories that make the world feel a little closer.",
  description:
    "Settle in with thoughtful travel stories, honest experiences and useful ideas gathered along the way.",
  primaryButtonLabel: "Explore stories",
  guestButtonLabel: "Join the community",
  note: "Made for slow reading, new ideas and the next journey.",
  featuredLabel: "Latest story",
  readStoryLabel: "Read the story",
  fallbackBrand: "Explore & Share",
  fallbackTitle: "Every journey leaves a story behind.",
  fallbackDescription:
    "A quiet corner for memories, photographs and discoveries from around the world.",
  createdAt: "",
  updatedAt: "",
};

export function PublicHomePage() {
  const { user } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [heroContent, setHeroContent] = useState<PageHeroContent>(
    defaultHomeHeroContent,
  );

  useEffect(() => {
    // Prevents updating the state if the user leaves the page before it loads

    let isActive = true;

    async function loadPage() {
      // Loads the latest posts and hero content at the same time

      const [postsResult, heroResult] = await Promise.allSettled([
        getPublishedPosts({
          limit: 3,
        }),
        getPageHeroContent("HOME"),
      ]);

      if (!isActive) {
        return;
      }

      if (postsResult.status === "fulfilled") {
        setPosts(postsResult.value.content);
      } else {
        setError("The stories could not be loaded.");
      }

      if (heroResult.status === "fulfilled") {
        setHeroContent(heroResult.value);
      }

      setIsLoading(false);
    }

    void loadPage();

    return () => {
      isActive = false;
    };
  }, []);

  const featuredPost = posts[0] ?? null;
  const featuredCover = featuredPost ? getPostCover(featuredPost) : null;

  return (
    <>
      <section className="cozy-hero">
        <Container>
          <Row className="align-items-center g-5">
            <Col lg={6}>
              <div className="cozy-hero-copy">
                <span className="cozy-eyebrow">{heroContent.preTitle}</span>
                <h1>{heroContent.title}</h1>

                <p className="cozy-hero-description">
                  {heroContent.description}
                </p>

                <div className="cozy-hero-actions">
                  <Link to="/posts" className="btn btn-primary btn-lg">
                    {heroContent.primaryButtonLabel ??
                      defaultHomeHeroContent.primaryButtonLabel}

                    <ArrowRight className="ms-2" />
                  </Link>

                  {!user && (
                    <Link
                      to="/signup"
                      className="btn btn-outline-primary btn-lg"
                    >
                      {heroContent.guestButtonLabel ??
                        defaultHomeHeroContent.guestButtonLabel}
                    </Link>
                  )}
                </div>

                <div className="cozy-hero-note">
                  <Book />

                  <span>{heroContent.note ?? defaultHomeHeroContent.note}</span>
                </div>
              </div>
            </Col>

            <Col lg={6}>
              {featuredPost ? (
                <Link
                  to={`/posts/${featuredPost.slug}`}
                  className="cozy-featured-link"
                >
                  <article className="cozy-featured-story">
                    <div className="cozy-featured-image">
                      {featuredCover ? (
                        <img src={featuredCover} alt="" />
                      ) : (
                        <div className="cozy-cover-placeholder">
                          <Compass />
                        </div>
                      )}

                      <span className="cozy-featured-label">
                        {heroContent.featuredLabel ??
                          defaultHomeHeroContent.featuredLabel}
                      </span>
                    </div>

                    <div className="cozy-featured-content">
                      <p className="cozy-post-date">
                        {formatPostDate(featuredPost)}
                      </p>

                      <h2>{featuredPost.title}</h2>

                      <p>{featuredPost.summary}</p>

                      <span className="cozy-read-link">
                        {heroContent.readStoryLabel ??
                          defaultHomeHeroContent.readStoryLabel}

                        <ArrowRight />
                      </span>
                    </div>
                  </article>
                </Link>
              ) : (
                <div className="cozy-hero-postcard">
                  <div className="cozy-postcard-mark">
                    <Compass />
                  </div>

                  <span>
                    {heroContent.fallbackBrand ??
                      defaultHomeHeroContent.fallbackBrand}
                  </span>

                  <h2>
                    {heroContent.fallbackTitle ??
                      defaultHomeHeroContent.fallbackTitle}
                  </h2>

                  <p>
                    {heroContent.fallbackDescription ??
                      defaultHomeHeroContent.fallbackDescription}
                  </p>

                  <div className="cozy-postcard-lines">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}
            </Col>
          </Row>
        </Container>
      </section>

      <section className="cozy-latest-section">
        <Container>
          <div className="cozy-section-heading">
            <div>
              <span className="cozy-eyebrow">From the journal</span>

              <h2>Latest stories</h2>

              <p>Fresh experiences, ideas and places worth remembering.</p>
            </div>

            {posts.length > 0 && (
              <Link to="/posts" className="cozy-all-stories-link">
                View all stories
                <ArrowRight />
              </Link>
            )}
          </div>

          {isLoading && (
            <div className="cozy-loading-state">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading stories</span>
              </Spinner>

              <p>Gathering the latest stories…</p>
            </div>
          )}

          {error && <Alert variant="danger">{error}</Alert>}

          {!isLoading && !error && posts.length === 0 && (
            <div className="cozy-empty-state">
              <Compass />

              <h3>The first story is still being written</h3>

              <p>Come back soon for travel memories and new discoveries.</p>
            </div>
          )}

          {!isLoading && !error && posts.length > 0 && (
            <Row xs={1} md={2} lg={3} className="g-4">
              {posts.slice(0, 3).map((post) => {
                const cover = getPostCover(post);

                return (
                  <Col key={post.id}>
                    <Card className="cozy-post-card h-100">
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
                        <p className="cozy-post-date">{formatPostDate(post)}</p>

                        <Card.Title>{post.title}</Card.Title>

                        <Card.Text>{post.summary}</Card.Text>

                        <div className="cozy-card-footer mt-auto">
                          <div className="cozy-card-author">
                            {post.author.avatarUrl ? (
                              <Image
                                src={post.author.avatarUrl}
                                alt=""
                                roundedCircle
                              />
                            ) : (
                              <div className="cozy-author-placeholder">
                                {post.author.username.charAt(0).toUpperCase()}
                              </div>
                            )}

                            <span>@{post.author.username}</span>
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
          )}
        </Container>
      </section>
    </>
  );
}
