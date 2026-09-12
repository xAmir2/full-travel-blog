package amirka.back_travel_blog.controllers;

import amirka.back_travel_blog.DTOs.PermissionResponseDTO;
import amirka.back_travel_blog.DTOs.RoleDTO;
import amirka.back_travel_blog.DTOs.RoleResponseDTO;
import amirka.back_travel_blog.entities.Role;
import amirka.back_travel_blog.exceptions.ValidationEx;
import amirka.back_travel_blog.services.RoleService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/roles")
@PreAuthorize("hasAuthority('USER_MANAGE')")
public class RoleController {

    private final RoleService roleService;

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    @GetMapping
    public List<RoleResponseDTO> getAllRoles() {
        return roleService.getAllRoles()
                .stream()
                .map(roleService::toResponseDTO)
                .toList();
    }

    @GetMapping("/permissions")
    public List<PermissionResponseDTO> getAllPermissions() {
        return roleService.getAllPermissions()
                .stream()
                .map(permission -> new PermissionResponseDTO(permission.getId(), permission.getName()))
                .toList();
    }

    @GetMapping("/{roleId}")
    public RoleResponseDTO getRoleById(@PathVariable UUID roleId) {
        Role role = roleService.getRoleById(roleId);

        return roleService.toResponseDTO(role);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RoleResponseDTO createRole(@RequestBody @Validated RoleDTO dto, BindingResult validationResult) {
        checkValidation(validationResult);

        Role role = roleService.createRole(dto);

        return roleService.toResponseDTO(role);
    }

    @PutMapping("/{roleId}")
    public RoleResponseDTO updateRole(@PathVariable UUID roleId, @RequestBody @Validated RoleDTO dto, BindingResult validationResult) {
        checkValidation(validationResult);

        Role updatedRole = roleService.updateRole(roleId, dto);

        return roleService.toResponseDTO(updatedRole);
    }

    @DeleteMapping("/{roleId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRole(@PathVariable UUID roleId) {
        roleService.deleteRole(roleId);
    }

    private void checkValidation(BindingResult validationResult) {
        if (validationResult.hasErrors()) {
            throw new ValidationEx(validationResult.getFieldErrors()
                    .stream()
                    .map(error -> error.getDefaultMessage())
                    .toList()
            );
        }
    }
}