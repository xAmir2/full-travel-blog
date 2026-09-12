import { useEffect, useState, type SubmitEvent } from "react";

import { Alert, Button, Card, Col, Form, Row, Spinner } from "react-bootstrap";

import { Book, HouseDoor, Save } from "react-bootstrap-icons";

import { getApiErrorMessage } from "../services/apiErrors";

import {
  getPageHeroContent,
  updatePageHeroContent,
} from "../services/pageHeroContentService";

import type {
  HeroPage,
  PageHeroContent,
  PageHeroContentInput,
} from "../types/models";

interface HeroEditorConfig {
  page: HeroPage;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const heroEditors: HeroEditorConfig[] = [
  {
    page: "HOME",
    title: "Homepage hero",
    description:
      "Edit the text displayed in the main hero section of the public homepage.",
    icon: <HouseDoor />,
  },
  {
    page: "JOURNAL",
    title: "Journal hero",
    description:
      "Edit the text displayed at the top of the public travel journal.",
    icon: <Book />,
  },
];

// Keeps only the fields that can be edited and sent back to the backend
function toInput(content: PageHeroContent): PageHeroContentInput {
  return {
    preTitle: content.preTitle,
    title: content.title,
    description: content.description,
    primaryButtonLabel: content.primaryButtonLabel,
    guestButtonLabel: content.guestButtonLabel,
    note: content.note,
    featuredLabel: content.featuredLabel,
    readStoryLabel: content.readStoryLabel,
    fallbackBrand: content.fallbackBrand,
    fallbackTitle: content.fallbackTitle,
    fallbackDescription: content.fallbackDescription,
  };
}

// Converts empty optional fields to null for the backend
function nullableValue(value: string): string | null {
  const trimmedValue = value.trim();

  return trimmedValue ? trimmedValue : null;
}

export function AdminPageHeroContentPage() {
  const [homeContent, setHomeContent] = useState<PageHeroContentInput | null>(
    null,
  );

  const [journalContent, setJournalContent] =
    useState<PageHeroContentInput | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [savingPage, setSavingPage] = useState<HeroPage | null>(null);

  const [message, setMessage] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadHeroContent() {
      try {
        const [homeHero, journalHero] = await Promise.all([
          getPageHeroContent("HOME"),
          getPageHeroContent("JOURNAL"),
        ]);

        if (isActive) {
          setHomeContent(toInput(homeHero));
          setJournalContent(toInput(journalHero));
        }
      } catch (loadError) {
        if (isActive) {
          setError(
            getApiErrorMessage(
              loadError,
              "The page hero content could not be loaded.",
            ),
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadHeroContent();

    return () => {
      isActive = false;
    };
  }, []);

  function getContent(page: HeroPage): PageHeroContentInput | null {
    return page === "HOME" ? homeContent : journalContent;
  }

  function setContent(
    page: HeroPage,
    updater: (current: PageHeroContentInput) => PageHeroContentInput,
  ) {
    if (page === "HOME") {
      setHomeContent((currentContent) =>
        currentContent ? updater(currentContent) : currentContent,
      );

      return;
    }

    setJournalContent((currentContent) =>
      currentContent ? updater(currentContent) : currentContent,
    );
  }

  function updateField(
    page: HeroPage,
    field: keyof PageHeroContentInput,
    value: string,
  ) {
    setContent(page, (currentContent) => ({
      ...currentContent,
      [field]: value,
    }));

    setMessage(null);
    setError(null);
  }

  async function handleSubmit(
    event: SubmitEvent<HTMLFormElement>,
    page: HeroPage,
  ) {
    event.preventDefault();

    const content = getContent(page);

    if (!content) {
      return;
    }

    if (!content.preTitle.trim()) {
      setError("The pre-title is required.");
      return;
    }

    if (!content.title.trim()) {
      setError("The title is required.");
      return;
    }

    if (!content.description.trim()) {
      setError("The description is required.");
      return;
    }

    const payload: PageHeroContentInput = {
      preTitle: content.preTitle.trim(),
      title: content.title.trim(),
      description: content.description.trim(),
      primaryButtonLabel: nullableValue(content.primaryButtonLabel ?? ""),
      guestButtonLabel: nullableValue(content.guestButtonLabel ?? ""),
      note: nullableValue(content.note ?? ""),
      featuredLabel: nullableValue(content.featuredLabel ?? ""),
      readStoryLabel: nullableValue(content.readStoryLabel ?? ""),
      fallbackBrand: nullableValue(content.fallbackBrand ?? ""),
      fallbackTitle: nullableValue(content.fallbackTitle ?? ""),
      fallbackDescription: nullableValue(content.fallbackDescription ?? ""),
    };

    setSavingPage(page);
    setMessage(null);
    setError(null);

    try {
      const updatedContent = await updatePageHeroContent(page, payload);

      const updatedInput = toInput(updatedContent);

      if (page === "HOME") {
        setHomeContent(updatedInput);
      } else {
        setJournalContent(updatedInput);
      }

      setMessage(
        page === "HOME"
          ? "The homepage hero was updated."
          : "The journal hero was updated.",
      );
    } catch (saveError) {
      setError(
        getApiErrorMessage(
          saveError,
          page === "HOME"
            ? "The homepage hero could not be updated."
            : "The journal hero could not be updated.",
        ),
      );
    } finally {
      setSavingPage(null);
    }
  }

  if (isLoading) {
    return (
      <div className="cozy-loading-state">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading page content</span>
        </Spinner>

        <p>Loading page content…</p>
      </div>
    );
  }

  return (
    <>
      <div className="admin-page-header">
        <div>
          <span className="cozy-eyebrow">Site content</span>

          <h1>Page heroes</h1>

          <p>
            Update the text shown in the main hero areas of the public website.
          </p>
        </div>
      </div>

      {message && <Alert variant="success">{message}</Alert>}

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="g-4">
        {heroEditors.map((editor) => {
          const content = getContent(editor.page);

          if (!content) {
            return null;
          }

          const isSaving = savingPage === editor.page;

          return (
            <Col xs={12} xl={6} key={editor.page}>
              <Card className="admin-form-card h-100">
                <Card.Body>
                  <div className="d-flex align-items-start gap-3 mb-4">
                    <div className="admin-section-icon">{editor.icon}</div>

                    <div>
                      <h2 className="h4 mb-1">{editor.title}</h2>

                      <p className="text-muted mb-0">{editor.description}</p>
                    </div>
                  </div>

                  <Form
                    onSubmit={(event) => void handleSubmit(event, editor.page)}
                  >
                    <Form.Group className="mb-3">
                      <Form.Label>Pre-title</Form.Label>

                      <Form.Control
                        type="text"
                        value={content.preTitle}
                        onChange={(event) =>
                          updateField(
                            editor.page,
                            "preTitle",
                            event.target.value,
                          )
                        }
                        disabled={isSaving}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Title</Form.Label>

                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={content.title}
                        onChange={(event) =>
                          updateField(editor.page, "title", event.target.value)
                        }
                        disabled={isSaving}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Description</Form.Label>

                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={content.description}
                        onChange={(event) =>
                          updateField(
                            editor.page,
                            "description",
                            event.target.value,
                          )
                        }
                        disabled={isSaving}
                        required
                      />
                    </Form.Group>

                    {editor.page === "HOME" && (
                      <>
                        <Row className="g-3">
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>Primary button label</Form.Label>

                              <Form.Control
                                type="text"
                                value={content.primaryButtonLabel ?? ""}
                                onChange={(event) =>
                                  updateField(
                                    editor.page,
                                    "primaryButtonLabel",
                                    event.target.value,
                                  )
                                }
                                disabled={isSaving}
                              />
                            </Form.Group>
                          </Col>

                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>Guest button label</Form.Label>

                              <Form.Control
                                type="text"
                                value={content.guestButtonLabel ?? ""}
                                onChange={(event) =>
                                  updateField(
                                    editor.page,
                                    "guestButtonLabel",
                                    event.target.value,
                                  )
                                }
                                disabled={isSaving}
                              />
                            </Form.Group>
                          </Col>

                          <Col xs={12}>
                            <Form.Group>
                              <Form.Label>Hero note</Form.Label>

                              <Form.Control
                                type="text"
                                value={content.note ?? ""}
                                onChange={(event) =>
                                  updateField(
                                    editor.page,
                                    "note",
                                    event.target.value,
                                  )
                                }
                                disabled={isSaving}
                              />
                            </Form.Group>
                          </Col>

                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>Featured label</Form.Label>

                              <Form.Control
                                type="text"
                                value={content.featuredLabel ?? ""}
                                onChange={(event) =>
                                  updateField(
                                    editor.page,
                                    "featuredLabel",
                                    event.target.value,
                                  )
                                }
                                disabled={isSaving}
                              />
                            </Form.Group>
                          </Col>

                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>Read story label</Form.Label>

                              <Form.Control
                                type="text"
                                value={content.readStoryLabel ?? ""}
                                onChange={(event) =>
                                  updateField(
                                    editor.page,
                                    "readStoryLabel",
                                    event.target.value,
                                  )
                                }
                                disabled={isSaving}
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        <hr className="my-4" />

                        <div className="mb-3">
                          <h3 className="h5 mb-1">Fallback postcard</h3>

                          <p className="text-muted mb-0">
                            These values are shown when there is no featured
                            story available.
                          </p>
                        </div>

                        <Row className="g-3">
                          <Col xs={12}>
                            <Form.Group>
                              <Form.Label>Fallback brand</Form.Label>

                              <Form.Control
                                type="text"
                                value={content.fallbackBrand ?? ""}
                                onChange={(event) =>
                                  updateField(
                                    editor.page,
                                    "fallbackBrand",
                                    event.target.value,
                                  )
                                }
                                disabled={isSaving}
                              />
                            </Form.Group>
                          </Col>

                          <Col xs={12}>
                            <Form.Group>
                              <Form.Label>Fallback title</Form.Label>

                              <Form.Control
                                type="text"
                                value={content.fallbackTitle ?? ""}
                                onChange={(event) =>
                                  updateField(
                                    editor.page,
                                    "fallbackTitle",
                                    event.target.value,
                                  )
                                }
                                disabled={isSaving}
                              />
                            </Form.Group>
                          </Col>

                          <Col xs={12}>
                            <Form.Group>
                              <Form.Label>Fallback description</Form.Label>

                              <Form.Control
                                as="textarea"
                                rows={3}
                                value={content.fallbackDescription ?? ""}
                                onChange={(event) =>
                                  updateField(
                                    editor.page,
                                    "fallbackDescription",
                                    event.target.value,
                                  )
                                }
                                disabled={isSaving}
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </>
                    )}

                    <div className="d-flex justify-content-end mt-4">
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={isSaving}
                      >
                        {isSaving ? (
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
                            <Save className="me-2" />
                            Save changes
                          </>
                        )}
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </>
  );
}
