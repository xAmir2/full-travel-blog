import { useEffect, useRef } from "react";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";

import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  type EditorState,
} from "lexical";

import type {
  RichTextContent,
  RichTextEditorVariant,
} from "../../types/models";

import { RichTextToolbar } from "./RichTextToolbar";
import { richTextTheme } from "./richTextTheme";
import { resolveInitialEditorState, richTextNodes } from "./richTextUtils";

interface RichTextEditorProps {
  value: RichTextContent;
  onChange: (value: RichTextContent) => void;
  variant?: RichTextEditorVariant;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  ariaLabel?: string;
}

export function RichTextEditor({
  value,
  onChange,
  variant = "compact",
  placeholder = "Write something…",
  disabled = false,
  maxLength,
  ariaLabel = "Rich text editor",
}: RichTextEditorProps) {
  const initialEditorState = resolveInitialEditorState(
    value.editorState,
    value.plainText,
  );

  const initialConfig = {
    namespace:
      variant === "full"
        ? "TravelBlogFullRichTextEditor"
        : "TravelBlogCompactRichTextEditor",
    theme: richTextTheme,
    nodes: richTextNodes,
    editable: !disabled,
    editorState: initialEditorState,
    onError(error: Error) {
      throw error;
    },
  };

  function handleChange(editorState: EditorState) {
    editorState.read(() => {
      const plainText = $getRoot().getTextContent();

      if (maxLength !== undefined && plainText.length > maxLength) {
        return;
      }

      // Stores both the formatted editor state and plain text fallback
      onChange({
        editorState: JSON.stringify(editorState.toJSON()),
        plainText,
      });
    });
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div
        className={`rich-text-editor rich-text-editor-${variant} ${
          disabled ? "rich-text-editor-disabled" : ""
        }`}
      >
        {!disabled && <RichTextToolbar variant={variant} />}

        <div className="rich-text-editor-content">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="rich-text-content-editable"
                aria-label={ariaLabel}
              />
            }
            placeholder={
              <div className="rich-text-placeholder">{placeholder}</div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />

          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />

          <OnChangePlugin onChange={handleChange} ignoreSelectionChange />

          <EditorSynchronizationPlugin
            editorState={value.editorState}
            plainText={value.plainText}
          />
        </div>

        {maxLength !== undefined && (
          <div className="rich-text-character-count">
            {value.plainText.length}/{maxLength}
          </div>
        )}
      </div>
    </LexicalComposer>
  );
}

interface EditorSynchronizationPluginProps {
  editorState: string;
  plainText: string;
}

// Keeps Lexical in sync when the value is changed outside the editor
function EditorSynchronizationPlugin({
  editorState,
  plainText,
}: EditorSynchronizationPluginProps) {
  const [editor] = useLexicalComposerContext();
  const previousEditorStateRef = useRef(editorState);
  const previousPlainTextRef = useRef(plainText);

  useEffect(() => {
    const editorStateChanged = previousEditorStateRef.current !== editorState;

    const plainTextChanged = previousPlainTextRef.current !== plainText;

    previousEditorStateRef.current = editorState;
    previousPlainTextRef.current = plainText;

    if (!editorStateChanged && !plainTextChanged) {
      return;
    }

    const currentSerializedState = JSON.stringify(
      editor.getEditorState().toJSON(),
    );

    if (editorState && currentSerializedState === editorState) {
      return;
    }

    if (editorState) {
      try {
        const parsedState = editor.parseEditorState(editorState);

        editor.setEditorState(parsedState);
        return;
      } catch {
        // Fall through to the plain-text fallback.
      }
    }

    editor.update(() => {
      const root = $getRoot();
      root.clear();

      const lines = plainText.split(/\r?\n/);

      for (const line of lines) {
        const paragraph = $createParagraphNode();

        if (line) {
          paragraph.append($createTextNode(line));
        }

        root.append(paragraph);
      }
    });
  }, [editor, editorState, plainText]);

  return null;
}
