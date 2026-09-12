package amirka.back_travel_blog.entities;

import amirka.back_travel_blog.enums.NotificationType;
import jakarta.persistence.*;
import lombok.Getter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Getter
public class Notification {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "recipient_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User recipient;

    @ManyToOne(optional = false)
    @JoinColumn(name = "triggered_by_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User triggeredBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type", nullable = false, length = 40)
    private NotificationType notificationType;

    @ManyToOne
    @JoinColumn(name = "post_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Post post;

    @ManyToOne
    @JoinColumn(name = "comment_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Comment comment;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    public Notification() {
    }

    public Notification(User recipient, User triggeredBy, NotificationType notificationType, Post post, Comment comment) {
        this.recipient = recipient;
        this.triggeredBy = triggeredBy;
        this.notificationType = notificationType;
        this.post = post;
        this.comment = comment;
    }

    @PrePersist
    private void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public boolean isRead() {
        return readAt != null;
    }

    public void markAsRead() {
        if (readAt == null) {
            readAt = LocalDateTime.now();
        }
    }

    public void markAsUnread() {
        this.readAt = null;
    }

    public void setNotificationType(NotificationType notificationType) {
        this.notificationType = notificationType;
    }
}
