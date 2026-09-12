package amirka.back_travel_blog.DTOs;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserDataUpdateDTO(@NotBlank(message = "Name is required")
                                String name,

                                @NotBlank(message = "Surname is required")
                                String surname,

                                @NotBlank(message = "Username is required")
                                @Size(
                                        min = 3,
                                        max = 50,
                                        message = "Username must contain between 3 and 50 characters"
                                )
                                String username,

                                @NotBlank(message = "Email is required")
                                @Email(message = "Email is not valid")
                                String email) {
}
