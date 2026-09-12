package amirka.back_travel_blog.services;

import amirka.back_travel_blog.DTOs.LoginDTO;
import amirka.back_travel_blog.entities.User;
import amirka.back_travel_blog.exceptions.NotFoundEx;
import amirka.back_travel_blog.exceptions.UnauthorizedEx;
import amirka.back_travel_blog.security.JWTTools;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserService userService;
    private final JWTTools jwtTools;
    private final PasswordEncoder bCrypt;


    public AuthService(UserService userService, JWTTools jwtTools, PasswordEncoder bCrypt) {
        this.userService = userService;
        this.jwtTools = jwtTools;
        this.bCrypt = bCrypt;
    }

    public String checkCredentialsAndGenerateToken(LoginDTO dto) {
        try {
            User user = userService.findByEmail(dto.email());

            if (bCrypt.matches(
                    dto.password(),
                    user.getPassword()
            )) {
                return jwtTools.generateToken(user);
            }
        } catch (NotFoundEx ignored) {
        }
        throw new UnauthorizedEx("Invalid password or email.");
    }


}
