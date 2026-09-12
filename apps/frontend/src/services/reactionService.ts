import type { ReactionSummary, ReactionType } from "../types/models";

import { apiClient } from "./apiClient";

interface ReactionRequest {
  reactionType: ReactionType;
}

export async function reactToPost(
  postId: string,
  reactionType: ReactionType,
): Promise<ReactionSummary> {
  const response = await apiClient.post<ReactionSummary>(
    `/posts/${postId}/reactions`,
    {
      reactionType,
    } satisfies ReactionRequest,
  );

  return response.data;
}

export async function reactToComment(
  commentId: string,
  reactionType: ReactionType,
): Promise<ReactionSummary> {
  const response = await apiClient.post<ReactionSummary>(
    `/comments/${commentId}/reactions`,
    {
      reactionType,
    } satisfies ReactionRequest,
  );

  return response.data;
}
