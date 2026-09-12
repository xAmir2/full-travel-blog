package amirka.back_travel_blog.repositories;

import amirka.back_travel_blog.entities.Comment;
import amirka.back_travel_blog.entities.Notification;
import amirka.back_travel_blog.entities.Post;
import amirka.back_travel_blog.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    List<Notification>
    findTop20ByRecipientOrderByCreatedAtDesc(User recipient);

    Optional<Notification> findByIdAndRecipient(UUID notificationId, User recipient);

    long countByRecipientAndReadAtIsNull(User recipient);

    void deleteByRecipient(User recipient);

    Optional<Notification>
    findByRecipientAndTriggeredByAndPostAndCommentIsNull(User recipient, User triggeredBy, Post post);

    Optional<Notification>
    findByRecipientAndTriggeredByAndComment(User recipient, User triggeredBy, Comment comment);

    @Modifying
    @Query("""
            UPDATE Notification notification
            SET notification.readAt = :readAt
            WHERE notification.recipient = :recipient
              AND notification.readAt IS NULL
            """)
    int markAllAsRead(@Param("recipient") User recipient, @Param("readAt") LocalDateTime readAt);
}