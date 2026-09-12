package amirka.back_travel_blog.services;

import amirka.back_travel_blog.DTOs.PermissionResponseDTO;
import amirka.back_travel_blog.DTOs.RoleDTO;
import amirka.back_travel_blog.DTOs.RoleResponseDTO;
import amirka.back_travel_blog.entities.Permission;
import amirka.back_travel_blog.entities.Role;
import amirka.back_travel_blog.exceptions.BadRequestEx;
import amirka.back_travel_blog.exceptions.NotFoundEx;
import amirka.back_travel_blog.repositories.PermissionRepository;
import amirka.back_travel_blog.repositories.RoleRepository;
import amirka.back_travel_blog.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RoleService {
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;

    public RoleService(
            RoleRepository roleRepository,
            PermissionRepository permissionRepository,
            UserRepository userRepository
    ) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.userRepository = userRepository;
    }

    public Role createRole(RoleDTO dto) {
        String name = dto.name()
                .trim()
                .toUpperCase();

        if (roleRepository.existsByNameIgnoreCase(name)) {
            throw new BadRequestEx("Role name already in use.");
        }

        Role role = new Role(name);

        role.getPermissions()
                .addAll(getPermissions(dto.permissionIds()));

        return roleRepository.save(role);
    }

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    public List<Permission> getAllPermissions() {
        return permissionRepository.findAll();
    }

    public Role getRoleById(UUID id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new NotFoundEx("Role not found with id: " + id));
    }

    public Role updateRole(UUID id, RoleDTO dto) {
        Role role = getRoleById(id);
        String name = dto.name()
                .trim()
                .toUpperCase();

        if (!role.getName()
                .equalsIgnoreCase(name) && roleRepository.existsByNameIgnoreCase(name)) {
            throw new BadRequestEx("Role name already in use.");
        }

        role.setName(name);
        role.getPermissions()
                .clear();

        role.getPermissions()
                .addAll(getPermissions(dto.permissionIds()));

        return roleRepository.save(role);
    }

    public void deleteRole(UUID id) {
        Role role = getRoleById(id);

        if (userRepository.existsByRoleId(id)) {
            throw new BadRequestEx("This role is assigned to users.");
        }

        roleRepository.delete(role);
    }

    private Set<Permission> getPermissions(
            Set<UUID> permissionIds
    ) {
        List<Permission> permissions = permissionRepository.findAllById(permissionIds);

        if (permissions.size() != permissionIds.size()) {
            throw new NotFoundEx("One or more permissions were not found.");
        }

        return new HashSet<>(permissions);
    }

    public RoleResponseDTO toResponseDTO(Role role) {
        Set<PermissionResponseDTO> permissions =
                role.getPermissions()
                        .stream()
                        .map(permission -> new PermissionResponseDTO(permission.getId(), permission.getName()))
                        .collect(Collectors.toSet());

        return new RoleResponseDTO(role.getId(), role.getName(), permissions);
    }
}
