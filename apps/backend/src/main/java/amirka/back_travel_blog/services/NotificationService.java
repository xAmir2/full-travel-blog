package amirka.back_travel_blog.services;

import amirka.back_travel_blog.DTOs.NotificationResponseDTO;
import amirka.back_travel_blog.DTOs.UnreadNotificationCountDTO;
import amirka.back_travel_blog.entities.Comment;
import amirka.back_travel_blog.entities.Notification;
import amirka.back_travel_blog.entities.Post;
import amirka.back_travel_blog.entities.User;
import amirka.back_travel_blog.enums.NotificationType;
import amirka.back_travel_blog.enums.ReactionType;
import amirka.back_travel_blog.exceptions.NotFoundEx;
import amirka.back_travel_blog.interfaces.NotificationCreator;
import amirka.back_travel_blog.repositories.NotificationRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationCreator notificationCreator;
    private final UserService userService;

    public NotificationService(
            NotificationRepository notificationRepository,
            NotificationCreator notificationCreator,
            UserService userService
    ) {
        this.notificationRepository = notificationRepository;
        this.notificationCreator = notificationCreator;
        this.userService = userService;
    }

    public List<NotificationResponseDTO> getNotifications(User recipient) {
        return notificationRepository
                .findTop20ByRecipientOrderByCreatedAtDesc(recipient)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public UnreadNotificationCountDTO getUnreadCount(User recipient) {
        long unreadCount = notificationRepository.countByRecipientAndReadAtIsNull(recipient);

        return new UnreadNotificationCountDTO(unreadCount);
    }

    @Transactional
    public NotificationResponseDTO markAsRead(UUID notificationId, User recipient) {
        Notification notification = notificationRepository
                .findByIdAndRecipient(notificationId, recipient)
                .orElseThrow(() -> new NotFoundEx("Notification not found with id: " + notificationId));

        notification.markAsRead();

        Notification savedNotification = notificationRepository.save(notification);

        return toResponseDTO(savedNotification);
    }

    @Transactional
    public void markAllAsRead(User recipient) {
        notificationRepository.markAllAsRead(recipient, LocalDateTime.now());
    }

    @Transactional
    public void clearNotifications(User recipient) {
        notificationRepository.deleteByRecipient(recipient);
    }

    @Transactional
    public void createOrUpdatePostReactionNotification(Post post, User triggeredBy, ReactionType reactionType) {
        User recipient = post.getUser();

        if (isSelfNotification(recipient, triggeredBy)) {
            return;
        }

        NotificationType notificationType = reactionType == ReactionType.LIKE ? NotificationType.POST_LIKED : NotificationType.POST_DISLIKED;

        Optional<Notification> existingNotification = notificationRepository.findByRecipientAndTriggeredByAndPostAndCommentIsNull(
                recipient, triggeredBy,
                post);

        if (existingNotification.isPresent()) {
            Notification notification = existingNotification.get();

            notification.setNotificationType(notificationType);
            notification.markAsUnread();

            notificationRepository.save(notification);
            return;
        }

        Notification notification = notificationCreator.create(
                notificationType,
                recipient,
                triggeredBy,
                post,
                null
        );

        notificationRepository.save(notification);
    }

    @Transactional
    public void removePostReactionNotification(Post post, User triggeredBy) {
        User recipient = post.getUser();

        notificationRepository
                .findByRecipientAndTriggeredByAndPostAndCommentIsNull(recipient, triggeredBy, post)
                .ifPresent(notificationRepository::delete);
    }

    @Transactional
    public void createOrUpdateCommentReactionNotification(Comment comment, User triggeredBy, ReactionType reactionType) {
        User recipient = comment.getUser();

        if (isSelfNotification(recipient, triggeredBy)) {
            return;
        }

        NotificationType notificationType = reactionType == ReactionType.LIKE ? NotificationType.COMMENT_LIKED : NotificationType.COMMENT_DISLIKED;

        Optional<Notification> existingNotification = notificationRepository.findByRecipientAndTriggeredByAndComment(
                recipient, triggeredBy, comment);

        if (existingNotification.isPresent()) {
            Notification notification = existingNotification.get();

            notification.setNotificationType(notificationType);
            notification.markAsUnread();

            notificationRepository.save(notification);
            return;
        }

        Notification notification = notificationCreator.create(
                notificationType,
                recipient,
                triggeredBy,
                comment.getPost(),
                comment
        );

        notificationRepository.save(notification);
    }

    @Transactional
    public void removeCommentReactionNotification(Comment comment, User triggeredBy) {
        User recipient = comment.getUser();

        notificationRepository
                .findByRecipientAndTriggeredByAndComment(recipient, triggeredBy, comment)
                .ifPresent(notificationRepository::delete);
    }

    @Transactional
    public void createReplyNotification(Comment reply) {
        Comment parentComment = reply.getParentComment();

        if (parentComment == null) {
            return;
        }

        User recipient = parentComment.getUser();
        User triggeredBy = reply.getUser();

        if (isSelfNotification(recipient, triggeredBy)) {
            return;
        }

        Notification notification = notificationCreator.create(
                NotificationType.COMMENT_REPLIED,
                recipient,
                triggeredBy,
                reply.getPost(),
                reply
        );

        notificationRepository.save(notification);
    }

    private boolean isSelfNotification(User recipient, User triggeredBy) {
        return recipient.getId()
                .equals(triggeredBy.getId());
    }

    private NotificationResponseDTO toResponseDTO(Notification notification) {
        Post post = notification.getPost();
        Comment comment = notification.getComment();

        return new NotificationResponseDTO(
                notification.getId(),
                notification.getNotificationType(),
                createMessage(notification.getNotificationType()),
                userService.toResponseDTO(notification.getTriggeredBy()),
                post == null ? null : post.getId(),
                post == null ? null : post.getSlug(),
                comment == null ? null : comment.getId(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }

    private String createMessage(NotificationType notificationType) {
        return switch (notificationType) {
            case POST_LIKED -> "liked your post.";

            case POST_DISLIKED -> "disliked your post.";

            case COMMENT_LIKED -> "liked your comment.";

            case COMMENT_DISLIKED -> "disliked your comment.";

            case COMMENT_REPLIED -> "replied to your comment.";
        };
    }
}