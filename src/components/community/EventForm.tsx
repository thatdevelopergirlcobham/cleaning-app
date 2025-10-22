import React, { useState } from 'react'
import { MapPin } from 'lucide-react'
import Modal from '../common/Modal'

interface EventFormData {
  title: string
  description: string
  date: string
  location: { lat: number; lng: number } | null
  maxParticipants?: number
}

interface EventFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: EventFormData) => Promise<void>
  initialData?: Partial<EventFormData>
}

const EventForm: React.FC<EventFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
}) => {
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    date: '',
    location: null,
    maxParticipants: undefined,
    ...initialData,
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.description.trim() || !formData.date) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      await onSubmit(formData)
      onClose()
      // Reset form
      setFormData({
        title: '',
        description: '',
        date: '',
        location: null,
        maxParticipants: undefined,
      })
    } catch (error) {
      console.error('Error creating event:', error)
      alert('Failed to create event. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (updates: Partial<EventFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Cleanup Event" className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Event Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => updateFormData({ title: e.target.value })}
            className="input-field"
            placeholder="e.g., Beach Cleanup Day"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            rows={4}
            className="input-field resize-none"
            placeholder="Describe the cleanup event, goals, and what participants should bring"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Date & Time *
            </label>
            <input
              type="datetime-local"
              id="date"
              value={formData.date}
              onChange={(e) => updateFormData({ date: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-2">
              Max Participants (Optional)
            </label>
            <input
              type="number"
              id="maxParticipants"
              value={formData.maxParticipants || ''}
              onChange={(e) => updateFormData({ maxParticipants: e.target.value ? parseInt(e.target.value) : undefined })}
              className="input-field"
              placeholder="e.g., 50"
              min="1"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location *
          </label>
          <p className="text-sm text-gray-600 mb-2">
            Location will be automatically detected when you create the event, or you can specify it manually.
          </p>
          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-2xl">
            <MapPin className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">
              {formData.location
                ? `${formData.location.lat.toFixed(6)}, ${formData.location.lng.toFixed(6)}`
                : 'Location will be captured when event is created'
              }
            </span>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formData.title.trim() || !formData.description.trim() || !formData.date}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default EventForm
