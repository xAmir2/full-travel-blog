package amirka.back_travel_blog.DTOs;

import java.util.UUID;

public record UserResponseDTO(UUID id,
                              String name,
                              String surname,
                              String username,
                              String email,
                              String avatarUrl,
                              RoleResponseDTO role) {
}
