package amirka.back_travel_blog.entities;

import amirka.back_travel_blog.enums.PostStatus;
import jakarta.persistence.*;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "posts")
@Getter
public class Post {
    @Id
    @GeneratedValue
    private UUID id;
    @Column(nullable = false)
    private String title;
    @Column(nullable = false, unique = true)
    private String slug;
    @Column(nullable = false)
    private String summary;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PostStatus status;
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    @Column(nullable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime publishedAt;

    public Post() {
    }

    public Post(String title, String slug, String summary, PostStatus status, User user) {
        this.title = title;
        this.slug = slug;
        this.summary = summary;
        this.status = status;
        this.user = user;
    }

    @PrePersist
    private void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        this.createdAt = now;
        this.updatedAt = now;

        if (this.status == PostStatus.PUBLISHED) {
            this.publishedAt = now;
        }
    }

    @PreUpdate
    private void onUpdate() {
        this.updatedAt = LocalDateTime.now();

        if (this.status == PostStatus.PUBLISHED && this.publishedAt == null) {
            this.publishedAt = LocalDateTime.now();
        }

        if (this.status == PostStatus.DRAFT) {
            this.publishedAt = null;
        }
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    
    public void setPostStatus(PostStatus postStatus) {
        this.status = postStatus;
    }
}
