package amirka.back_travel_blog.services;

import amirka.back_travel_blog.entities.Comment;
import amirka.back_travel_blog.entities.Notification;
import amirka.back_travel_blog.entities.Post;
import amirka.back_travel_blog.entities.User;
import amirka.back_travel_blog.enums.NotificationType;
import amirka.back_travel_blog.interfaces.NotificationCreator;
import org.springframework.stereotype.Component;

@Component
public class DefaultNotificationCreator implements NotificationCreator {

    @Override
    public Notification create(NotificationType notificationType, User recipient, User triggeredBy, Post post, Comment comment) {
        validateNotification(notificationType, recipient, triggeredBy, post, comment);

        return new Notification(recipient, triggeredBy, notificationType, post, comment);
    }

    private void validateNotification(NotificationType notificationType, User recipient, User triggeredBy, Post post, Comment comment) {
        if (notificationType == null) {
            throw new IllegalArgumentException("Notification type is required.");
        }

        if (recipient == null) {
            throw new IllegalArgumentException("Notification recipient is required.");
        }

        if (triggeredBy == null) {
            throw new IllegalArgumentException("The user who triggered the notification is required.");
        }

        switch (notificationType) {

            case POST_LIKED, POST_DISLIKED -> {
                if (post == null || comment != null) {
                    throw new IllegalArgumentException("Post reaction notifications require a post and no comment.");
                }
            }

            case COMMENT_LIKED, COMMENT_DISLIKED, COMMENT_REPLIED -> {
                if (post == null || comment == null) {
                    throw new IllegalArgumentException("Comment notifications require a post and comment.");
                }

                if (!comment.getPost()
                        .getId()
                        .equals(post.getId())) {
                    throw new IllegalArgumentException(
                            "The notification comment does not belong to the supplied post.");
                }
            }
        }
    }
}
