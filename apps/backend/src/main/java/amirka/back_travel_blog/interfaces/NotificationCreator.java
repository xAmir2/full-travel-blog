package amirka.back_travel_blog.interfaces;

import amirka.back_travel_blog.entities.Comment;
import amirka.back_travel_blog.entities.Notification;
import amirka.back_travel_blog.entities.Post;
import amirka.back_travel_blog.entities.User;
import amirka.back_travel_blog.enums.NotificationType;

public interface NotificationCreator {

    Notification create(
            NotificationType notificationType,
            User recipient,
            User triggeredBy,
            Post post,
            Comment comment
    );
}