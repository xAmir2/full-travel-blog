import { useEffect, useRef, useState } from "react";

import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Row,
  Spinner,
} from "react-bootstrap";

import {
  ArrowLeft,
  CheckCircle,
  FileEarmarkText,
  InfoCircle,
  JournalCheck,
  Lightbulb,
} from "react-bootstrap-icons";

import { useNavigate, useParams } from "react-router-dom";

import { PostContentEditor } from "../components/PostContentEditor";

import { getApiErrorMessage } from "../services/apiErrors";

import {
  createPost,
  deletePostImage,
  getPostById,
  updatePost,
} from "../services/postService";
import { useConfirmation } from "../context/ConfirmationContext";

import type {
  ImageContentBlock,
  PostFormData,
  PostStatus,
} from "../types/models";

type SavingAction = PostStatus | "CANCEL" | null;

// Creates a temporary ID to manage a block before the post is saved
function createTemporaryId(): string {
  return crypto.randomUUID();
}

function createEmptyForm(): PostFormData {
  return {
    title: "",
    summary: "",
    contentBlocks: [
      {
        id: createTemporaryId(),
        type: "TEXT",
        content: {
          value: "",
        },
      },
    ],
    status: "DRAFT",
  };
}

export function AdminPostFormPage() {
  const { postId } = useParams<{
    postId: string;
  }>();

  const navigate = useNavigate();

  const isEditing = Boolean(postId);

  // Keeps track of uploaded images until the post is saved
  const pendingImageIdsRef = useRef<Set<string>>(new Set());
  const wasSavedRef = useRef(false);

  const [formData, setFormData] = useState<PostFormData>(createEmptyForm);

  const [isLoading, setIsLoading] = useState(isEditing);
  const [savingAction, setSavingAction] = useState<SavingAction>(null);

  const [error, setError] = useState<string | null>(null);

  const isSaving = savingAction !== null;
  const { requestConfirmation } = useConfirmation();

  useEffect(() => {
    if (!postId) {
      return;
    }

    let isActive = true;

    async function loadPost() {
      try {
        const post = await getPostById(postId!);

        if (!isActive) {
          return;
        }

        setFormData({
          title: post.title,
          summary: post.summary,
          status: post.status,
          contentBlocks: [...post.contentBlocks].sort(
            (firstBlock, secondBlock) =>
              (firstBlock.position ?? 0) - (secondBlock.position ?? 0),
          ),
        });
      } catch (loadError) {
        if (isActive) {
          setError(
            getApiErrorMessage(loadError, "The post could not be loaded."),
          );
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
  }, [postId]);

  useEffect(() => {
    const pendingImageIds = pendingImageIdsRef.current;

    // Removes newly uploaded images if the user leaves without saving
    return () => {
      if (wasSavedRef.current) {
        return;
      }

      const imageIdsToDelete = [...pendingImageIds];

      pendingImageIds.clear();

      for (const imageId of imageIdsToDelete) {
        void deletePostImage(imageId).catch(() => undefined);
      }
    };
  }, []);

  function updateField(field: "title" | "summary", value: string) {
    setFormData((currentFormData) => ({
      ...currentFormData,
      [field]: value,
    }));

    if (error) {
      setError(null);
    }
  }

  function registerUploadedImage(imageId: string) {
    pendingImageIdsRef.current.add(imageId);
  }

  async function handleImageRemoved(block: ImageContentBlock) {
    const imageId = block.content.imageId;

    if (!pendingImageIdsRef.current.has(imageId)) {
      return;
    }

    await deletePostImage(imageId);

    pendingImageIdsRef.current.delete(imageId);
  }

  async function cleanupPendingImages() {
    const pendingImageIds = [...pendingImageIdsRef.current];

    pendingImageIdsRef.current.clear();

    await Promise.allSettled(
      pendingImageIds.map((imageId) => deletePostImage(imageId)),
    );
  }

  async function handleCancel() {
    setSavingAction("CANCEL");
    setError(null);

    try {
      await cleanupPendingImages();
      navigate("/admin/posts");
    } catch (cleanupError) {
      setError(
        getApiErrorMessage(
          cleanupError,
          "The editor could not be closed cleanly.",
        ),
      );

      setSavingAction(null);
    }
  }

  function validateForm(): string | null {
    if (!formData.title.trim()) {
      return "The title is required.";
    }

    if (!formData.summary.trim()) {
      return "The summary is required.";
    }

    if (formData.contentBlocks.length === 0) {
      return "At least one content block is required.";
    }

    const containsEmptyTextBlock = formData.contentBlocks.some(
      (block) => block.type === "TEXT" && !block.content.value.trim(),
    );

    if (containsEmptyTextBlock) {
      return "Text blocks cannot be empty.";
    }

    return null;
  }

  async function handleSave(status: PostStatus) {
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return;
    }
    const confirmed = await requestConfirmation({
      title:
        status === "PUBLISHED"
          ? isEditing
            ? "Update published story?"
            : "Publish this story?"
          : isEditing
            ? "Save draft changes?"
            : "Save this draft?",
      message:
        status === "PUBLISHED"
          ? "The latest version of this story will be visible in the public journal."
          : "This version will be saved as a draft and will not be publicly visible.",
      confirmLabel: status === "PUBLISHED" ? "Publish story" : "Save draft",
    });

    if (!confirmed) {
      return;
    }

    const submittedFormData: PostFormData = {
      title: formData.title.trim(),
      summary: formData.summary.trim(),
      status,
      contentBlocks: formData.contentBlocks,
    };

    setSavingAction(status);
    setError(null);

    try {
      if (postId) {
        await updatePost(postId, submittedFormData);
      } else {
        await createPost(submittedFormData);
      }

      wasSavedRef.current = true;
      pendingImageIdsRef.current.clear();

      navigate("/admin/posts");
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, "The post could not be saved."));

      setSavingAction(null);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }

  if (isLoading) {
    return (
      <div className="admin-editor-loading">
        <Spinner animation="border" role="status" />

        <p>Opening your story…</p>
      </div>
    );
  }

  return (
    <div className="admin-post-editor-page">
      <header className="admin-page-header admin-editor-header">
        <div>
          <span className="admin-page-eyebrow">
            {isEditing ? "Story editor" : "New story"}
          </span>

          <h1>{isEditing ? "Edit your story" : "Create a new story"}</h1>

          <p>
            Shape your article with text and images, then save it as a draft or
            share it with your readers.
          </p>
        </div>

        <Button
          type="button"
          variant="outline-secondary"
          className="admin-editor-back"
          disabled={isSaving}
          onClick={() => void handleCancel()}
        >
          <ArrowLeft />
          Back to posts
        </Button>
      </header>

      {error && (
        <Alert
          variant="danger"
          className="admin-feedback-alert"
          dismissible={!isSaving}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <Form>
        <Row className="g-4">
          <Col xl={8}>
            <div className="admin-editor-main">
              <Card className="admin-editor-card">
                <Card.Body>
                  <div className="admin-editor-section-heading">
                    <span className="admin-editor-section-icon">
                      <FileEarmarkText />
                    </span>

                    <div>
                      <h2>Story details</h2>

                      <p>
                        Give readers a clear title and a short introduction.
                      </p>
                    </div>
                  </div>

                  <Form.Group className="mb-4" controlId="post-title">
                    <div className="admin-editor-label-row">
                      <Form.Label>Title</Form.Label>

                      <small>{formData.title.length}/200</small>
                    </div>

                    <Form.Control
                      required
                      maxLength={200}
                      placeholder="Where did the journey take you?"
                      value={formData.title}
                      disabled={isSaving}
                      onChange={(event) =>
                        updateField("title", event.target.value)
                      }
                    />
                  </Form.Group>

                  <Form.Group controlId="post-summary">
                    <div className="admin-editor-label-row">
                      <Form.Label>Summary</Form.Label>

                      <small>{formData.summary.length}/500</small>
                    </div>

                    <Form.Control
                      as="textarea"
                      rows={4}
                      required
                      maxLength={500}
                      placeholder="Offer readers a short glimpse of the story…"
                      value={formData.summary}
                      disabled={isSaving}
                      onChange={(event) =>
                        updateField("summary", event.target.value)
                      }
                    />

                    <Form.Text>
                      This appears on the homepage and journal cards.
                    </Form.Text>
                  </Form.Group>
                </Card.Body>
              </Card>

              <Card className="admin-editor-card">
                <Card.Body>
                  <div className="admin-editor-section-heading">
                    <span className="admin-editor-section-icon">
                      <JournalCheck />
                    </span>

                    <div>
                      <h2>Story content</h2>

                      <p>
                        Arrange text and images in the order readers should
                        experience them.
                      </p>
                    </div>
                  </div>

                  <PostContentEditor
                    blocks={formData.contentBlocks}
                    disabled={isSaving}
                    onImageUploaded={registerUploadedImage}
                    onImageRemoved={handleImageRemoved}
                    onChange={(contentBlocks) =>
                      setFormData((currentFormData) => ({
                        ...currentFormData,
                        contentBlocks,
                      }))
                    }
                  />
                </Card.Body>
              </Card>
            </div>
          </Col>

          <Col xl={4}>
            <aside className="admin-editor-sidebar">
              <Card className="admin-editor-card">
                <Card.Body>
                  <div className="admin-publish-heading">
                    <div>
                      <span className="admin-panel-eyebrow">Publication</span>

                      <h2>Save your work</h2>
                    </div>

                    <Badge
                      className={`admin-status-badge ${
                        formData.status === "PUBLISHED" ? "published" : "draft"
                      }`}
                    >
                      {formData.status === "PUBLISHED" ? "Published" : "Draft"}
                    </Badge>
                  </div>

                  <p className="admin-publish-description">
                    Drafts remain private. Published stories become visible in
                    the public journal.
                  </p>

                  <div className="admin-publish-actions">
                    <Button
                      type="button"
                      variant="outline-secondary"
                      disabled={isSaving}
                      onClick={() => void handleSave("DRAFT")}
                    >
                      {savingAction === "DRAFT" ? (
                        <>
                          <Spinner animation="border" size="sm" />
                          Saving draft…
                        </>
                      ) : (
                        <>
                          <FileEarmarkText />
                          Save as draft
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      disabled={isSaving}
                      onClick={() => void handleSave("PUBLISHED")}
                    >
                      {savingAction === "PUBLISHED" ? (
                        <>
                          <Spinner animation="border" size="sm" />
                          Publishing…
                        </>
                      ) : (
                        <>
                          <CheckCircle />
                          {isEditing && formData.status === "PUBLISHED"
                            ? "Update published story"
                            : "Publish story"}
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="link"
                      className="admin-editor-cancel"
                      disabled={isSaving}
                      onClick={() => void handleCancel()}
                    >
                      {savingAction === "CANCEL" ? (
                        <>
                          <Spinner animation="border" size="sm" />
                          Closing editor…
                        </>
                      ) : (
                        "Cancel and return"
                      )}
                    </Button>
                  </div>
                </Card.Body>
              </Card>

              <Card className="admin-editor-tip-card">
                <Card.Body>
                  <div className="admin-editor-tip-heading">
                    <Lightbulb />

                    <strong>A good travel story</strong>
                  </div>

                  <ul>
                    <li>Begins with a clear, inviting title.</li>
                    <li>Uses short paragraphs that are comfortable to read.</li>
                    <li>Places images where they support the story.</li>
                    <li>Includes image descriptions for accessibility.</li>
                  </ul>
                </Card.Body>
              </Card>

              <div className="admin-editor-note">
                <InfoCircle />

                <p>
                  Uploaded images that are not saved with the story are
                  automatically removed.
                </p>
              </div>
            </aside>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
