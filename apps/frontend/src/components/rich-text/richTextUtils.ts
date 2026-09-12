import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  createEditor,
} from "lexical";

import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { AutoLinkNode, LinkNode } from "@lexical/link";

export const richTextNodes = [
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  LinkNode,
  AutoLinkNode,
];

export function isSerializedEditorState(
  value?: string | null,
): value is string {
  if (!value) {
    return false;
  }

  try {
    const parsedValue: unknown = JSON.parse(value);

    if (
      typeof parsedValue !== "object" ||
      parsedValue === null ||
      !("root" in parsedValue)
    ) {
      return false;
    }

    const root = parsedValue.root;

    return (
      typeof root === "object" &&
      root !== null &&
      "children" in root &&
      Array.isArray(root.children)
    );
  } catch {
    return false;
  }
}

export function createEditorStateFromPlainText(value: string): string {
  const editor = createEditor({
    namespace: "RichTextMigration",
    nodes: richTextNodes,
    onError(error) {
      throw error;
    },
  });

  let serializedState = "";

  editor.update(
    () => {
      const root = $getRoot();
      root.clear();

      const lines = value.split(/\r?\n/);

      for (const line of lines) {
        const paragraph = $createParagraphNode();

        if (line) {
          paragraph.append($createTextNode(line));
        }

        root.append(paragraph);
      }
    },
    {
      discrete: true,
      onUpdate() {
        serializedState = JSON.stringify(editor.getEditorState().toJSON());
      },
    },
  );

  return serializedState;
}

// Uses plain text if the saved editor state is missing or invalid
export function resolveInitialEditorState(
  editorState: string | null | undefined,
  fallbackPlainText = "",
): string | undefined {
  if (isSerializedEditorState(editorState)) {
    return editorState;
  }

  if (!fallbackPlainText) {
    return undefined;
  }

  return createEditorStateFromPlainText(fallbackPlainText);
}
