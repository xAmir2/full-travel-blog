import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type SyntheticEvent,
} from "react";

import { Button, Form, Modal } from "react-bootstrap";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import {
  $getSelection,
  $isRangeSelection,
  $setSelection,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  type ElementFormatType,
  type RangeSelection,
} from "lexical";

import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
  type HeadingTagType,
} from "@lexical/rich-text";

import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";

import { $createParagraphNode } from "lexical";
import { $setBlocksType } from "@lexical/selection";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { mergeRegister } from "@lexical/utils";

import {
  BlockquoteLeft,
  Justify,
  JustifyLeft,
  JustifyRight,
  Link45deg,
  ListOl,
  ListUl,
  TextCenter,
  TypeBold,
  TypeItalic,
  TypeUnderline,
} from "react-bootstrap-icons";

import type { RichTextEditorVariant } from "../../types/models";

type BlockType = "paragraph" | "h1" | "h2" | "h3" | "quote";

interface RichTextToolbarProps {
  variant: RichTextEditorVariant;
}

export function RichTextToolbar({ variant }: RichTextToolbarProps) {
  const [editor] = useLexicalComposerContext();

  const [blockType, setBlockType] = useState<BlockType>("paragraph");

  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [isUnorderedList, setIsUnorderedList] = useState(false);
  const [isOrderedList, setIsOrderedList] = useState(false);

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);

  const savedSelectionRef = useRef<RangeSelection | null>(null);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();

    if (!$isRangeSelection(selection)) {
      return;
    }

    setIsBold(selection.hasFormat("bold"));
    setIsItalic(selection.hasFormat("italic"));
    setIsUnderline(selection.hasFormat("underline"));

    const anchorNode = selection.anchor.getNode();
    const parentNode = anchorNode.getParent();

    setIsLink($isLinkNode(anchorNode) || $isLinkNode(parentNode));

    const topLevelElement =
      anchorNode.getKey() === "root"
        ? anchorNode
        : anchorNode.getTopLevelElementOrThrow();

    setIsUnorderedList(false);
    setIsOrderedList(false);

    if ($isHeadingNode(topLevelElement)) {
      const headingTag = topLevelElement.getTag();

      if (headingTag === "h1" || headingTag === "h2" || headingTag === "h3") {
        setBlockType(headingTag);
      } else {
        setBlockType("paragraph");
      }

      return;
    }

    if ($isQuoteNode(topLevelElement)) {
      setBlockType("quote");
      return;
    }

    if ($isListNode(topLevelElement)) {
      const listType = topLevelElement.getListType();

      setBlockType("paragraph");
      setIsUnorderedList(listType === "bullet");
      setIsOrderedList(listType === "number");

      return;
    }

    setBlockType("paragraph");
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(updateToolbar);
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        1,
      ),
    );
  }, [editor, updateToolbar]);

  function formatText(format: "bold" | "italic" | "underline") {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  }

  function formatParagraph() {
    editor.update(() => {
      const selection = $getSelection();

      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  }

  function formatHeading(tag: HeadingTagType) {
    editor.update(() => {
      const selection = $getSelection();

      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(tag));
      }
    });
  }

  function formatQuote() {
    editor.update(() => {
      const selection = $getSelection();

      if (!$isRangeSelection(selection)) {
        return;
      }

      if (blockType === "quote") {
        $setBlocksType(selection, () => $createParagraphNode());
      } else {
        $setBlocksType(selection, () => $createQuoteNode());
      }
    });
  }

  function toggleUnorderedList() {
    if (isUnorderedList) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    }
  }

  function toggleOrderedList() {
    if (isOrderedList) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    }
  }

  function toggleLink() {
    if (isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
      return;
    }

    editor.getEditorState().read(() => {
      const selection = $getSelection();

      // Saves the selected text because opening the modal removes the editor focus
      savedSelectionRef.current = $isRangeSelection(selection)
        ? selection.clone()
        : null;
    });

    if (!savedSelectionRef.current) {
      return;
    }

    setLinkUrl("");
    setLinkError(null);
    setShowLinkModal(true);
  }

  function closeLinkModal() {
    setShowLinkModal(false);
    setLinkUrl("");
    setLinkError(null);
    savedSelectionRef.current = null;

    editor.focus();
  }

  function handleInsertLink(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();

    const enteredUrl = linkUrl.trim();
    const savedSelection = savedSelectionRef.current;

    if (!enteredUrl || !savedSelection) {
      setLinkError("Enter a valid URL.");
      return;
    }

    const normalizedUrl = /^[a-z][a-z\d+.-]*:/i.test(enteredUrl)
      ? enteredUrl
      : `https://${enteredUrl}`;

    try {
      const parsedUrl = new URL(normalizedUrl);

      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        setLinkError("Only HTTP and HTTPS links are supported.");
        return;
      }
    } catch {
      setLinkError("Enter a valid URL.");
      return;
    }

    editor.update(
      () => {
        $setSelection(savedSelection.clone());
      },
      {
        discrete: true,
      },
    );

    editor.dispatchCommand(TOGGLE_LINK_COMMAND, normalizedUrl);

    setShowLinkModal(false);
    setLinkUrl("");
    setLinkError(null);
    savedSelectionRef.current = null;

    editor.focus();
  }

  function formatAlignment(alignment: ElementFormatType) {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignment);
  }

  function handleBlockChange(value: BlockType) {
    setBlockType(value);

    if (value === "paragraph") {
      formatParagraph();
      return;
    }

    if (value === "quote") {
      formatQuote();
      return;
    }

    formatHeading(value);
  }

  return (
    <div
      className={`rich-text-toolbar rich-text-toolbar-${variant}`}
      role="toolbar"
      aria-label="Text formatting"
    >
      {variant === "full" && (
        <select
          className="rich-text-block-selector"
          aria-label="Text block style"
          value={blockType}
          onChange={(event) =>
            handleBlockChange(event.target.value as BlockType)
          }
        >
          <option value="paragraph">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="quote">Quote</option>
        </select>
      )}

      <div className="rich-text-toolbar-group">
        <ToolbarButton
          label="Bold"
          active={isBold}
          onClick={() => formatText("bold")}
        >
          <TypeBold />
        </ToolbarButton>

        <ToolbarButton
          label="Italic"
          active={isItalic}
          onClick={() => formatText("italic")}
        >
          <TypeItalic />
        </ToolbarButton>

        <ToolbarButton
          label="Underline"
          active={isUnderline}
          onClick={() => formatText("underline")}
        >
          <TypeUnderline />
        </ToolbarButton>

        <ToolbarButton
          label={isLink ? "Remove link" : "Add link"}
          active={isLink}
          onClick={toggleLink}
        >
          <Link45deg />
        </ToolbarButton>
      </div>

      <div className="rich-text-toolbar-group">
        <ToolbarButton
          label="Bulleted list"
          active={isUnorderedList}
          onClick={toggleUnorderedList}
        >
          <ListUl />
        </ToolbarButton>

        <ToolbarButton
          label="Numbered list"
          active={isOrderedList}
          onClick={toggleOrderedList}
        >
          <ListOl />
        </ToolbarButton>

        <ToolbarButton
          label="Quote"
          active={blockType === "quote"}
          onClick={formatQuote}
        >
          <BlockquoteLeft />
        </ToolbarButton>
      </div>

      {variant === "full" && (
        <div className="rich-text-toolbar-group">
          <ToolbarButton
            label="Align left"
            onClick={() => formatAlignment("left")}
          >
            <JustifyLeft />
          </ToolbarButton>

          <ToolbarButton
            label="Align center"
            onClick={() => formatAlignment("center")}
          >
            <TextCenter />
          </ToolbarButton>

          <ToolbarButton
            label="Align right"
            onClick={() => formatAlignment("right")}
          >
            <JustifyRight />
          </ToolbarButton>

          <ToolbarButton
            label="Justify"
            onClick={() => formatAlignment("justify")}
          >
            <Justify />
          </ToolbarButton>
        </div>
      )}

      <Modal
        show={showLinkModal}
        onHide={closeLinkModal}
        centered
        className="rich-text-link-modal"
        restoreFocus={false}
      >
        <Form onSubmit={handleInsertLink}>
          <Modal.Header closeButton>
            <Modal.Title>Add a link</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form.Group controlId="rich-text-link-url">
              <Form.Label>Link address</Form.Label>

              <Form.Control
                type="text"
                inputMode="url"
                autoFocus
                value={linkUrl}
                isInvalid={linkError !== null}
                placeholder="https://example.com"
                onChange={(event) => {
                  setLinkUrl(event.target.value);

                  if (linkError) {
                    setLinkError(null);
                  }
                }}
              />

              <Form.Control.Feedback type="invalid">
                {linkError}
              </Form.Control.Feedback>

              <Form.Text>
                Select the text you want to link before opening this window.
              </Form.Text>
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button
              type="button"
              variant="outline-secondary"
              onClick={closeLinkModal}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={!linkUrl.trim()}>
              Add link
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

interface ToolbarButtonProps {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function ToolbarButton({
  label,
  active = false,
  onClick,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      className={`rich-text-toolbar-button ${active ? "active" : ""}`}
      aria-label={label}
      aria-pressed={active}
      title={label}
      onMouseDown={(event) => {
        event.preventDefault();
      }}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
