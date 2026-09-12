package amirka.back_travel_blog.DTOs;

import java.util.Set;
import java.util.UUID;

public record RoleResponseDTO(UUID id, String name, Set<PermissionResponseDTO> permissions) {
}
