export type PostStatus = "DRAFT" | "PUBLISHED";
export type ContentType = "TEXT" | "IMAGE";
export type ReactionType = "LIKE" | "DISLIKE";

export interface ReactionSummary {
  likeCount: number;
  dislikeCount: number;
  currentUserReaction: ReactionType | null;
}

export interface Permission {
  id: string;
  name: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

export interface User {
  id: string;
  name: string;
  surname: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  role: Role;
}

export type AuthUser = User;

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  name: string;
  surname: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginResponse {
  token: string;
}

export interface TextContent {
  value: string;
  editorState?: string;
}

export interface ImageContent {
  url: string;
  imageId: string;
  alt?: string;
}

export interface TextContentBlock {
  id: string;
  type: "TEXT";
  position?: number;
  content: TextContent;
}

export interface ImageContentBlock {
  id: string;
  type: "IMAGE";
  position?: number;
  content: ImageContent;
}

// A post can contain either text or image blocks
export type PostContentBlock = TextContentBlock | ImageContentBlock;

export interface ContentBlockRequest {
  type: ContentType;
  content: Record<string, unknown>;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  summary: string;
  status: PostStatus;
  author: User;
  contentBlocks: PostContentBlock[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  reactions: ReactionSummary;
}

export interface PageResponse<T> {
  content: T[];
  nextCursor: string | null;
  hasNext: boolean;
  limit: number;
}

export interface PostFormData {
  title: string;
  summary: string;
  contentBlocks: PostContentBlock[];
  status: PostStatus;
}

export interface PostRequest {
  title: string;
  summary: string;
  status: PostStatus;
  contentBlocks: ContentBlockRequest[];
}

export interface PostImageResponse {
  imageUrl: string;
  imageId: string;
}

export interface Comment {
  id: string;
  postId: string;
  parentCommentId: string | null;
  content: string;
  editorState: string | null;
  author: User;
  createdAt: string;
  updatedAt: string;
  reactions: ReactionSummary;
  replies: Comment[];
}

export interface CommentContentInput {
  content: string;
  editorState: string;
}

export interface ProfileDataForm {
  name: string;
  surname: string;
  username: string;
  email: string;
}

export interface PasswordUpdateForm {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface RoleFormData {
  name: string;
  permissionIds: string[];
}

export type NotificationType =
  | "POST_LIKED"
  | "POST_DISLIKED"
  | "COMMENT_LIKED"
  | "COMMENT_DISLIKED"
  | "COMMENT_REPLIED";

export interface AppNotification {
  id: string;
  notificationType: NotificationType;
  message: string;
  triggeredBy: User;
  postId: string | null;
  postSlug: string | null;
  commentId: string | null;
  read: boolean;
  createdAt: string;
}

export interface UnreadNotificationCount {
  unreadCount: number;
}

export type RichTextEditorVariant = "compact" | "full";

export interface RichTextContent {
  editorState: string;
  plainText: string;
}

export type HeroPage = "HOME" | "JOURNAL";

export interface PageHeroContent {
  page: HeroPage;
  preTitle: string;
  title: string;
  description: string;
  primaryButtonLabel: string | null;
  guestButtonLabel: string | null;
  note: string | null;
  featuredLabel: string | null;
  readStoryLabel: string | null;
  fallbackBrand: string | null;
  fallbackTitle: string | null;
  fallbackDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PageHeroContentInput {
  preTitle: string;
  title: string;
  description: string;
  primaryButtonLabel: string | null;
  guestButtonLabel: string | null;
  note: string | null;
  featuredLabel: string | null;
  readStoryLabel: string | null;
  fallbackBrand: string | null;
  fallbackTitle: string | null;
  fallbackDescription: string | null;
}
