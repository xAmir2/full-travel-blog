package amirka.back_travel_blog.DTOs;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Set;
import java.util.UUID;

public record RoleDTO(@NotBlank(message = "Role name is required.")
                      String name,

                      @NotNull(message = "Permissions are required.")
                      Set<UUID> permissionIds) {
}
