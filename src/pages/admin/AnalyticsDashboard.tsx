import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react'
import type { ReportWithProfile } from '../../api/reports'
import type { EventWithProfile } from '../../api/events'
import { getReports } from '../../api/reports'
import { eventsApi } from '../../api/events'
// import { usersApi } from '../../api/users'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts'
import LoadingSpinner from '../../components/LoadingSpinner'

interface AnalyticsData {
  reportTrends: Array<{
    date: string
    pending: number
    approved: number
    rejected: number
    resolved: number
  }>
  statusDistribution: Array<{
    name: string
    value: number
    color: string
  }>
  locationHotspots: Array<{
    location: string
    count: number
    lat: number
    lng: number
  }>
  userActivity: Array<{
    date: string
    reports: number
    events: number
  }>
  topReporters: Array<{
    user_id: string
    full_name: string
    report_count: number
    avatar_url?: string | null
  }>
}

interface LocationCount {
  location: string
  count: number
  lat: number
  lng: number
}

interface Reporter {
  user_id: string
  full_name: string
  report_count: number
  avatar_url?: string | null
}

const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  const loadAnalyticsData = useCallback(async () => {
    setLoading(true)
    try {
      // Load all data in parallel with per-call fallbacks to avoid failing whole dashboard
      const [reportsResponse, eventsResponse] = await Promise.all([
        getReports().catch(() => [] as ReportWithProfile[]),
        eventsApi.getAllEvents().catch(() => [] as EventWithProfile[])
      ])

      const allReports = Array.isArray(reportsResponse) ? reportsResponse : []
      const allEvents = Array.isArray(eventsResponse) ? eventsResponse : []

      // Process report trends (last 30 days by default)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const recentReports = allReports.filter((report: ReportWithProfile) =>
        new Date(report.created_at) >= thirtyDaysAgo
      )

      // Group by date and status
      const reportTrendsMap = new Map<string, { pending: number; approved: number; rejected: number; resolved: number }>()

      recentReports.forEach((report: ReportWithProfile) => {
        const date = new Date(report.created_at).toISOString().split('T')[0]
        const current = reportTrendsMap.get(date) || { pending: 0, approved: 0, rejected: 0, resolved: 0 }
        switch (report.status) {
          case 'pending':
            current.pending++
            break
          case 'approved':
            current.approved++
            break
          case 'rejected':
            current.rejected++
            break
          case 'resolved':
            current.resolved++
            break
        }
        reportTrendsMap.set(date, current)
      })

      const reportTrends = Array.from(reportTrendsMap.entries())
        .map(([date, counts]) => ({ date, ...counts }))
        .sort((a, b) => a.date.localeCompare(b.date))

      // Status distribution
      const statusCounts = {
        pending: allReports.filter((r: ReportWithProfile) => r.status === 'pending').length,
        approved: allReports.filter((r: ReportWithProfile) => r.status === 'approved').length,
        rejected: allReports.filter((r: ReportWithProfile) => r.status === 'rejected').length,
        resolved: allReports.filter((r: ReportWithProfile) => r.status === 'resolved').length
      }

      const statusDistribution = [
        { name: 'Pending', value: statusCounts.pending, color: '#F59E0B' },
        { name: 'Approved', value: statusCounts.approved, color: '#10B981' },
        { name: 'Rejected', value: statusCounts.rejected, color: '#EF4444' },
        { name: 'Resolved', value: statusCounts.resolved, color: '#8B5CF6' }
      ]

      // Location hotspots (top 10 locations by report count)
      const locationCounts = allEvents.reduce<Record<string, LocationCount>>((acc: Record<string, LocationCount>, event: EventWithProfile) => {
        let lat = 0, lng = 0;
        let locationKey = '';
        if (typeof event.location === 'object' && event.location !== null && 'lat' in event.location && 'lng' in event.location) {
          lat = event.location.lat;
          lng = event.location.lng;
          locationKey = `${lat},${lng}`;
        } else {
          locationKey = String(event.location);
        }
        if (!acc[locationKey]) {
          acc[locationKey] = {
            location: locationKey,
            count: 0,
            lat,
            lng
          }
        }
        acc[locationKey].count++;
        return acc;
      }, {})

      const locationHotspots = Object.values(locationCounts)
        .sort((a: LocationCount, b: LocationCount) => b.count - a.count)
        .slice(0, 10)

      // User activity (reports and events over time)
      const userActivityMap = new Map<string, { reports: number; events: number }>()

  recentReports.forEach((report: ReportWithProfile) => {
        const date = new Date(report.created_at).toISOString().split('T')[0]
        const current = userActivityMap.get(date) || { reports: 0, events: 0 }
        current.reports++
        userActivityMap.set(date, current)
      })

  allEvents.forEach((event: { date: string }) => {
        const date = new Date(event.date).toISOString().split('T')[0]
        const current = userActivityMap.get(date) || { reports: 0, events: 0 }
        current.events++
        userActivityMap.set(date, current)
      })

      const userActivity = Array.from(userActivityMap.entries())
        .map(([date, activity]) => ({ date, ...activity }))
        .sort((a, b) => a.date.localeCompare(b.date))

      // Top reporters
      const reporterCounts = Object.entries(
        allReports.reduce<Record<string, Reporter>>((acc, report: ReportWithProfile) => {
          const userId = report.user_id
          const name = report.user_profiles?.full_name
            || (report.user_profiles?.email ? String(report.user_profiles.email).split('@')[0] : undefined)
            || 'Unknown'
          if (!acc[userId]) {
            acc[userId] = {
              user_id: userId,
              full_name: name,
              report_count: 0,
              avatar_url: report.user_profiles?.avatar_url
            }
          }
          acc[userId].report_count++
          return acc
        }, {})
      )

      const topReporters = reporterCounts
        .map(([, data]: [string, Reporter]) => ({ ...data }))
        .sort((a, b) => b.report_count - a.report_count)
        .slice(0, 10)

      setData({
        reportTrends: reportTrends || [],
        statusDistribution: statusDistribution || [],
        locationHotspots: locationHotspots || [],
        userActivity: userActivity || [],
        topReporters: topReporters || []
      })

    } catch (error) {
      console.error('Error loading analytics data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAnalyticsData()
  }, [loadAnalyticsData])

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner className="h-12 w-12 mx-auto" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6">
        <p className="text-center text-gray-500">Failed to load analytics data</p>
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
          Analytics Dashboard
        </h1>
        <p className="text-gray-600">
          Comprehensive insights into platform activity and user engagement
        </p>
      </motion.div>

      {/* Time Range Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-6"
      >
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Time Range:</span>
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                timeRange === range
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {[
          { label: 'Total Reports', value: data.statusDistribution.reduce((sum, item) => sum + item.value, 0), icon: BarChart3, color: 'text-blue-600' },
          { label: 'Pending Reviews', value: data.statusDistribution.find(item => item.name === 'Pending')?.value || 0, icon: Clock, color: 'text-orange-600' },
          { label: 'Active Users', value: data.topReporters.length, icon: Users, color: 'text-purple-600' },
          { label: 'Resolved Issues', value: data.statusDistribution.find(item => item.name === 'Resolved')?.value || 0, icon: CheckCircle, color: 'text-green-600' }
        ].map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 * index }}
            className="card hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{metric.label}</p>
                <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
              </div>
              <div className={`w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center`}>
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Report Trends */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading font-semibold text-xl text-gray-900">
              Report Trends
            </h2>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.reportTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="pending" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
              <Area type="monotone" dataKey="approved" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
              <Area type="monotone" dataKey="resolved" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading font-semibold text-xl text-gray-900">
              Report Status Distribution
            </h2>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.statusDistribution}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
              >
                {data.statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* User Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading font-semibold text-xl text-gray-900">
              User Activity
            </h2>
            <Users className="w-5 h-5 text-gray-400" />
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.userActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="reports" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="events" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Reporters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading font-semibold text-xl text-gray-900">
              Top Reporters
            </h2>
            <Users className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            {data.topReporters.map((reporter, index) => (
              <div key={reporter.user_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      #{index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{reporter.full_name}</p>
                    <p className="text-sm text-gray-500">{reporter.report_count} reports</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{reporter.report_count}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default AnalyticsDashboard
