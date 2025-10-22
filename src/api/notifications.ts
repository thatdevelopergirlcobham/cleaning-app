import { supabase } from './supabaseClient'

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'report_approved' | 'report_rejected' | 'report_submitted' | 'system' | 'ai_insight'
  read: boolean
  data?: any // Additional data related to the notification
  created_at: string
  updated_at: string
}

export interface NotificationInsert {
  user_id: string
  title: string
  message: string
  type: Notification['type']
  read?: boolean
  data?: any
}

export interface NotificationUpdate {
  read?: boolean
  updated_at?: string
}

export const notificationsApi = {
  // Get notifications for a user
  async getUserNotifications(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data as Notification[]
  },

  // Get unread notifications count
  async getUnreadCount(userId: string) {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false)

    if (error) throw error
    return count || 0
  },

  // Create a new notification
  async createNotification(notification: NotificationInsert) {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        ...notification,
        read: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data as Notification
  },

  // Mark notification as read
  async markAsRead(notificationId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({
        read: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', notificationId)
      .select()
      .single()

    if (error) throw error
    return data as Notification
  },

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({
        read: true,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('read', false)

    if (error) throw error
  },

  // Delete a notification
  async deleteNotification(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)

    if (error) throw error
  },

  // Subscribe to real-time notification updates
  subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
    return supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as Notification)
        }
      )
      .subscribe()
  }
}
