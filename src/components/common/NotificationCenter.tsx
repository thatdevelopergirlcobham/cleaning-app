import React, { useState } from 'react'
import { Bell, Trash2, Check } from 'lucide-react'
import { useNotifications } from '../../contexts/NotificationContext'
import type { Notification } from '../../api/notifications'
import Modal from './Modal'

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications()
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  const filteredNotifications = notifications.filter((notification: Notification) => {
    if (filter === 'unread') return !notification.read
    if (filter === 'read') return !!notification.read
    return true
  })

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    return date.toLocaleDateString()
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'report_approved': return '✅'
      case 'report_rejected': return '❌'
      case 'report_submitted': return '📝'
      case 'ai_insight': return '🤖'
      default: return '🔔'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'report_approved': return 'border-l-green-500 bg-green-50'
      case 'report_rejected': return 'border-l-red-500 bg-red-50'
      case 'report_submitted': return 'border-l-blue-500 bg-blue-50'
      case 'ai_insight': return 'border-l-purple-500 bg-purple-50'
      default: return 'border-l-gray-500 bg-gray-50'
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Notifications" className="max-w-2xl">
      <div className="space-y-4">
        {/* Header with filters and actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {['all', 'unread', 'read'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType as 'all' | 'unread' | 'read')}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  filter === filterType
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                {filterType === 'unread' && unreadCount > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Mark All Read</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNotifications.map((notification: Notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-l-4 rounded-r-lg ${getNotificationColor(notification.type)} ${
                    !notification.read ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                        <h4 className="font-medium text-gray-900">{notification.title}</h4>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <p className="text-xs text-gray-400">{formatTime(notification.created_at)}</p>
                    </div>

                    <div className="flex items-center space-x-1 ml-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete notification"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
          </p>
          <button
            onClick={onClose}
            className="btn-outline text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default NotificationCenter
