package amirka.back_travel_blog.DTOs;

import amirka.back_travel_blog.enums.ContentType;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.Map;

public record ContentBlockDTO(

        @NotNull(message = "Content type is required.")
        ContentType type,

        @NotEmpty(message = "Block content is required.")
        Map<String, Object> content

) {
}
