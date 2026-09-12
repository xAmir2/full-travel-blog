package amirka.back_travel_blog.DTOs;


import amirka.back_travel_blog.enums.PostStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record PostDTO(

        @NotBlank(message = "Title is required.")
        @Size(max = 200, message = "Title cannot exceed 200 characters.")
        String title,

        @NotBlank(message = "Summary is required.")
        @Size(max = 500, message = "Summary cannot exceed 500 characters.")
        String summary,

        @NotNull(message = "Post status is required.")
        PostStatus status,

        @Valid
        @NotEmpty(message = "At least one content block is required.")
        List<ContentBlockDTO> contentBlocks

) {
}
