import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";

import { richTextTheme } from "./richTextTheme";
import { resolveInitialEditorState, richTextNodes } from "./richTextUtils";

interface RichTextViewerProps {
  editorState?: string | null;
  fallbackPlainText?: string;
  className?: string;
  ariaLabel?: string;
}

export function RichTextViewer({
  editorState,
  fallbackPlainText = "",
  className = "",
  ariaLabel = "Rich text content",
}: RichTextViewerProps) {
  const resolvedEditorState = resolveInitialEditorState(
    editorState,
    fallbackPlainText,
  );

  if (!resolvedEditorState && !fallbackPlainText) {
    return null;
  }

  const initialConfig = {
    namespace: "TravelBlogRichTextViewer",
    theme: richTextTheme,
    nodes: richTextNodes,
    editable: false,
    editorState: resolvedEditorState,
    onError(error: Error) {
      throw error;
    },
  };

  return (
    <LexicalComposer
      key={resolvedEditorState ?? fallbackPlainText}
      initialConfig={initialConfig}
    >
      <div className={`rich-text-viewer ${className}`.trim()}>
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className="rich-text-viewer-content"
              aria-label={ariaLabel}
              readOnly
            />
          }
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />

        <ListPlugin />
        <LinkPlugin />
      </div>
    </LexicalComposer>
  );
}
