import { useEffect, useState } from "react";

import { Alert, Button, Dropdown, Image, Spinner } from "react-bootstrap";

import {
  Bell,
  BellFill,
  Check2All,
  HandThumbsDown,
  HandThumbsUp,
  Reply,
  Trash3,
} from "react-bootstrap-icons";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
  clearNotifications,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../services/notificationService";

import { useConfirmation } from "../context/ConfirmationContext";

import type { AppNotification, NotificationType } from "../types/models";

const refreshInterval = 60_000;

function getNotificationIcon(notificationType: NotificationType) {
  switch (notificationType) {
    case "POST_LIKED":
    case "COMMENT_LIKED":
      return <HandThumbsUp />;

    case "POST_DISLIKED":
    case "COMMENT_DISLIKED":
      return <HandThumbsDown />;

    case "COMMENT_REPLIED":
      return <Reply />;
  }
}

function formatNotificationDate(date: string): string {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function NotificationMenu() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const { requestConfirmation } = useConfirmation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    let isActive = true;

    async function refreshUnreadCount() {
      try {
        const count = await getUnreadNotificationCount();

        if (isActive) {
          setUnreadCount(count);
        }
      } catch {
        if (isActive) {
          setUnreadCount(0);
        }
      }
    }

    void refreshUnreadCount();

    // Refreshes the unread notification count every minute
    const intervalId = window.setInterval(
      () => void refreshUnreadCount(),
      refreshInterval,
    );

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [user]);

  if (!user) {
    return null;
  }

  async function loadNotifications() {
    setIsLoading(true);
    setError(null);

    try {
      const [loadedNotifications, loadedUnreadCount] = await Promise.all([
        getNotifications(),
        getUnreadNotificationCount(),
      ]);

      setNotifications(loadedNotifications);
      setUnreadCount(loadedUnreadCount);
    } catch {
      setError("Notifications could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleNotificationClick(notification: AppNotification) {
    setIsOpen(false);
    setError(null);

    try {
      if (!notification.read) {
        await markNotificationAsRead(notification.id);

        setNotifications((currentNotifications) =>
          currentNotifications.map((currentNotification) =>
            currentNotification.id === notification.id
              ? {
                  ...currentNotification,
                  read: true,
                }
              : currentNotification,
          ),
        );

        setUnreadCount((currentCount) => Math.max(0, currentCount - 1));
      }

      if (notification.postSlug) {
        navigate(`/posts/${notification.postSlug}`);
      }
    } catch {
      setError("The notification could not be opened.");
    }
  }

  async function handleMarkAllAsRead() {
    if (unreadCount === 0 || isMarkingAll) {
      return;
    }

    setIsMarkingAll(true);
    setError(null);

    try {
      await markAllNotificationsAsRead();

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => ({
          ...notification,
          read: true,
        })),
      );

      setUnreadCount(0);
    } catch {
      setError("Notifications could not be marked as read.");
    } finally {
      setIsMarkingAll(false);
    }
  }

  async function handleClearNotifications() {
    if (notifications.length === 0 || isClearing) {
      return;
    }

    const confirmed = await requestConfirmation({
      title: "Clear all notifications?",
      message:
        "All notifications will be permanently removed from your account.",
      confirmLabel: "Clear notifications",
      warning: "This action cannot be undone.",
      destructive: true,
    });

    if (!confirmed) {
      return;
    }

    setIsClearing(true);
    setError(null);

    try {
      await clearNotifications();

      setNotifications([]);
      setUnreadCount(0);
    } catch {
      setError("Notifications could not be cleared.");
    } finally {
      setIsClearing(false);
    }
  }

  return (
    <Dropdown
      show={isOpen}
      align="end"
      className="notification-menu"
      onToggle={(nextIsOpen) => {
        setIsOpen(nextIsOpen);

        if (nextIsOpen) {
          void loadNotifications();
        }
      }}
    >
      <Dropdown.Toggle
        as={Button}
        type="button"
        variant="link"
        className="notification-toggle"
        aria-label={
          unreadCount > 0
            ? `${unreadCount} unread notifications`
            : "Open notifications"
        }
      >
        {unreadCount > 0 ? <BellFill /> : <Bell />}

        {unreadCount > 0 && (
          <span className="notification-count" aria-hidden="true">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu className="notification-dropdown">
        <div className="notification-dropdown-header">
          <div>
            <span className="cozy-eyebrow">Updates</span>

            <h2>Notifications</h2>
          </div>

          {unreadCount > 0 && (
            <Button
              type="button"
              variant="link"
              className="notification-mark-all"
              disabled={isMarkingAll}
              onClick={() => void handleMarkAllAsRead()}
            >
              {isMarkingAll ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <Check2All />
              )}

              <span>Mark all read</span>
            </Button>
          )}
        </div>
        {notifications.length > 0 && !isLoading && (
          <div className="notification-clear-row">
            <Button
              type="button"
              variant="link"
              className="notification-clear-all"
              disabled={isClearing}
              onClick={() => void handleClearNotifications()}
            >
              {isClearing ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <Trash3 />
              )}

              <span>Clear all</span>
            </Button>
          </div>
        )}

        {error && (
          <Alert variant="danger" className="notification-error">
            {error}
          </Alert>
        )}

        {isLoading ? (
          <div className="notification-loading">
            <Spinner animation="border" size="sm" />

            <span>Loading notifications…</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="notification-empty">
            <Bell />

            <p>You’re all caught up.</p>

            <span>New activity will appear here.</span>
          </div>
        ) : (
          <div className="notification-list">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                className={`notification-item ${
                  notification.read ? "" : "notification-item-unread"
                }`}
                onClick={() => void handleNotificationClick(notification)}
              >
                <span className="notification-item-icon">
                  {getNotificationIcon(notification.notificationType)}
                </span>

                <span className="notification-item-content">
                  <span className="notification-item-message">
                    <strong>
                      {notification.triggeredBy.name ||
                        notification.triggeredBy.username}
                    </strong>{" "}
                    {notification.message}
                  </span>

                  <span className="notification-item-date">
                    {formatNotificationDate(notification.createdAt)}
                  </span>
                </span>

                {notification.triggeredBy.avatarUrl && (
                  <Image
                    src={notification.triggeredBy.avatarUrl}
                    alt=""
                    roundedCircle
                    className="notification-avatar"
                  />
                )}

                {!notification.read && (
                  <span
                    className="notification-unread-dot"
                    aria-label="Unread"
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
}
