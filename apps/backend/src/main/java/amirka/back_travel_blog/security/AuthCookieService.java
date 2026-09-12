package amirka.back_travel_blog.security;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
public class AuthCookieService {

    private final String cookieName;
    private final boolean secure;
    private final long maxAge;

    public AuthCookieService(
            @Value("${auth.cookie.name}") String cookieName,
            @Value("${auth.cookie.secure}") boolean secure,
            @Value("${auth.cookie.max-age}") long maxAge
    ) {
        this.cookieName = cookieName;
        this.secure = secure;
        this.maxAge = maxAge;
    }

    public void addAuthenticationCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie.from(cookieName, token)
                .httpOnly(true)
                .secure(secure)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ofSeconds(maxAge))
                .build();

        response.addHeader("Set-Cookie", cookie.toString());
    }

    public void clearAuthenticationCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(cookieName, "")
                .httpOnly(true)
                .secure(secure)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ZERO)
                .build();

        response.addHeader("Set-Cookie", cookie.toString());
    }

    public String getCookieName() {
        return cookieName;
    }
}