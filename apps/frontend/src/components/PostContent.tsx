import type { Post } from "../types/models";
import { RichTextViewer } from "./rich-text/RichTextViewer";

interface PostContentProps {
  post: Post;
}

export function PostContent({ post }: PostContentProps) {
  // Copies and sorts the blocks without changing the original post
  const sortedBlocks = [...post.contentBlocks].sort(
    (firstBlock, secondBlock) =>
      (firstBlock.position ?? 0) - (secondBlock.position ?? 0),
  );

  if (sortedBlocks.length === 0) {
    return (
      <p className="text-secondary">
        This post does not contain any content yet.
      </p>
    );
  }

  return (
    <div className="post-content">
      {sortedBlocks.map((block) => {
        if (block.type === "TEXT") {
          return (
            <RichTextViewer
              key={block.id}
              editorState={block.content.editorState}
              fallbackPlainText={block.content.value}
              className="post-rich-text-block"
              ariaLabel={`Content from ${post.title}`}
            />
          );
        }

        return (
          <figure key={block.id} className="my-4">
            <img
              className="article-inline-image"
              src={block.content.url}
              alt={block.content.alt ?? ""}
            />

            {block.content.alt && (
              <figcaption className="mt-2 text-center small text-secondary">
                {block.content.alt}
              </figcaption>
            )}
          </figure>
        );
      })}
    </div>
  );
}
