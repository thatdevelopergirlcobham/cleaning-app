import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  // FileText,
  CheckCircle,
  XCircle,
  Eye,
  MapPin,
  Calendar,
  User,
  // Search,
} from 'lucide-react'
import { useToast } from '../../hooks/useToast'
import { getReports, updateReport, type ReportWithProfile } from '../../api/reports'
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
      const pendingReports = allReports.filter(r => r.status === 'pending')
      setReports(pendingReports)
      setFilteredReports(pendingReports)
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
        location: report.location,
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
        report.user.name.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleApprove = async (reportId: string) => {
    try {
      await updateReport(reportId, { status: 'approved' })
      addToast({ type: 'success', title: 'Approved', message: 'Report approved successfully.' })
      fetchReports()
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to approve report.' })
    }
  }

  const handleReject = async (reportId: string) => {
    try {
      await updateReport(reportId, { status: 'rejected' })
      addToast({ type: 'warning', title: 'Rejected', message: 'Report rejected.' })
      fetchReports()
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to reject report.' })
    }
  }

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600'
      case 'rejected':
        return 'text-red-600'
      default:
        return 'text-yellow-600'
    }
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
                <td className="p-2 font-medium">{report.title}</td>
                <td className="p-2">{report.user.name}</td>
                <td className="p-2 flex items-center gap-1">
                  <MapPin size={16} />
                  {typeof report.location === 'object' 
                    ? `${report.location.lat.toFixed(4)}, ${report.location.lng.toFixed(4)}`
                    : report.location}
                </td>
                <td className="p-2 flex items-center gap-1"><Calendar size={16} />{new Date(report.created_at).toLocaleDateString()}</td>
                <td className={`p-2 ${getStatusColor(report.status)}`}>{report.status}</td>
                <td className="p-2 text-right flex gap-2 justify-end">
                  <button onClick={() => handleApprove(report.id)} className="text-green-600 hover:text-green-800"><CheckCircle size={20} /></button>
                  <button onClick={() => handleReject(report.id)} className="text-red-600 hover:text-red-800"><XCircle size={20} /></button>
                  <button onClick={() => handleViewReport(report)} className="text-blue-600 hover:text-blue-800"><Eye size={20} /></button>
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
          <p className="text-gray-600 flex items-center gap-1 mb-1"><User size={16} /> {selectedReport.user.name}</p>
          <p className="text-gray-600 flex items-center gap-1 mb-1">
            <MapPin size={16} />
            {typeof selectedReport.location === 'object'
              ? `${selectedReport.location.lat.toFixed(4)}, ${selectedReport.location.lng.toFixed(4)}`
              : selectedReport.location}
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
