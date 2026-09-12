package amirka.back_travel_blog.DTOs;

import amirka.back_travel_blog.enums.PostStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record PostsResponseDTO(
        UUID id,
        String title,
        String slug,
        String summary,
        PostStatus status,
        UserResponseDTO author,
        List<ContentBlockResponseDTO> contentBlocks,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime publishedAt,
        ReactionResponseDTO reactions
) {
}
