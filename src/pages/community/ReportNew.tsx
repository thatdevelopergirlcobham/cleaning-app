import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { reportsApi } from '../../api/reports'
import ReportForm from '../../components/community/ReportForm'

interface ReportFormData {
  title: string
  description: string
  location: { lat: number; lng: number } | null
  imageUrl: string
}

const ReportNew: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { user } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const handleSubmitReport = async (data: ReportFormData) => {
    if (!user) {
      addToast({
        type: 'error',
        title: 'Authentication Required',
        message: 'Please sign in to submit a report'
      })
      return
    }

    try {
      await reportsApi.createReport({
        title: data.title,
        description: data.description,
        location: data.location ? { lat: data.location.lat, lng: data.location.lng } : { lat: 0, lng: 0 },
        image_url: data.imageUrl || undefined,
        user_id: user.id,
        status: 'pending' // Reports start as pending and need admin approval
      })

      addToast({
        type: 'success',
        title: 'Report Submitted!',
        message: 'Thank you for helping keep Calabar clean. Your report will be reviewed by our team.'
      })

      // Redirect to home after successful submission
      navigate('/home')
    } catch (error) {
      console.error('Error submitting report:', error)
      addToast({
        type: 'error',
        title: 'Submission Failed',
        message: 'Failed to submit report. Please try again.'
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center py-12">
        <h1 className="font-heading font-bold text-3xl text-gray-900 mb-4">Report Waste Issue</h1>
        <p className="text-gray-600 mb-8">Help keep Calabar clean by reporting waste issues in your community.</p>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          Report New Issue
        </button>
      </div>

      <ReportForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitReport}
      />
    </div>
  )
}

export default ReportNew
