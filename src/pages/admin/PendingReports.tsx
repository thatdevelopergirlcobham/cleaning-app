import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  MapPin,
  Calendar,
  User,
  Search,
} from 'lucide-react'
import { useToast } from '../../hooks/useToast'
import { reportsApi } from '../../api/reports'
import type { ReportWithProfile } from '../../api/reports'
import { aiApi } from '../../api/ai'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'

const PendingReports: React.FC = () => {
  const { addToast } = useToast()
  const [reports, setReports] = useState<ReportWithProfile[]>([])
  const [filteredReports, setFilteredReports] = useState<ReportWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [selectedReport, setSelectedReport] = useState<ReportWithProfile | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [aiInsights, setAiInsights] = useState<string[]>([])
  const [loadingInsights, setLoadingInsights] = useState(false)
  const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set())

  const loadReports = useCallback(async () => {
    setLoading(true)
    try {
      const data = await reportsApi.getPendingReports()
      setReports(data)
    } catch {
      addToast({
        type: 'error',
        title: 'Failed to Load Reports',
        message: 'Could not load reports. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }, [addToast])

  const loadAIInsights = useCallback(async (report: ReportWithProfile) => {
    setLoadingInsights(true)
    try {
      const insights = await aiApi.getReportInsights({
        title: report.title,
        description: report.description,
        location: report.location,
        imageUrl: report.image_url
      })
      setAiInsights(insights.map(insight => insight.content))
    } catch {
      setAiInsights(['Unable to generate AI insights for this report.'])
    } finally {
      setLoadingInsights(false)
    }
  }, [addToast])

  const filterReports = useCallback(() => {
    let filtered = reports

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(report =>
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.user_profiles?.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredReports(filtered)
  }, [reports, searchQuery, statusFilter])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  useEffect(() => {
    filterReports()
  }, [filterReports])

  const handleApproveReport = useCallback(async (reportId: string) => {
    try {
      await reportsApi.updateReportStatus(reportId, 'approved')
      addToast({
        type: 'success',
        title: 'Report Approved',
        message: 'The report has been approved and is now visible to users.'
      })
      loadReports()
    } catch {
      addToast({
        type: 'error',
        title: 'Approval Failed',
        message: 'Could not approve the report. Please try again.'
      })
    }
  }, [addToast, loadReports])

  const handleRejectReport = useCallback(async (reportId: string) => {
    try {
      await reportsApi.updateReportStatus(reportId, 'rejected')
      addToast({
        type: 'success',
        title: 'Report Rejected',
        message: 'The report has been rejected.'
      })
      loadReports()
    } catch {
      addToast({
        type: 'error',
        title: 'Rejection Failed',
        message: 'Could not reject the report. Please try again.'
      })
    }
  }, [addToast, loadReports])

  const handleBulkApprove = useCallback(async () => {
    if (selectedReports.size === 0) {
      addToast({
        type: 'error',
        title: 'No Reports Selected',
        message: 'Please select reports to approve'
      })
      return
    }

    try {
      await Promise.all(
        Array.from(selectedReports).map(reportId =>
          reportsApi.updateReportStatus(reportId, 'approved')
        )
      )

      addToast({
        type: 'success',
        title: 'Reports Approved',
        message: `${selectedReports.size} reports have been approved and are now visible to users.`
      })

      setSelectedReports(new Set())
      loadReports()
    } catch {
      addToast({
        type: 'error',
        title: 'Bulk Approval Failed',
        message: 'Some reports could not be approved. Please try again.'
      })
    }
  }, [addToast, selectedReports, loadReports])

  const handleBulkReject = useCallback(async () => {
    if (selectedReports.size === 0) {
      addToast({
        type: 'error',
        title: 'No Reports Selected',
        message: 'Please select reports to reject'
      })
      return
    }

    try {
      await Promise.all(
        Array.from(selectedReports).map(reportId =>
          reportsApi.updateReportStatus(reportId, 'rejected')
        )
      )

      addToast({
        type: 'success',
        title: 'Reports Rejected',
        message: `${selectedReports.size} reports have been rejected.`
      })

      setSelectedReports(new Set())
      loadReports()
    } catch {
      addToast({
        type: 'error',
        title: 'Bulk Rejection Failed',
        message: 'Some reports could not be rejected. Please try again.'
      })
    }
  }, [addToast, selectedReports, loadReports])

  const handleToggleReportSelection = useCallback((reportId: string, isSelected: boolean) => {
    setSelectedReports(prev => {
      const newSet = new Set(prev)
      if (isSelected) {
        newSet.add(reportId)
      } else {
        newSet.delete(reportId)
      }
      return newSet
    })
  }, [])

  const handleSelectAll = useCallback((isSelected: boolean) => {
    if (isSelected) {
      setSelectedReports(new Set(filteredReports.map(report => report.id)))
    } else {
      setSelectedReports(new Set())
    }
  }, [filteredReports])

  const handleViewReport = useCallback(async (report: ReportWithProfile) => {
    setSelectedReport(report)
    setIsDetailModalOpen(true)
    await loadAIInsights(report)
  }, [loadAIInsights])

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner className="h-12 w-12 mx-auto" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-8"
      >
        <h1 className="font-heading font-bold text-3xl text-gray-900 mb-2">
          Reports Management
        </h1>
        <p className="text-gray-600">
          Review, approve, or reject user-submitted waste reports
        </p>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-6 flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as 'all' | 'pending' | 'approved' | 'rejected')}
              className={`px-4 py-2 rounded-2xl font-medium text-sm transition-colors ${
                statusFilter === status
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Bulk Actions Bar */}
      {filteredReports.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-6 p-4 bg-gray-50 rounded-2xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedReports.size === filteredReports.length && filteredReports.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-sm font-medium text-gray-700">
                  Select All ({selectedReports.size} selected)
                </span>
              </label>
            </div>

            {selectedReports.size > 0 && (
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBulkApprove}
                  className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors"
                >
                  Approve Selected ({selectedReports.size})
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBulkReject}
                  className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
                >
                  Reject Selected ({selectedReports.size})
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Reports Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="card"
      >
        {filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-heading font-semibold text-lg text-gray-900 mb-2">
              No reports found
            </h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'No reports have been submitted yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-6 font-medium text-gray-900 w-12">
                    <input
                      type="checkbox"
                      checked={selectedReports.size === filteredReports.length && filteredReports.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Report</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">User</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Status</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Location</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Date</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report, index) => (
                  <motion.tr
                    key={report.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={selectedReports.has(report.id)}
                        onChange={(e) => handleToggleReportSelection(report.id, e.target.checked)}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        {report.image_url && (
                          <img
                            src={report.image_url}
                            alt="Report"
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">{report.title}</p>
                          <p className="text-sm text-gray-600 line-clamp-1">{report.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm text-gray-900">
                          {report.user_profiles?.full_name || 'Anonymous'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(report.created_at).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleViewReport(report)}
                          className="p-2 text-gray-600 hover:text-primary transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        {report.status === 'pending' && (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleApproveReport(report.id)}
                              className="p-2 text-green-600 hover:text-green-700 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleRejectReport(report.id)}
                              className="p-2 text-red-600 hover:text-red-700 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </motion.button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Report Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Report Details"
      >
        {selectedReport && (
          <div className="space-y-6">
            {selectedReport.image_url && (
              <img
                src={selectedReport.image_url}
                alt="Report"
                className="w-full h-48 object-cover rounded-2xl"
              />
            )}

            <div>
              <h3 className="font-heading font-semibold text-lg text-gray-900 mb-2">
                {selectedReport.title}
              </h3>
              <p className="text-gray-600 mb-4">{selectedReport.description}</p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{selectedReport.location.lat.toFixed(6)}, {selectedReport.location.lng.toFixed(6)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{new Date(selectedReport.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>{selectedReport.user_profiles?.full_name || 'Anonymous'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedReport.status)}`}>
                    {selectedReport.status.charAt(0).toUpperCase() + selectedReport.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div>
              <h4 className="font-heading font-semibold text-md text-gray-900 mb-3">
                AI Insights
              </h4>
              <div className="space-y-2">
                {loadingInsights ? (
                  <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <LoadingSpinner className="w-4 h-4" />
                    <p className="text-sm text-blue-800">Generating AI insights...</p>
                  </div>
                ) : aiInsights.length > 0 ? (
                  aiInsights.map((insight, index) => (
                    <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">{insight}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600">No AI insights available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  )
}

export default PendingReports
