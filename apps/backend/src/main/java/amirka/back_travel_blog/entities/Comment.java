package amirka.back_travel_blog.entities;

import jakarta.persistence.*;
import lombok.Getter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "comments")
@Getter
public class Comment {
    @Id
    @GeneratedValue
    private UUID id;
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "editor_state", columnDefinition = "TEXT")
    private String editorState;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne
    @JoinColumn(name = "parent_comment_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Comment parentComment;

    public Comment() {
    }

    public Comment(String content, User user, Post post) {
        this.content = content;
        this.user = user;
        this.post = post;
    }

    public Comment(String content, User user, Post post, Comment parentComment) {
        this.content = content;
        this.user = user;
        this.post = post;
        this.parentComment = parentComment;
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

    public void setContent(String content) {
        this.content = content;
    }

    public void setEditorState(String editorState) {
        this.editorState = editorState;
    }

}
