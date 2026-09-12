package amirka.back_travel_blog.DTOs;

import java.time.LocalDateTime;
import java.util.List;

public record ErrorListDTO(String message, LocalDateTime timestamp, List<String> errorsList) {
}
