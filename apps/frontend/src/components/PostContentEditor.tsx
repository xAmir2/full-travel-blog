import { useRef, useState } from "react";

import { Alert, Button, Form, Spinner } from "react-bootstrap";

import {
  ArrowDown,
  ArrowUp,
  CloudArrowUp,
  GripVertical,
  Image,
  Plus,
  TextParagraph,
  Trash,
} from "react-bootstrap-icons";

import { getApiErrorMessage } from "../services/apiErrors";
import { uploadPostImage } from "../services/postService";

import type {
  ImageContentBlock,
  PostContentBlock,
  RichTextContent,
  TextContentBlock,
} from "../types/models";

import { RichTextEditor } from "./rich-text/RichTextEditor";

interface PostContentEditorProps {
  blocks: PostContentBlock[];
  disabled?: boolean;
  onChange: (blocks: PostContentBlock[]) => void;
  onImageUploaded: (imageId: string) => void;
  onImageRemoved: (block: ImageContentBlock) => Promise<void>;
}

function createBlockId(): string {
  return crypto.randomUUID();
}

export function PostContentEditor({
  blocks,
  disabled = false,
  onChange,
  onImageUploaded,
  onImageRemoved,
}: PostContentEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);

  const [removingBlockId, setRemovingBlockId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const editorDisabled = disabled || isUploading || removingBlockId !== null;

  function updateTextBlock(blockId: string, richTextContent: RichTextContent) {
    const updatedBlocks = blocks.map((block): PostContentBlock => {
      if (block.id !== blockId || block.type !== "TEXT") {
        return block;
      }

      const updatedBlock: TextContentBlock = {
        ...block,
        content: {
          ...block.content,
          value: richTextContent.plainText,
          editorState: richTextContent.editorState,
        },
      };

      return updatedBlock;
    });

    onChange(updatedBlocks);
  }

  function updateImageAlt(blockId: string, alt: string) {
    const updatedBlocks = blocks.map((block): PostContentBlock => {
      if (block.id !== blockId || block.type !== "IMAGE") {
        return block;
      }

      const updatedBlock: ImageContentBlock = {
        ...block,
        content: {
          ...block.content,
          alt,
        },
      };

      return updatedBlock;
    });

    onChange(updatedBlocks);
  }

  async function removeBlock(block: PostContentBlock) {
    setError(null);
    setRemovingBlockId(block.id);

    try {
      if (block.type === "IMAGE") {
        await onImageRemoved(block);
      }

      onChange(blocks.filter((currentBlock) => currentBlock.id !== block.id));
    } catch (removeError) {
      setError(
        getApiErrorMessage(
          removeError,
          "The content block could not be removed.",
        ),
      );
    } finally {
      setRemovingBlockId(null);
    }
  }

  function moveBlock(currentIndex: number, direction: -1 | 1) {
    const targetIndex = currentIndex + direction;

    if (targetIndex < 0 || targetIndex >= blocks.length) {
      return;
    }

    const reorderedBlocks = [...blocks];
    
    // Swaps the current block with the block above or below it
    [reorderedBlocks[currentIndex], reorderedBlocks[targetIndex]] = [
      reorderedBlocks[targetIndex],
      reorderedBlocks[currentIndex],
    ];

    onChange(reorderedBlocks);
  }

  function addTextBlock() {
    const newBlock: TextContentBlock = {
      id: createBlockId(),
      type: "TEXT",
      content: {
        value: "",
        editorState: "",
      },
    };

    onChange([...blocks, newBlock]);

    setError(null);
  }

  async function handleImageUpload(input: HTMLInputElement) {
    const file = input.files?.[0];

    input.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    const maximumSize = 5 * 1024 * 1024;

    if (file.size > maximumSize) {
      setError("The image must be smaller than 5 MB.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const uploadedImage = await uploadPostImage(file);

      onImageUploaded(uploadedImage.imageId);

      const newBlock: ImageContentBlock = {
        id: createBlockId(),
        type: "IMAGE",
        content: {
          url: uploadedImage.imageUrl,
          imageId: uploadedImage.imageId,
          alt: file.name.replace(/\.[^.]+$/, ""),
        },
      };

      onChange([...blocks, newBlock]);
    } catch (uploadError) {
      setError(
        getApiErrorMessage(uploadError, "The image could not be uploaded."),
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="content-editor">
      {error && (
        <Alert
          variant="danger"
          className="content-editor-alert"
          dismissible={!editorDisabled}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <div className="content-editor-toolbar">
        <div>
          <strong>Add to your story</strong>

          <span>Combine text and images to build the article.</span>
        </div>

        <div className="content-editor-toolbar-actions">
          <Button
            type="button"
            variant="outline-primary"
            disabled={editorDisabled}
            onClick={addTextBlock}
          >
            <Plus />
            <TextParagraph />
            Add text
          </Button>

          <Button
            type="button"
            variant="outline-primary"
            disabled={editorDisabled}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <>
                <Spinner animation="border" size="sm" />
                Uploading…
              </>
            ) : (
              <>
                <CloudArrowUp />
                Upload image
              </>
            )}
          </Button>

          <Form.Control
            ref={fileInputRef}
            className="d-none"
            type="file"
            accept="image/*"
            disabled={editorDisabled}
            onChange={(event) => {
              const input = event.currentTarget;

              if (input instanceof HTMLInputElement) {
                void handleImageUpload(input);
              }
            }}
          />
        </div>
      </div>

      <div className="content-editor-guide">
        <GripVertical />

        <p>
          Your story is read from top to bottom. Use the arrows to arrange each
          section in the order you want.
        </p>
      </div>

      {blocks.length === 0 ? (
        <div className="content-editor-empty">
          <TextParagraph />

          <strong>Your story needs some content.</strong>

          <p>Add a text section or upload an image to begin.</p>

          <Button
            type="button"
            size="sm"
            disabled={editorDisabled}
            onClick={addTextBlock}
          >
            <Plus />
            Add the first text block
          </Button>
        </div>
      ) : (
        <div className="content-block-list">
          {blocks.map((block, index) => {
            const isRemoving = removingBlockId === block.id;

            return (
              <article
                key={block.id}
                className={`content-block ${
                  block.type === "TEXT"
                    ? "content-block-text"
                    : "content-block-image"
                }`}
              >
                <header className="content-block-header">
                  <div className="content-block-identity">
                    <span className="content-block-order">{index + 1}</span>

                    <span className="content-block-type-icon">
                      {block.type === "TEXT" ? <TextParagraph /> : <Image />}
                    </span>

                    <div>
                      <strong>
                        {block.type === "TEXT"
                          ? "Text section"
                          : "Image section"}
                      </strong>

                      <small>
                        {block.type === "TEXT"
                          ? `${block.content.value.length} characters`
                          : "Visual content"}
                      </small>
                    </div>
                  </div>

                  <div className="content-block-actions">
                    <Button
                      type="button"
                      variant="link"
                      aria-label={`Move block ${index + 1} up`}
                      title="Move up"
                      disabled={editorDisabled || index === 0}
                      onClick={() => moveBlock(index, -1)}
                    >
                      <ArrowUp />
                    </Button>

                    <Button
                      type="button"
                      variant="link"
                      aria-label={`Move block ${index + 1} down`}
                      title="Move down"
                      disabled={editorDisabled || index === blocks.length - 1}
                      onClick={() => moveBlock(index, 1)}
                    >
                      <ArrowDown />
                    </Button>

                    <Button
                      type="button"
                      variant="link"
                      className="content-block-delete"
                      aria-label={`Remove block ${index + 1}`}
                      title="Remove block"
                      disabled={editorDisabled}
                      onClick={() => void removeBlock(block)}
                    >
                      {isRemoving ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <Trash />
                      )}
                    </Button>
                  </div>
                </header>

                <div className="content-block-body">
                  {block.type === "TEXT" ? (
                    <Form.Group controlId={`text-block-${block.id}`}>
                      <Form.Label className="visually-hidden">
                        Text for section {index + 1}
                      </Form.Label>

                      <RichTextEditor
                        value={{
                          editorState: block.content.editorState ?? "",
                          plainText: block.content.value,
                        }}
                        variant="full"
                        placeholder="Write this part of your story…"
                        disabled={editorDisabled}
                        ariaLabel={`Text for section ${index + 1}`}
                        onChange={(richTextContent) =>
                          updateTextBlock(block.id, richTextContent)
                        }
                      />
                    </Form.Group>
                  ) : (
                    <div className="content-image-editor">
                      <div className="content-image-preview">
                        <img
                          src={block.content.url}
                          alt={block.content.alt ?? ""}
                        />
                      </div>

                      <div className="content-image-fields">
                        <Form.Group controlId={`image-alt-${block.id}`}>
                          <Form.Label>Image description</Form.Label>

                          <Form.Control
                            value={block.content.alt ?? ""}
                            disabled={editorDisabled}
                            maxLength={250}
                            placeholder="Describe what appears in the image"
                            onChange={(event) =>
                              updateImageAlt(block.id, event.target.value)
                            }
                          />

                          <Form.Text>
                            A useful description helps readers using screen
                            readers understand the image.
                          </Form.Text>
                        </Form.Group>

                        <div className="content-image-information">
                          <Image />

                          <span>
                            This image will appear as part of the published
                            story.
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
