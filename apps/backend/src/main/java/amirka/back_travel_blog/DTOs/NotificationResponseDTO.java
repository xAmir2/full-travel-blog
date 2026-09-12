package amirka.back_travel_blog.DTOs;

import amirka.back_travel_blog.enums.NotificationType;

import java.time.LocalDateTime;
import java.util.UUID;

public record NotificationResponseDTO(
        UUID id,
        NotificationType notificationType,
        String message,
        UserResponseDTO triggeredBy,
        UUID postId,
        String postSlug,
        UUID commentId,
        boolean read,
        LocalDateTime createdAt
) {
}