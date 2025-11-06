import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
// removed unused lucide-react icon imports

import { useToast } from '../../hooks/useToast'
import { getReports, updateReport, deleteReport, type ReportWithProfile } from '../../api/reports'

import { aiApi } from '../../api/ai'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'

const PendingReports: React.FC = () => {
  const { addToast } = useToast()
  const [reports, setReports] = useState<ReportWithProfile[]>([])
  const [filteredReports, setFilteredReports] = useState<ReportWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected'
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selectedReport, setSelectedReport] = useState<ReportWithProfile | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [aiInsights, setAiInsights] = useState<string[]>([])
  const [loadingInsights, setLoadingInsights] = useState(false)
  const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set())

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true)
      const allReports = await getReports()
      setReports(allReports)
      setFilteredReports(allReports)
    } catch (error) {
      console.error('Error fetching reports:', error)
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load reports. Please try again.'
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
  location: report.location && typeof report.location === 'object' && report.location !== null ? report.location : { lat: 0, lng: 0 },
        imageUrl: report.image_url
      })
      setAiInsights(insights.map(insight => insight.content))
    } catch {
      setAiInsights(['Unable to generate AI insights for this report.'])
    } finally {
      setLoadingInsights(false)
    }
  }, [])

  const filterReports = useCallback(() => {
    let filtered = reports

    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter)
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(report =>
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
  report.user_profiles && report.user_profiles.full_name && report.user_profiles.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredReports(filtered)
  }, [reports, statusFilter, searchQuery])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  useEffect(() => {
    filterReports()
  }, [filterReports])

  const handleStatusChange = async (
    reportId: string,
    status: 'pending' | 'approved' | 'rejected' | 'resolved'
  ) => {
    try {
      await updateReport(reportId, { status })
      addToast({ type: 'success', title: 'Updated', message: `Status set to ${status}.` })
      fetchReports()
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to update status.' })
    }
  }

  const handleDelete = async (reportId: string) => {
    try {
      if (!confirm('Delete this report? This action cannot be undone.')) return
      await deleteReport(reportId)
      addToast({ type: 'success', title: 'Deleted', message: 'Report deleted.' })
      setReports(prev => prev.filter(r => r.id !== reportId))
      setFilteredReports(prev => prev.filter(r => r.id !== reportId))
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to delete report.' })
    }
  }

  // Single-action helpers can be added if needed (approve/reject/etc.)

  const handleSelectAll = () => {
    setSelectedReports(prev => {
      if (prev.size === filteredReports.length) return new Set()
      return new Set(filteredReports.map(r => r.id))
    })
  }

  const handleViewReport = (report: ReportWithProfile) => {
    setSelectedReport(report)
    setIsDetailModalOpen(true)
    loadAIInsights(report)
  }


  if (loading) return <LoadingSpinner />

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Pending Reports</h1>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border p-2 rounded-md w-64"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="border p-2 rounded-md"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b text-gray-700">
              <th className="p-2"><input type="checkbox" onChange={handleSelectAll} /></th>
              <th className="p-2">Title</th>
              <th className="p-2">User</th>
              <th className="p-2">Location</th>
              <th className="p-2">Date</th>
              <th className="p-2">Status</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report) => (
              <motion.tr
                key={report.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-b hover:bg-gray-50"
              >
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={selectedReports.has(report.id)}
                    onChange={() =>
                      setSelectedReports(prev => {
                        const newSet = new Set(prev)
                        if (newSet.has(report.id)) {
                          newSet.delete(report.id)
                        } else {
                          newSet.add(report.id)
                        }
                        return newSet
                      })
                    }
                  />
                </td>
                <td className="p-2 max-w-xs">
                  <div className="font-medium line-clamp-1">{report.title}</div>
                  <div className="text-xs text-gray-500 line-clamp-2">{report.description}</div>
                </td>
                <td className="p-2">
                  {report.user_profiles && report.user_profiles.full_name ? report.user_profiles.full_name : 'N/A'}
                </td>
                <td className="p-2">
                  {typeof report.location === 'object' && report.location !== null
                    ? `${report.location.lat.toFixed(4)}, ${report.location.lng.toFixed(4)}`
                    : (report.location || 'N/A')}
                </td>
                <td className="p-2 whitespace-nowrap">{new Date(report.created_at).toLocaleString()}</td>
                <td className="p-2">
                  <select
                    value={report.status}
                    onChange={(e) =>
                      handleStatusChange(
                        report.id,
                        e.target.value as 'pending' | 'approved' | 'rejected' | 'resolved'
                      )
                    }
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="pending">pending</option>
                    <option value="approved">approved</option>
                    <option value="rejected">rejected</option>
                    <option value="resolved">resolved</option>
                  </select>
                </td>
                <td className="p-2 text-right">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleViewReport(report)}
                      className="px-2 py-1 text-sm border rounded"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="px-2 py-1 text-sm bg-red-600 text-white rounded"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {isDetailModalOpen && selectedReport && (
        <Modal 
          isOpen={isDetailModalOpen}
          title="Report Details" 
          onClose={() => setIsDetailModalOpen(false)}
        >
          <h2 className="text-xl font-semibold mb-2">{selectedReport.title}</h2>
          <p className="text-gray-700 mb-2">{selectedReport.description}</p>
          <p className="text-gray-600 flex items-center gap-1 mb-1">{selectedReport.user_profiles && selectedReport.user_profiles.full_name ? selectedReport.user_profiles.full_name : 'N/A'}</p>
          <p className="text-gray-600 flex items-center gap-1 mb-1">
            {typeof selectedReport.location === 'object' && selectedReport.location !== null
              ? `${selectedReport.location.lat.toFixed(4)}, ${selectedReport.location.lng.toFixed(4)}`
              : selectedReport.location || 'N/A'}
          </p>
          {loadingInsights ? (
            <LoadingSpinner />
          ) : (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">AI Insights:</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                {aiInsights.map((insight, index) => (
                  <li key={index}>{insight}</li>
                ))}
              </ul>
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}

export default PendingReports
