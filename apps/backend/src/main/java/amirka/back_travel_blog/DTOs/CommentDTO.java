package amirka.back_travel_blog.DTOs;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CommentDTO(
        @NotBlank(message = "Comments can't be empty.")
        @Size(max = 1000,
                message = "Comment can't exceed 1000 characters.")
        String content,

        @Size(max = 100_000,
                message = "The formatted comment is too large.")
        String editorState,

        UUID parentCommentId
) {
}