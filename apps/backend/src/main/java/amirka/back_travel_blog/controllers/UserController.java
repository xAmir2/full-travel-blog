package amirka.back_travel_blog.controllers;

import amirka.back_travel_blog.DTOs.*;
import amirka.back_travel_blog.entities.User;
import amirka.back_travel_blog.exceptions.ValidationEx;
import amirka.back_travel_blog.security.AuthCookieService;
import amirka.back_travel_blog.services.UserService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;
    private final AuthCookieService authCookieService;

    public UserController(UserService userService, AuthCookieService authCookieService) {
        this.userService = userService;
        this.authCookieService = authCookieService;
    }

    @GetMapping("/me")
    public UserResponseDTO getMyProfile(@AuthenticationPrincipal User currentUser) {
        return userService.toResponseDTO(currentUser);
    }

    @PutMapping("/me")
    public UserResponseDTO updateMyData(@RequestBody @Validated UserDataUpdateDTO dto, BindingResult validationResult, @AuthenticationPrincipal User currentUser) {
        checkValidation(validationResult);

        User updatedUser = userService.updateData(currentUser.getId(), dto);

        return userService.toResponseDTO(updatedUser);
    }

    @PatchMapping("/me/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updateMyPassword(@RequestBody @Validated UserPasswordUpdateDTO dto, BindingResult validationResult, @AuthenticationPrincipal User currentUser) {
        checkValidation(validationResult);

        userService.updatePassword(currentUser.getId(), dto);
    }

    @PatchMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UserResponseDTO updateMyAvatar(@ModelAttribute @Validated UserAvatarUpdateDTO dto, BindingResult validationResult, @AuthenticationPrincipal User currentUser) {
        checkValidation(validationResult);

        User updatedUser = userService.updateAvatar(currentUser.getId(), dto);

        return userService.toResponseDTO(updatedUser);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('USER_MANAGE')")
    public List<UserResponseDTO> getAllUsers() {
        return userService.getAllUsers()
                .stream()
                .map(userService::toResponseDTO)
                .toList();
    }

    @GetMapping("/{userId}")
    @PreAuthorize("hasAuthority('USER_MANAGE')")
    public UserResponseDTO getUserById(@PathVariable UUID userId) {
        User user = userService.findById(userId);

        return userService.toResponseDTO(user);
    }

    @PatchMapping("/{userId}/role/{roleId}")
    @PreAuthorize("hasAuthority('USER_MANAGE')")
    public UserResponseDTO changeUserRole(@PathVariable UUID userId, @PathVariable UUID roleId) {
        User updatedUser = userService.changeRole(userId, roleId);

        return userService.toResponseDTO(updatedUser);
    }

    @DeleteMapping("/me")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMyAccount(@RequestBody @Validated AccountDeleteDTO dto, BindingResult validationResult,
                                @AuthenticationPrincipal User currentUser, HttpServletResponse response
    ) {
        checkValidation(validationResult);

        userService.deleteMyAccount(currentUser, dto.password());

        authCookieService.clearAuthenticationCookie(response);
    }

    private void checkValidation(BindingResult validationResult) {
        if (validationResult.hasErrors()) {
            throw new ValidationEx(validationResult.getFieldErrors()
                    .stream()
                    .map(error -> error.getDefaultMessage())
                    .toList());
        }
    }
}