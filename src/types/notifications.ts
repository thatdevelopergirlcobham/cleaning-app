import type { Notification } from '../api/notifications';

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  fetchNotifications: () => Promise<void>;
}

export interface NotificationProviderProps {
  children: React.ReactNode;
}
