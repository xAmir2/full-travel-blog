package amirka.back_travel_blog.entities;

import amirka.back_travel_blog.enums.ReactionType;
import jakarta.persistence.*;
import lombok.Getter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "comment_reactions", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"comment_id", "user_id"})
})
@Getter
public class CommentReaction {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "comment_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Comment comment;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "reaction_type", nullable = false, length = 10)
    private ReactionType reactionType;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public CommentReaction() {
    }

    public CommentReaction(Comment comment, User user, ReactionType reactionType) {
        this.comment = comment;
        this.user = user;
        this.reactionType = reactionType;
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

    public void setReactionType(ReactionType reactionType) {
        this.reactionType = reactionType;
    }
}