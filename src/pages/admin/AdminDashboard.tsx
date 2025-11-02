import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle,
  AlertTriangle,
  Calendar,
  MapPin,
  Clock,
  // BarChart3,
  FileText,
  Users,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../contexts/ToastContext'
import { getReports, updateReport } from '../../api/reports'
import type { ReportWithProfile } from '../../api/reports'
import { eventsApi } from '../../api/events'
import type { EventWithProfile } from '../../api/events'
import { usersApi } from '../../api/users'
import { agentsApi } from '../../api/agents'
import LoadingSpinner from '../../components/common/LoadingSpinner'

interface DashboardStats {
  totalReports: number
  approvedReports: number
  pendingReports: number
  resolvedReports: number
  totalEvents: number
  totalUsers: number
  totalAgents: number
  activeUsers: number
}

const AdminDashboard: React.FC = () => {
  const { profile } = useAuth()
  const { addToast } = useToast()

  const [stats, setStats] = useState<DashboardStats>({
    totalReports: 0,
    approvedReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    totalEvents: 0,
    totalUsers: 0,
    totalAgents: 0,
    activeUsers: 0,
  })
  const [recentReports, setRecentReports] = useState<ReportWithProfile[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<EventWithProfile[]>([])
  const [loading, setLoading] = useState(true)

  const loadDashboardData = useCallback(async () => {
    setLoading(true)
    try {
      const [allReports, eventsResponse, usersResponse, agentsResponse] = await Promise.all([
        getReports(),
        eventsApi.getUpcomingEvents(),
        usersApi.getAllUsers(),
        agentsApi.getAvailableAgents(),
      ])

      const pendingReports = allReports.filter(r => r.status === 'pending')
      const approvedReports = allReports.filter(r => r.status === 'approved')
      const resolvedReports = allReports.filter(r => r.status === 'resolved')

      setStats({
        totalReports: allReports.length,
        approvedReports: approvedReports.length,
        pendingReports: pendingReports.length,
        resolvedReports: resolvedReports.length,
        totalEvents: eventsResponse.length,
        totalUsers: usersResponse.length,
        totalAgents: agentsResponse.length,
        activeUsers: usersResponse.filter(u => u.role === 'user').length,
      })

      setRecentReports(pendingReports.slice(0, 5))
      setUpcomingEvents(eventsResponse.slice(0, 3))
    } catch {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load dashboard data. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const handleApproveReport = async (reportId: string) => {
    try {
      await updateReport(reportId, { status: 'approved' })
      setRecentReports((prev: ReportWithProfile[]) =>
        prev.map((r: ReportWithProfile) => 
          r.id === reportId ? { ...r, status: 'approved' } as ReportWithProfile : r
        )
      )
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Report approved successfully.',
      })
    } catch (error) {
      console.error('Error approving report:', error)
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to approve report. Please try again.',
      })
    }
  }

  const handleRejectReport = async (reportId: string) => {
    try {
      await updateReport(reportId, { status: 'rejected' })
      setRecentReports((prev: ReportWithProfile[]) => 
        prev.filter((r: ReportWithProfile) => r.id !== reportId)
      )
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Report rejected successfully.',
      })
    } catch (error) {
      console.error('Error rejecting report:', error)
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to reject report. Please try again.',
      })
    }
  }

  const kpiCards = [
    {
      title: 'Total Reports',
      value: stats.totalReports,
      change: '+12%',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Approved Reports',
      value: stats.approvedReports,
      change: '+8%',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Pending Reviews',
      value: stats.pendingReports,
      change: '-5%',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      change: '+15%',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ]

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
      <h1 className="font-heading font-bold text-3xl text-gray-900 mb-2">
        Admin Dashboard
      </h1>
      <p className="text-gray-600 mb-8">
        Welcome back, {profile?.full_name}! Here's an overview of your platform.
      </p>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiCards.map((kpi, i) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 * i }}
            className="card hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{kpi.title}</p>
                <p className="text-3xl font-bold text-gray-900">{kpi.value}</p>
                <p className="text-sm text-green-600 font-medium">
                  {kpi.change} from last month
                </p>
              </div>
              <div
                className={`w-12 h-12 ${kpi.bgColor} rounded-full flex items-center justify-center`}
              >
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pending Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading font-semibold text-xl text-gray-900">
              Pending Reports
            </h2>
            <button
              className="btn-outline text-sm"
              onClick={() => (window.location.href = '/admin/reports')}
            >
              Review All
            </button>
          </div>

          <div className="space-y-4">
            {recentReports.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No reports yet</p>
            ) : (
              recentReports.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * i }}
                  className="flex items-start space-x-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 truncate">{r.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {r.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span>
                        {typeof r.location === 'object' && r.location !== null && 'lat' in r.location && 'lng' in r.location
                          ? `${(r.location as { lat: number; lng: number }).lat.toFixed(4)}, ${(r.location as { lat: number; lng: number }).lng.toFixed(4)}`
                          : r.location || 'N/A'}
                      </span>
                      <Clock className="w-3 h-3 ml-2" />
                      <span>{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApproveReport(r.id)}
                      className="px-3 py-1 bg-green-500 text-white text-xs rounded-full hover:bg-green-600"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectReport(r.id)}
                      className="px-3 py-1 bg-red-500 text-white text-xs rounded-full hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading font-semibold text-xl text-gray-900">
              Upcoming Events
            </h2>
            <button
              className="btn-outline text-sm"
              onClick={() => (window.location.href = '/events')}
            >
              View All
            </button>
          </div>

          <div className="space-y-4">
            {upcomingEvents.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No upcoming events</p>
            ) : (
              upcomingEvents.map((e, i) => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * i }}
                  className="flex items-start space-x-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition"
                >
                  <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 truncate">{e.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {e.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(e.date).toLocaleDateString()}</span>
                      <MapPin className="w-3 h-3" />
                      <span>
                        {typeof e.location === 'object' && e.location !== null && 'lat' in e.location && 'lng' in e.location
                          ? `${(e.location as { lat: number; lng: number }).lat.toFixed(4)}, ${(e.location as { lat: number; lng: number }).lng.toFixed(4)}`
                          : e.location || 'N/A'}
                      </span>
                    </div>
                  </div>
                  <button className="px-3 py-1 bg-primary text-white text-xs rounded-full hover:bg-primary/90">
                    Manage
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default AdminDashboard