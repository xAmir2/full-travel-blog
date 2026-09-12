package amirka.back_travel_blog.DTOs;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserPasswordUpdateDTO(@NotBlank(message = "Current password is required")
                                    String currentPassword,

                                    @NotBlank(message = "New password is required")
                                    @Size(
                                            min = 8,
                                            message = "The new password must contain at least 8 characters"
                                    )
                                    String newPassword,

                                    @NotBlank(message = "Password confirmation is required")
                                    String confirmNewPassword
) {
}
