package amirka.back_travel_blog.DTOs;

import amirka.back_travel_blog.enums.ReactionType;
import jakarta.validation.constraints.NotNull;

public record ReactionDTO(
        @NotNull(message = "Reaction type is required.")
        ReactionType reactionType
) {
}