package amirka.back_travel_blog.DTOs;

import amirka.back_travel_blog.enums.ContentType;

import java.util.Map;
import java.util.UUID;

public record ContentBlockResponseDTO(
        UUID id,
        ContentType type,
        int position,
        Map<String, Object> content
) {
}
