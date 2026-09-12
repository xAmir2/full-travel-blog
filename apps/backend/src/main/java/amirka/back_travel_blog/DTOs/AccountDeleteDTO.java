package amirka.back_travel_blog.DTOs;

import jakarta.validation.constraints.NotBlank;

public record AccountDeleteDTO(@NotBlank(message = "Password is required.")
                               String password) {
}
