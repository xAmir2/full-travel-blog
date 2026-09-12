import type { Comment, CommentContentInput } from "../types/models";

import { apiClient } from "./apiClient";

function createCommentPayload(
  input: string | CommentContentInput,
  parentCommentId?: string,
) {
  const content =
    typeof input === "string" ? input.trim() : input.content.trim();

  const editorState = typeof input === "string" ? "" : input.editorState.trim();

  return {
    content,
    ...(editorState ? { editorState } : {}),
    ...(parentCommentId ? { parentCommentId } : {}),
  };
}

export async function getCommentsForPost(postId: string): Promise<Comment[]> {
  const response = await apiClient.get<Comment[]>(`/posts/${postId}/comments`);

  return response.data;
}

export async function createComment(
  postId: string,
  input: string | CommentContentInput,
  parentCommentId?: string,
): Promise<Comment> {
  const response = await apiClient.post<Comment>(
    `/posts/${postId}/comments`,
    createCommentPayload(input, parentCommentId),
  );

  return response.data;
}

export async function getMyComments(): Promise<Comment[]> {
  const response = await apiClient.get<Comment[]>("/comments/me");

  return response.data;
}

export async function updateComment(
  commentId: string,
  input: string | CommentContentInput,
): Promise<Comment> {
  const response = await apiClient.put<Comment>(
    `/comments/${commentId}`,
    createCommentPayload(input),
  );

  return response.data;
}

export async function deleteComment(commentId: string): Promise<void> {
  await apiClient.delete(`/comments/${commentId}`);
}
