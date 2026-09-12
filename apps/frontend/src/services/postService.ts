import type {
  PageResponse,
  Post,
  PostContentBlock,
  PostFormData,
  PostImageResponse,
  PostRequest,
} from "../types/models";

import { apiClient } from "./apiClient";

export interface PublishedPostsOptions {
  limit?: number;
  cursor?: string | null;
  search?: string;
}

// Converts the form data to the structure expected by the backend
function toPostRequest(formData: PostFormData): PostRequest {
  return {
    title: formData.title.trim(),
    summary: formData.summary.trim(),
    status: formData.status,

    contentBlocks: formData.contentBlocks.map((block) => ({
      type: block.type,
      content: { ...block.content },
    })),
  };
}

export async function getPublishedPosts({
  limit = 9,
  cursor = null,
  search = "",
}: PublishedPostsOptions = {}): Promise<PageResponse<Post>> {
  const normalizedSearch = search.trim();

  const response = await apiClient.get<PageResponse<Post>>("/posts", {
    params: {
      limit,
      ...(cursor ? { cursor } : {}),
      ...(normalizedSearch ? { search: normalizedSearch } : {}),
    },
  });

  return response.data;
}

export async function getPublishedPostBySlug(slug: string): Promise<Post> {
  const response = await apiClient.get<Post>(
    `/posts/slug/${encodeURIComponent(slug)}`,
  );

  return response.data;
}

export async function getAllPosts(): Promise<Post[]> {
  const response = await apiClient.get<Post[]>("/posts/manage");

  return response.data;
}

export async function getPostById(id: string): Promise<Post> {
  const response = await apiClient.get<Post>(`/posts/manage/${id}`);

  return response.data;
}

export async function getMyPosts(): Promise<Post[]> {
  const response = await apiClient.get<Post[]>("/posts/me");

  return response.data;
}

export async function createPost(formData: PostFormData): Promise<Post> {
  const response = await apiClient.post<Post>(
    "/posts",
    toPostRequest(formData),
  );

  return response.data;
}

export async function updatePost(
  id: string,
  formData: PostFormData,
): Promise<Post> {
  const response = await apiClient.put<Post>(
    `/posts/${id}`,
    toPostRequest(formData),
  );

  return response.data;
}

export async function deletePost(id: string): Promise<void> {
  await apiClient.delete(`/posts/${id}`);
}

export async function uploadPostImage(image: File): Promise<PostImageResponse> {
  const formData = new FormData();

  formData.append("image", image);

  const response = await apiClient.post<PostImageResponse>(
    "/posts/images",
    formData,
  );

  return response.data;
}

export async function deletePostImage(imageId: string): Promise<void> {
  await apiClient.delete("/posts/images", {
    params: {
      imageId,
    },
  });
}

export function mapResponseBlocks(
  blocks: PostContentBlock[],
): PostContentBlock[] {
  return [...blocks].sort(
    (firstBlock, secondBlock) =>
      (firstBlock.position ?? 0) - (secondBlock.position ?? 0),
  );
}
