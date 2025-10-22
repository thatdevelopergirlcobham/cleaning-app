import React from 'react'
import EventsList from '../../components/community/EventsList'

const Events: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-gray-900">Community Events</h1>
        <p className="text-gray-600 mt-1">Join or create cleanup events in your area</p>
      </div>

      <EventsList
        events={[]} // This would come from API in real implementation
        onCreateEvent={() => console.log('Create event')}
      />
    </div>
  )
}

export default Events
