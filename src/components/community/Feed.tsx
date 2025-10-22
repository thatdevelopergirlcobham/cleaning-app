import React from 'react'
import { Plus, Filter } from 'lucide-react'
import { useRealtimeReports } from '../../hooks/useRealtimeReports'
import { useUI } from '../../contexts/UIContext'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { useNavigate } from 'react-router-dom'
import { reportsApi } from '../../api/reports'
import ReportCard from './ReportCard'
import ReportForm from './ReportForm'
import LoadingSpinner from '../common/LoadingSpinner'

const Feed: React.FC = () => {
  const { reports, loading, error } = useRealtimeReports()
  const { openReportModal, isReportModalOpen, closeReportModal } = useUI()
  const { user } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const handleReportClick = () => {
    if (user) {
      // Authenticated user - open modal
      openReportModal()
    } else {
      // Unauthenticated user - redirect to report page
      navigate('/report')
    }
  }

  const handleReportSubmit = async (data: { title: string; description: string; location: { lat: number; lng: number } | null; imageUrl: string }) => {
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
        status: 'pending'
      })

      addToast({
        type: 'success',
        title: 'Report Submitted!',
        message: 'Thank you for helping keep Calabar clean. Your report will be reviewed by our team.'
      })

      // Close modal after successful submission
      // The modal state is managed by UIContext
    } catch (error) {
      console.error('Error submitting report:', error)
      addToast({
        type: 'error',
        title: 'Submission Failed',
        message: 'Failed to submit report. Please try again.'
      })
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <LoadingSpinner className="h-12 w-12 mx-auto" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center text-error">
          <p>Failed to load reports. Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-bold text-2xl text-gray-900">Community Feed</h1>
          <p className="text-gray-600 mt-1">Approved waste reports and community actions</p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Filter Button */}
          <div className="relative">
            <button className="btn-outline flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>

          {/* Add Report Button */}
          <button onClick={handleReportClick} className="btn-primary flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Report Issue</span>
          </button>
        </div>
      </div>

      {/* Reports Grid */}
      {reports.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="font-heading font-semibold text-lg text-gray-900 mb-2">No reports yet</h3>
          <p className="text-gray-600 mb-4">Be the first to report a waste issue in your community!</p>
          <button onClick={handleReportClick} className="btn-primary">
            Report First Issue
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onClick={() => {
                // Navigate to report detail page
                console.log('View report:', report.id)
              }}
            />
          ))}
        </div>
      )}

      {/* Report Form Modal - Only show for authenticated users */}
      {user && (
        <ReportForm
          isOpen={isReportModalOpen}
          onClose={closeReportModal}
          onSubmit={handleReportSubmit}
        />
      )}
    </div>
  )
}

export default Feed
