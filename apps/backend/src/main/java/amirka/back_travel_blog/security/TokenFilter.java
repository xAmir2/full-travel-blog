package amirka.back_travel_blog.security;

import amirka.back_travel_blog.entities.User;
import amirka.back_travel_blog.services.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
public class TokenFilter extends OncePerRequestFilter {

    private final JWTTools jwtTools;
    private final UserService userService;
    private final AuthCookieService authCookieService;

    public TokenFilter(JWTTools jwtTools, UserService userService, AuthCookieService authCookieService) {
        this.jwtTools = jwtTools;
        this.userService = userService;
        this.authCookieService = authCookieService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String accessToken = getTokenFromCookie(request);

        if (accessToken == null) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            jwtTools.tokenVerification(accessToken);

            UUID userId = jwtTools.extractIdFromToken(accessToken);

            User currentUser = userService.findById(userId);

            Authentication authentication = new UsernamePasswordAuthenticationToken(currentUser, null,
                    currentUser.getAuthorities());

            SecurityContextHolder.getContext()
                    .setAuthentication(authentication);

            filterChain.doFilter(request, response);

        } catch (Exception ex) {
            SecurityContextHolder.clearContext();

            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);

            response.getWriter()
                    .write("""
                            { "message": "Invalid or expired token." }
                            """);
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return new AntPathMatcher().match("/auth/**", request.getServletPath());
    }

    private String getTokenFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();

        if (cookies == null) {
            return null;
        }

        for (Cookie cookie : cookies) {
            if (authCookieService.getCookieName()
                    .equals(cookie.getName())) {
                return cookie.getValue();
            }
        }

        return null;
    }
}