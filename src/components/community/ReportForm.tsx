import React, { useState } from 'react'
import { MapPin } from 'lucide-react'
import { useGeolocation } from '../../hooks/useGeoLocation'
import ImageUploader from '../common/ImageUploader'
import Modal from '../common/Modal'

interface ReportFormData {
  title: string
  description: string
  location: { lat: number; lng: number } | null
  imageUrl: string
}

interface ReportFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ReportFormData) => Promise<void>
  initialData?: Partial<ReportFormData>
}

const ReportForm: React.FC<ReportFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
}) => {
  const { location, requestLocation, loading: locationLoading } = useGeolocation()
  const [formData, setFormData] = useState<ReportFormData>({
    title: '',
    description: '',
    location: null,
    imageUrl: '',
    ...initialData,
  })
  const [loading, setLoading] = useState(false)

  React.useEffect(() => {
    if (location && !formData.location) {
      setFormData(prev => ({ ...prev, location }))
    }
  }, [location])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.description.trim() || !formData.location) {
      alert('Please fill in all required fields and ensure location is available')
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
        location: null,
        imageUrl: '',
      })
    } catch (error) {
      console.error('Error submitting report:', error)
      alert('Failed to submit report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (updates: Partial<ReportFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Report Waste Issue" className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => updateFormData({ title: e.target.value })}
            className="input-field"
            placeholder="Brief description of the waste issue"
            required
          />
        </div>

        {/* Description */}
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
            placeholder="Provide details about the waste issue, including type of waste, quantity, and any other relevant information"
            required
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location *
          </label>
          <div className="space-y-3">
            <button
              type="button"
              onClick={requestLocation}
              disabled={locationLoading}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-2xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <MapPin className="w-4 h-4" />
              <span>{locationLoading ? 'Getting location...' : 'Use current location'}</span>
            </button>

            {formData.location && (
              <p className="text-sm text-gray-600">
                📍 Location captured: {formData.location.lat.toFixed(6)}, {formData.location.lng.toFixed(6)}
              </p>
            )}
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photo (Optional)
          </label>
          <ImageUploader
            onImageUpload={(url) => updateFormData({ imageUrl: url })}
            currentImage={formData.imageUrl}
          />
        </div>

        {/* Submit Button */}
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
            disabled={loading || !formData.title.trim() || !formData.description.trim() || !formData.location}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ReportForm
