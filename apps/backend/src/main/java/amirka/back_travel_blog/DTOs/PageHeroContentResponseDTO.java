package amirka.back_travel_blog.DTOs;

import amirka.back_travel_blog.enums.HeroPage;

import java.time.LocalDateTime;

public record PageHeroContentResponseDTO(
        HeroPage page,
        String preTitle,
        String title,
        String description,
        String primaryButtonLabel,
        String guestButtonLabel,
        String note,
        String featuredLabel,
        String readStoryLabel,
        String fallbackBrand,
        String fallbackTitle,
        String fallbackDescription,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
