package amirka.back_travel_blog.controllers;

import amirka.back_travel_blog.DTOs.LoginDTO;
import amirka.back_travel_blog.DTOs.RegisterDTO;
import amirka.back_travel_blog.DTOs.UserResponseDTO;
import amirka.back_travel_blog.entities.User;
import amirka.back_travel_blog.exceptions.ValidationEx;
import amirka.back_travel_blog.security.AuthCookieService;
import amirka.back_travel_blog.services.AuthService;
import amirka.back_travel_blog.services.UserService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;
    private final AuthService authService;
    private final AuthCookieService authCookieService;

    public AuthController(
            UserService userService,
            AuthService authService,
            AuthCookieService authCookieService
    ) {
        this.userService = userService;
        this.authService = authService;
        this.authCookieService = authCookieService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponseDTO register(@RequestBody @Validated RegisterDTO dto, BindingResult validationResult) {
        checkValidation(validationResult);

        User user = userService.register(dto);

        return userService.toResponseDTO(user);
    }

    @PostMapping("/login")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void login(@RequestBody @Validated LoginDTO dto, BindingResult validationResult, HttpServletResponse response) {
        checkValidation(validationResult);

        String token = authService.checkCredentialsAndGenerateToken(dto);

        authCookieService.addAuthenticationCookie(response, token);
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpServletResponse response) {
        authCookieService.clearAuthenticationCookie(response);
    }

    private void checkValidation(
            BindingResult validationResult
    ) {
        if (validationResult.hasErrors()) {
            throw new ValidationEx(validationResult.getFieldErrors()
                    .stream()
                    .map(error -> error.getDefaultMessage())
                    .toList());
        }
    }
}