import { useState, useEffect } from 'react'
import type { ReportWithProfile } from '../api/reports'
import { reportsApi } from '../api/reports'

export const useRealtimeReports = () => {
  const [reports, setReports] = useState<ReportWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReports = async () => {
    try {
      setLoading(true)
      const data = await reportsApi.getApprovedReports()
      setReports(data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch reports')
      console.error('Error fetching reports:', err)
    } finally {
      setLoading(false)
    }
  }

  const addReport = (newReport: ReportWithProfile) => {
    setReports(prev => [newReport, ...prev])
  }

  const updateReport = (updatedReport: ReportWithProfile) => {
    setReports(prev =>
      prev.map(report =>
        report.id === updatedReport.id ? updatedReport : report
      )
    )
  }

  const removeReport = (reportId: string) => {
    setReports(prev => prev.filter(report => report.id !== reportId))
  }

  useEffect(() => {
    fetchReports()

    // Subscribe to real-time updates
    const subscription = reportsApi.subscribeToReports((payload) => {
      console.log('Real-time report update:', payload)

      if (payload.eventType === 'INSERT' && payload.new) {
        // Only add if it's approved (for community feed)
        if (payload.new.status === 'approved') {
          addReport(payload.new as ReportWithProfile)
        }
      } else if (payload.eventType === 'UPDATE' && payload.new) {
        const updatedReport = payload.new as ReportWithProfile

        if (updatedReport.status === 'approved') {
          updateReport(updatedReport)
        } else {
          // Remove if no longer approved
          removeReport(updatedReport.id)
        }
      } else if (payload.eventType === 'DELETE' && payload.old) {
        removeReport(payload.old.id)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    reports,
    loading,
    error,
    refetch: fetchReports,
    addReport,
    updateReport,
    removeReport,
  }
}
