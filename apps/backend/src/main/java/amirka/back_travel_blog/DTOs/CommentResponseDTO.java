package amirka.back_travel_blog.DTOs;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record CommentResponseDTO(
        UUID id,
        UUID postId,
        UUID parentCommentId,
        String content,
        String editorState,
        UserResponseDTO author,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        ReactionResponseDTO reactions,
        List<CommentResponseDTO> replies
) {
}
