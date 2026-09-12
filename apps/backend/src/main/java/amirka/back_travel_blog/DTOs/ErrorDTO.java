package amirka.back_travel_blog.DTOs;

import java.time.LocalDateTime;

public record ErrorDTO(String message, LocalDateTime timestamp) {
}
