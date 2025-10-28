import { createContext } from 'react';
import type { Notification } from '../api/notifications';

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
}
// Create the context with a default value of null
const NotificationContext = createContext<NotificationContextType | null>(null);

export default NotificationContext;
