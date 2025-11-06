import { useState, useEffect, useCallback } from 'react'
import UserReportsService, { type Report, type CreateReportInput, type UpdateReportInput } from '../api/userReportsService'

interface UseUserReportsReturn {
  reports: Report[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createReport: (data: CreateReportInput) => Promise<Report | null>
  updateReport: (id: string, data: UpdateReportInput) => Promise<Report | null>
  deleteReport: (id: string) => Promise<boolean>
  getReportById: (id: string) => Promise<Report | null>
  counts: {
    total: number
    pending: number
    approved: number
    rejected: number
    resolved: number
  }
}

/**
 * Custom hook for managing user reports with CRUD operations
 */
export const useUserReports = (autoFetch = true): UseUserReportsReturn => {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [counts, setCounts] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    resolved: 0
  })

  /**
   * Fetch all user reports
   */
  const fetchReports = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await UserReportsService.getUserReports()
      setReports(data)
      
      // Calculate counts
      const reportCounts = await UserReportsService.getUserReportsCount()
      setCounts(reportCounts)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reports')
      console.error('Error fetching reports:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Create a new report
   */
  const createReport = useCallback(async (data: CreateReportInput): Promise<Report | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const newReport = await UserReportsService.createUserReport(data)
      
      // Refresh the reports list
      await fetchReports()
      
      return newReport
    } catch (err: any) {
      setError(err.message || 'Failed to create report')
      console.error('Error creating report:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [fetchReports])

  /**
   * Update an existing report
   */
  const updateReport = useCallback(async (
    id: string,
    data: UpdateReportInput
  ): Promise<Report | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const updatedReport = await UserReportsService.updateUserReport(id, data)
      
      // Update the local state
      setReports(prev => 
        prev.map(report => report.id === id ? updatedReport : report)
      )
      
      return updatedReport
    } catch (err: any) {
      setError(err.message || 'Failed to update report')
      console.error('Error updating report:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Delete a report
   */
  const deleteReport = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      const success = await UserReportsService.deleteUserReport(id)
      
      if (success) {
        // Remove from local state
        setReports(prev => prev.filter(report => report.id !== id))
        
        // Update counts
        const reportCounts = await UserReportsService.getUserReportsCount()
        setCounts(reportCounts)
      }
      
      return success
    } catch (err: any) {
      setError(err.message || 'Failed to delete report')
      console.error('Error deleting report:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Get a single report by ID
   */
  const getReportById = useCallback(async (id: string): Promise<Report | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const report = await UserReportsService.getUserReportById(id)
      return report
    } catch (err: any) {
      setError(err.message || 'Failed to fetch report')
      console.error('Error fetching report:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Auto-fetch on mount if enabled
   */
  useEffect(() => {
    if (autoFetch) {
      fetchReports()
    }
  }, [autoFetch, fetchReports])

  return {
    reports,
    loading,
    error,
    refetch: fetchReports,
    createReport,
    updateReport,
    deleteReport,
    getReportById,
    counts
  }
}

export default useUserReports
