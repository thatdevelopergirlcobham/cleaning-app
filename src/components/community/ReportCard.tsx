import React from 'react'
import { MapPin, Calendar, User, MessageCircle } from 'lucide-react'
import type { ReportWithProfile } from '../../api/reports'

interface ReportCardProps {
  report: ReportWithProfile
  onClick?: () => void
}

const ReportCard: React.FC<ReportCardProps> = ({ report, onClick }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success text-white'
      case 'resolved':
        return 'bg-primary text-white'
      case 'rejected':
        return 'bg-error text-white'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="card cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      {report.image_url && (
        <div className="mb-4 -m-6 rounded-t-2xl overflow-hidden">
          <img
            src={report.image_url}
            alt="Waste report"
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="font-heading font-semibold text-lg text-gray-900 line-clamp-2">
            {report.title}
          </h3>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
          </span>
        </div>

        <p className="text-gray-600 text-sm line-clamp-3">
          {report.description}
        </p>

        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span>
              {typeof report.location === 'object' && report.location !== null
                ? `${report.location.lat.toFixed(4)}, ${report.location.lng.toFixed(4)}`
                : report.location || 'N/A'}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(report.created_at)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-3 h-3 text-primary" />
            </div>
            <span className="text-sm text-gray-600">
              {report.user_profiles?.full_name || 'Anonymous'}
            </span>
          </div>

          <button className="flex items-center space-x-1 text-primary hover:text-primary/80 transition-colors">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">View</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReportCard
