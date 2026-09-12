package amirka.back_travel_blog.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Entity
@Table(name = "users")
@Getter
@JsonIgnoreProperties({"password", "authorities", "enabled", "accountNonExpired", "credentialsNonExpired", "accountNonLocked"})
public class User implements UserDetails {
    @Id
    @GeneratedValue
    private UUID id;
    @Column(nullable = false)
    private String name;
    @Column(nullable = false)
    private String surname;
    @Column(unique = true, nullable = false)
    private String username;
    @Column(unique = true, nullable = false)
    private String email;
    @Column(nullable = false)
    private String password;
    private String avatarUrl;
    private String avatarId;
    @ManyToOne
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public User() {
    }

    public User(String name, String surname, String username, String email, String password, Role role) {
        this.name = name;
        this.surname = surname;
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
        this.avatarUrl = "https://ui-avatars.com/api/?name=" + name + "+" + surname;
    }

    @PrePersist
    private void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    private void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setSurname(String surname) {
        this.surname = surname;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public void setAvatarId(String avatarId) {
        this.avatarId = avatarId;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<GrantedAuthority> authorities = role.getPermissions()
                .stream()
                .map(permission ->
                        (GrantedAuthority) new SimpleGrantedAuthority(
                                permission.getName()
                        )
                )
                .collect(Collectors.toList());

        authorities.add(
                new SimpleGrantedAuthority("ROLE_" + role.getName())
        );

        return authorities;
    }

}
