import React from 'react'
import { Calendar, MapPin, Users, Plus } from 'lucide-react'
import type { EventWithProfile } from '../../api/events'

interface EventsListProps {
  events: EventWithProfile[]
  loading?: boolean
  onEventClick?: (event: EventWithProfile) => void
  onCreateEvent?: () => void
}

const EventsList: React.FC<EventsListProps> = ({
  events,
  loading = false,
  onEventClick,
  onCreateEvent,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded mb-2 w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {events.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="font-heading font-semibold text-lg text-gray-900 mb-2">No events yet</h3>
          <p className="text-gray-600 mb-4">Be the first to organize a community cleanup event!</p>
          {onCreateEvent && (
            <button onClick={onCreateEvent} className="btn-primary flex items-center space-x-2 mx-auto">
              <Plus className="w-4 h-4" />
              <span>Create Event</span>
            </button>
          )}
        </div>
      ) : (
        events.map((event) => (
          <div
            key={event.id}
            className="card cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onEventClick?.(event)}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-heading font-semibold text-lg text-gray-900">
                {event.title}
              </h3>
              <span className="px-2 py-1 bg-primary text-white text-xs font-medium rounded-full">
                Upcoming
              </span>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {event.description}
            </p>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(event.date)}</span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                <span>{event.location.lat.toFixed(4)}, {event.location.lng.toFixed(4)}</span>
              </div>

              {event.max_participants && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Users className="w-4 h-4" />
                  <span>Max {event.max_participants} participants</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm text-gray-600">
                  {event.user_profiles?.full_name || 'Anonymous'}
                </span>
              </div>

              <button className="btn-outline text-sm">
                Join Event
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default EventsList
