import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  Activity,
  Target,
  Award,
  Zap,
  MapPin
} from 'lucide-react'
import { useToast } from '../../contexts/ToastContext'
import { getReports } from '../../api/reports';
import type { Report } from '../../api/reports';
import { eventsApi } from '../../api/events'
import { usersApi } from '../../api/users'
import { agentsApi } from '../../api/agents'
import LoadingSpinner from '../../components/common/LoadingSpinner'

interface AnalyticsData {
  totalReports: number
  approvedReports: number
  rejectedReports: number
  resolvedReports: number
  pendingReports: number
  totalEvents: number
  totalUsers: number
  totalAgents: number
  activeUsers: number
  averageResolutionTime: number
  reportsByMonth: { month: string; count: number }[]
  eventsByMonth: { month: string; count: number }[]
  topReportingAreas: { location: string; count: number }[]
  userEngagement: {
    dailyActive: number
    weeklyActive: number
    monthlyActive: number
  }
}

// Using imported Report type

const KPIs: React.FC = () => {
  const { addToast } = useToast()
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalReports: 0,
    approvedReports: 0,
    rejectedReports: 0,
    resolvedReports: 0,
    pendingReports: 0,
    totalEvents: 0,
    totalUsers: 0,
    totalAgents: 0,
    activeUsers: 0,
    averageResolutionTime: 0,
    reportsByMonth: [],
    eventsByMonth: [],
    topReportingAreas: [],
    userEngagement: { dailyActive: 0, weeklyActive: 0, monthlyActive: 0 }
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [reports, setReports] = useState<Report[]>([])

  const fetchReports = useCallback(async () => {
    try {
      const data = await getReports();
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const loadAnalyticsData = useCallback(async () => {
    setLoading(true)
    try {
      const [
        eventsResponse,
        usersResponse,
        agentsResponse
      ] = await Promise.all([
        eventsApi.getUpcomingEvents(),
        usersApi.getAllUsers(),
        agentsApi.getAvailableAgents()
      ])

      const allEvents = eventsResponse || []
      const allUsers = usersResponse || []
      const allAgents = agentsResponse || []

      // Calculate analytics using the reports state
      const totalReports = reports.length;
      const approvedReports = reports.filter(r => r.status === 'approved').length;
      const rejectedReports = reports.filter(r => r.status === 'rejected').length;
      const resolvedReports = reports.filter(r => r.status === 'resolved').length;
      const pendingReports = reports.filter(r => r.status === 'pending').length;

      // Generate mock data for charts since we don't have historical data
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
      const reportsByMonth = months.map(month => ({
        month,
        count: Math.floor(Math.random() * 50) + 10
      }))

      const eventsByMonth = months.map(month => ({
        month,
        count: Math.floor(Math.random() * 20) + 5
      }))

      // Mock location data
      const topReportingAreas = [
        { location: 'Marina District', count: 45 },
        { location: 'Old Town', count: 32 },
        { location: 'University Area', count: 28 },
        { location: 'Industrial Zone', count: 18 }
      ]

      setAnalytics({
        totalReports,
        approvedReports,
        rejectedReports,
        resolvedReports,
        pendingReports,
        totalEvents: allEvents.length,
        totalUsers: allUsers.length,
        totalAgents: allAgents.length,
        activeUsers: allUsers.filter((u: any) => u.role === 'user').length,
        averageResolutionTime: 2.3, // Mock data in hours
        reportsByMonth,
        eventsByMonth,
        topReportingAreas,
        userEngagement: {
          dailyActive: Math.floor(allUsers.length * 0.3),
          weeklyActive: Math.floor(allUsers.length * 0.6),
          monthlyActive: allUsers.length
        }
      })

    } catch {
      addToast({
        type: 'error',
        title: 'Failed to Load Analytics',
        message: 'Could not load analytics data. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => {
    loadAnalyticsData()
  }, [loadAnalyticsData, timeRange])

  const kpiCards = [
    {
      title: 'Total Reports',
      value: analytics.totalReports,
      change: '+12%',
      trend: 'up',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Approved Reports',
      value: analytics.approvedReports,
      change: '+8%',
      trend: 'up',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Active Users',
      value: analytics.activeUsers,
      change: '+15%',
      trend: 'up',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Total Events',
      value: analytics.totalEvents,
      change: '+22%',
      trend: 'up',
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  const performanceMetrics = [
    {
      title: 'Resolution Rate',
      value: `${((analytics.resolvedReports / analytics.totalReports) * 100 || 0).toFixed(1)}%`,
      target: '85%',
      status: 'on-track',
      icon: Target
    },
    {
      title: 'Avg. Resolution Time',
      value: `${analytics.averageResolutionTime}h`,
      target: '< 4h',
      status: 'excellent',
      icon: Clock
    },
    {
      title: 'User Engagement',
      value: `${analytics.userEngagement.dailyActive} daily`,
      target: '50+ daily',
      status: 'on-track',
      icon: Activity
    },
    {
      title: 'Agent Efficiency',
      value: '94%',
      target: '> 90%',
      status: 'excellent',
      icon: Award
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
          Analytics & KPIs
        </h1>
        <p className="text-gray-600">
          Track platform performance, user engagement, and operational metrics
        </p>

        {/* Time Range Selector */}
        <div className="flex gap-2 mt-4">
          {[
            { key: '7d', label: 'Last 7 days' },
            { key: '30d', label: 'Last 30 days' },
            { key: '90d', label: 'Last 90 days' }
          ].map((range) => (
            <button
              key={range.key}
              onClick={() => setTimeRange(range.key as '7d' | '30d' | '90d')}
              className={`px-4 py-2 rounded-2xl font-medium text-sm transition-colors ${
                timeRange === range.key
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
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
                <div className="flex items-center space-x-1 mt-1">
                  {kpi.trend === 'up' ? (
                    <TrendingUp className="w-3 h-3 text-green-600" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-600" />
                  )}
                  <p className={`text-xs font-medium ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {kpi.change}
                  </p>
                </div>
              </div>
              <div className={`w-12 h-12 ${kpi.bgColor} rounded-full flex items-center justify-center`}>
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {performanceMetrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 * index }}
            className="card"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <metric.icon className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">{metric.title}</span>
              </div>
              <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                metric.status === 'excellent' ? 'bg-green-100 text-green-800' :
                metric.status === 'on-track' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {metric.status === 'excellent' ? 'Excellent' :
                 metric.status === 'on-track' ? 'On Track' : 'Needs Attention'}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
            <p className="text-sm text-gray-600">Target: {metric.target}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Reports by Month */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading font-semibold text-lg text-gray-900">
              Reports by Month
            </h3>
            <BarChart3 className="w-5 h-5 text-gray-600" />
          </div>
          <div className="space-y-4">
            {analytics.reportsByMonth.map((data, index) => (
              <motion.div
                key={data.month}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                className="flex items-center justify-between"
              >
                <span className="text-sm text-gray-600">{data.month}</span>
                <div className="flex items-center space-x-3 flex-1 mx-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${(data.count / Math.max(...analytics.reportsByMonth.map(d => d.count))) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900">{data.count}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Events by Month */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading font-semibold text-lg text-gray-900">
              Events by Month
            </h3>
            <Calendar className="w-5 h-5 text-gray-600" />
          </div>
          <div className="space-y-4">
            {analytics.eventsByMonth.map((data, index) => (
              <motion.div
                key={data.month}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                className="flex items-center justify-between"
              >
                <span className="text-sm text-gray-600">{data.month}</span>
                <div className="flex items-center space-x-3 flex-1 mx-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-accent h-2 rounded-full"
                      style={{ width: `${(data.count / Math.max(...analytics.eventsByMonth.map(d => d.count))) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900">{data.count}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top Reporting Areas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="card mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading font-semibold text-lg text-gray-900">
            Top Reporting Areas
          </h3>
          <MapPin className="w-5 h-5 text-gray-600" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analytics.topReportingAreas.map((area, index) => (
            <motion.div
              key={area.location}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl"
            >
              <div>
                <p className="font-medium text-gray-900">{area.location}</p>
                <p className="text-sm text-gray-600">{area.count} reports</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary">{area.count}</p>
                <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${(area.count / Math.max(...analytics.topReportingAreas.map(a => a.count))) * 100}%` }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* User Engagement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[
          { label: 'Daily Active Users', value: analytics.userEngagement.dailyActive, icon: Activity },
          { label: 'Weekly Active Users', value: analytics.userEngagement.weeklyActive, icon: Users },
          { label: 'Monthly Active Users', value: analytics.userEngagement.monthlyActive, icon: Zap }
        ].map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 * index }}
            className="card text-center"
          >
            <metric.icon className="w-8 h-8 text-primary mx-auto mb-3" />
            <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
            <p className="text-sm text-gray-600">{metric.label}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}

export default KPIs
