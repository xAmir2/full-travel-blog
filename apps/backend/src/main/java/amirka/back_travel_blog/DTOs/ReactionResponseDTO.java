package amirka.back_travel_blog.DTOs;

import amirka.back_travel_blog.enums.ReactionType;

public record ReactionResponseDTO(
        long likeCount,
        long dislikeCount,
        ReactionType currentUserReaction
) {
}