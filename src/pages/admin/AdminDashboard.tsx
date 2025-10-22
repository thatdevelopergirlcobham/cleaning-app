import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle,
  AlertTriangle,
  Calendar,
  MapPin,
  Clock,
  BarChart3,
  FileText,
  Users,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { reportsApi } from '../../api/reports'
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
    activeUsers: 0
  })
  const [recentReports, setRecentReports] = useState<ReportWithProfile[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<EventWithProfile[]>([])
  const [loading, setLoading] = useState(true)

  const loadDashboardData = useCallback(async () => {
    setLoading(true)
    try {
      // Load all data in parallel
      const [
        pendingReportsResponse,
        approvedReportsResponse,
        eventsResponse,
        usersResponse,
        agentsResponse
      ] = await Promise.all([
        reportsApi.getPendingReports(),
        reportsApi.getApprovedReports(),
        eventsApi.getUpcomingEvents(),
        usersApi.getAllUsers(),
        agentsApi.getAvailableAgents()
      ])

      // Calculate stats
      const pendingReports = pendingReportsResponse || []
      const approvedReports = approvedReportsResponse || []
      const allEvents = eventsResponse || []
      const allUsers = usersResponse || []
      const allAgents = agentsResponse || []

      setStats({
        totalReports: pendingReports.length + approvedReports.length,
        approvedReports: approvedReports.length,
        pendingReports: pendingReports.length,
        resolvedReports: approvedReports.filter(r => r.status === 'resolved').length,
        totalEvents: allEvents.length,
        totalUsers: allUsers.length,
        totalAgents: allAgents.length,
        activeUsers: allUsers.filter(u => u.role === 'user').length
      })

      // Set recent pending reports (last 5) for admin review
      setRecentReports(pendingReports.slice(0, 5))

      // Set upcoming events (next 3)
      setUpcomingEvents(allEvents.slice(0, 3))

    } catch {
      addToast({
        type: 'error',
        title: 'Failed to Load Dashboard',
        message: 'Could not load dashboard data. Please try again.'
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
      await reportsApi.updateReportStatus(reportId, 'approved')
      addToast({
        type: 'success',
        title: 'Report Approved',
        message: 'The report has been approved and is now visible to users.'
      })
      loadDashboardData()
    } catch {
      addToast({
        type: 'error',
        title: 'Approval Failed',
        message: 'Could not approve the report. Please try again.'
      })
    }
  }

  const handleRejectReport = async (reportId: string) => {
    try {
      await reportsApi.updateReportStatus(reportId, 'rejected')
      addToast({
        type: 'success',
        title: 'Report Rejected',
        message: 'The report has been rejected.'
      })
      loadDashboardData()
    } catch {
      addToast({
        type: 'error',
        title: 'Rejection Failed',
        message: 'Could not reject the report. Please try again.'
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
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Approved Reports',
      value: stats.approvedReports,
      change: '+8%',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Pending Reviews',
      value: stats.pendingReports,
      change: '-5%',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      change: '+15%',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-8"
      >
        <h1 className="font-heading font-bold text-3xl text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back, {profile?.full_name}! Here's an overview of your platform.
        </p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {kpiCards.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 * index }}
            className="card hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{kpi.title}</p>
                <p className="text-3xl font-bold text-gray-900">{kpi.value}</p>
                <p className="text-sm text-green-600 font-medium">{kpi.change} from last month</p>
              </div>
              <div className={`w-12 h-12 ${kpi.bgColor} rounded-full flex items-center justify-center`}>
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Reports */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading font-semibold text-xl text-gray-900">
              Pending Reports
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-outline text-sm"
              onClick={() => window.location.href = '/admin/reports'}
            >
              Review All
            </motion.button>
          </div>

          <div className="space-y-4">
            {recentReports.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No reports yet</p>
            ) : (
              recentReports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  className="flex items-start space-x-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{report.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{report.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>{report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(report.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleApproveReport(report.id)}
                      className="px-3 py-1 bg-green-500 text-white text-xs rounded-full hover:bg-green-600 transition-colors"
                    >
                      Approve
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRejectReport(report.id)}
                      className="px-3 py-1 bg-red-500 text-white text-xs rounded-full hover:bg-red-600 transition-colors"
                    >
                      Reject
                    </motion.button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading font-semibold text-xl text-gray-900">
              Upcoming Events
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-outline text-sm"
              onClick={() => window.location.href = '/events'}
            >
              View All
            </motion.button>
          </div>

          <div className="space-y-4">
            {upcomingEvents.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No upcoming events</p>
            ) : (
              upcomingEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  className="flex items-start space-x-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{event.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>{event.location.lat.toFixed(4)}, {event.location.lng.toFixed(4)}</span>
                      </div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1 bg-primary text-white text-xs rounded-full hover:bg-primary/90 transition-colors"
                  >
                    Manage
                  </motion.button>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-8"
      >
        <h2 className="font-heading font-semibold text-xl text-gray-900 mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Review Reports', icon: FileText, href: '/admin/reports', color: 'bg-blue-500' },
            { label: 'Manage Events', icon: Calendar, href: '/events', color: 'bg-green-500' },
            { label: 'View Analytics', icon: BarChart3, href: '/admin/analytics', color: 'bg-purple-500' },
            { label: 'User Management', icon: Users, href: '/admin/users', color: 'bg-orange-500' }
          ].map((action, index) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = action.href}
              className={`${action.color} text-white p-6 rounded-2xl hover:opacity-90 transition-opacity flex flex-col items-center space-y-3`}
            >
              <action.icon className="w-8 h-8" />
              <span className="font-medium">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default AdminDashboard
