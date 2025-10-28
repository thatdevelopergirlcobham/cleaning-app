import React, { useState } from 'react'
import { MapPin } from 'lucide-react'
import { useGeolocation } from '../../hooks/useGeoLocation'
import ImageUploader from '../common/ImageUploader'
import Modal from '../common/Modal'

export interface ReportFormData {
  title: string
  description: string
  location: { lat: number; lng: number } | null
  imageUrl: string
  type: string
  severity: 'low' | 'medium' | 'high'
  area: string
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
  const [formData, setFormData] = useState<ReportFormData>(() => ({
    title: '',
    description: '',
    location: null,
    imageUrl: '',
    type: 'general',
    severity: 'medium',
    area: '',
    ...initialData,
  }))
  const [loading, setLoading] = useState(false)

  // Update form data when location is available
  React.useEffect(() => {
    if (location && !formData.location) {
      setFormData(prev => ({ ...prev, location }))
    }
  }, [location, formData.location])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.description.trim() || !formData.location || !formData.area) {
      alert('Please fill in all required fields: title, description, location, and area')
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
        type: 'other',
        severity: 'medium',
        area: ''
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
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title *
              </label>
              <input
                type="text"
                id="title"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="area" className="block text-sm font-medium text-gray-700">
                Area/Neighborhood *
              </label>
              <input
                type="text"
                id="area"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                value={formData.area}
                onChange={e => setFormData({ ...formData, area: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Type of Waste
              </label>
              <select
                id="type"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="general">General Waste</option>
                <option value="recyclable">Recyclable</option>
                <option value="hazardous">Hazardous</option>
                <option value="organic">Organic</option>
                <option value="e-waste">E-Waste</option>
              </select>
            </div>
            <div>
              <label htmlFor="severity" className="block text-sm font-medium text-gray-700">
                Severity
              </label>
              <select
                id="severity"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                value={formData.severity}
                onChange={e => setFormData({ 
                  ...formData, 
                  severity: e.target.value as 'low' | 'medium' | 'high' 
                })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
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
