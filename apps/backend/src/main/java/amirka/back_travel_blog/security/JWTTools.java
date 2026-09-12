package amirka.back_travel_blog.security;

import amirka.back_travel_blog.entities.User;
import amirka.back_travel_blog.exceptions.UnauthorizedEx;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Component
public class JWTTools {
    private final String secret;

    public JWTTools(@Value("${jwt.secret}") String secret) {
        this.secret = secret;
    }

    public String generateToken(User user) {
        return Jwts.builder()
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(
                        System.currentTimeMillis() + 1000 * 60 * 60 * 12))
                .subject(
                        String.valueOf(user.getId()))
                .signWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
                .compact();
    }

    public void tokenVerification(String token) {

        try {
            Jwts.parser()
                    .verifyWith(Keys.hmacShaKeyFor(secret.getBytes()))
                    .build()
                    .parse(token);
        } catch (Exception ex) {
            throw new UnauthorizedEx(
                    "There were issues with the token, login again!"
            );
        }
    }

    public UUID extractIdFromToken(String token) {
        return UUID.fromString(Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(secret.getBytes()))
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject());
    }
}
