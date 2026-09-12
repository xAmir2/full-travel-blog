package amirka.back_travel_blog.entities;

import jakarta.persistence.*;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "roles")
@Getter
public class Role {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(unique = true, nullable = false)
    private String name;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @ManyToMany
    @JoinTable(name = "role_permissions", joinColumns = @JoinColumn(name = "role_id", nullable = false),
            inverseJoinColumns = @JoinColumn(name = "permission_id", nullable = false))
    private Set<Permission> permissions = new HashSet<>();

    public Role() {
    }

    public Role(String name) {
        this.name = name;
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

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

}
