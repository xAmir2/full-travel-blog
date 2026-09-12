package amirka.back_travel_blog.DTOs;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PageHeroContentDTO(
        @NotBlank(message = "The pre-title is required.")
        @Size(max = 120, message = "The pre-title cannot exceed 120 characters.")
        String preTitle,

        @NotBlank(message = "The title is required.")
        @Size(max = 255, message = "The title cannot exceed 255 characters.")
        String title,

        @NotBlank(message = "The description is required.")
        @Size(max = 500, message = "The description cannot exceed 500 characters.")
        String description,

        @Size(max = 80, message = "The primary button label cannot exceed 80 characters.")
        String primaryButtonLabel,

        @Size(max = 80, message = "The guest button label cannot exceed 80 characters.")
        String guestButtonLabel,

        @Size(max = 250, message = "The note cannot exceed 250 characters.")
        String note,

        @Size(max = 80, message = "The featured label cannot exceed 80 characters.")
        String featuredLabel,

        @Size(max = 80, message = "The read-story label cannot exceed 80 characters.")
        String readStoryLabel,

        @Size(max = 100, message = "The fallback brand cannot exceed 100 characters.")
        String fallbackBrand,

        @Size(max = 255, message = "The fallback title cannot exceed 255 characters.")
        String fallbackTitle,

        @Size(max = 500, message = "The fallback description cannot exceed 500 characters.")
        String fallbackDescription
) {
}