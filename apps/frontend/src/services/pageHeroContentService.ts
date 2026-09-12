import type {
  HeroPage,
  PageHeroContent,
  PageHeroContentInput,
} from "../types/models";

import { apiClient } from "./apiClient";

export async function getPageHeroContent(
  page: HeroPage,
): Promise<PageHeroContent> {
  const response = await apiClient.get<PageHeroContent>(`/page-heroes/${page}`);

  return response.data;
}

export async function updatePageHeroContent(
  page: HeroPage,
  content: PageHeroContentInput,
): Promise<PageHeroContent> {
  const response = await apiClient.put<PageHeroContent>(
    `/page-heroes/${page}`,
    content,
  );

  return response.data;
}
