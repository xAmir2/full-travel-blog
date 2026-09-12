package amirka.back_travel_blog.DTOs;

import jakarta.validation.constraints.NotNull;
import org.springframework.web.multipart.MultipartFile;

public record UserAvatarUpdateDTO(@NotNull(message = "Avatar image is required")
                                  MultipartFile avatar) {
}
