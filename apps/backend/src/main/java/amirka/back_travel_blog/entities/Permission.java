package amirka.back_travel_blog.entities;

import jakarta.persistence.*;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "permissions")
@Getter
public class Permission {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;
    private LocalDateTime createdAt;

    public Permission() {
    }

    public Permission(String name) {
        this.name = name;
    }

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public void setName(String name) {
        this.name = name;
    }

}
