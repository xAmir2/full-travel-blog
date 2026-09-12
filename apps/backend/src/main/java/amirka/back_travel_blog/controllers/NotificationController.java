package amirka.back_travel_blog.controllers;

import amirka.back_travel_blog.DTOs.NotificationResponseDTO;
import amirka.back_travel_blog.DTOs.UnreadNotificationCountDTO;
import amirka.back_travel_blog.entities.User;
import amirka.back_travel_blog.services.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/notifications")
@PreAuthorize("isAuthenticated()")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<NotificationResponseDTO> getNotifications(@AuthenticationPrincipal User currentUser) {
        return notificationService.getNotifications(currentUser);
    }

    @GetMapping("/unread-count")
    public UnreadNotificationCountDTO getUnreadCount(@AuthenticationPrincipal User currentUser) {
        return notificationService.getUnreadCount(currentUser);
    }

    @PatchMapping("/{notificationId}/read")
    public NotificationResponseDTO markAsRead(@PathVariable UUID notificationId, @AuthenticationPrincipal User currentUser) {
        return notificationService.markAsRead(notificationId, currentUser);
    }

    @PatchMapping("/read-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markAllAsRead(@AuthenticationPrincipal User currentUser) {
        notificationService.markAllAsRead(currentUser);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void clearNotifications(@AuthenticationPrincipal User currentUser) {
        notificationService.clearNotifications(currentUser);
    }
}