import type { EditorThemeClasses } from "lexical";

export const richTextTheme: EditorThemeClasses = {
  paragraph: "rich-text-paragraph",
  quote: "rich-text-quote",

  heading: {
    h1: "rich-text-heading rich-text-heading-h1",
    h2: "rich-text-heading rich-text-heading-h2",
    h3: "rich-text-heading rich-text-heading-h3",
  },

  list: {
    nested: {
      listitem: "rich-text-nested-list-item",
    },
    ol: "rich-text-list rich-text-list-ordered",
    ul: "rich-text-list rich-text-list-unordered",
    listitem: "rich-text-list-item",
  },

  link: "rich-text-link",

  text: {
    bold: "rich-text-bold",
    italic: "rich-text-italic",
    underline: "rich-text-underline",
    strikethrough: "rich-text-strikethrough",
    underlineStrikethrough: "rich-text-underline-strikethrough",
  },
};
