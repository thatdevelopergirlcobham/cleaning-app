import { supabase } from './supabaseClient'
import { notificationsApi } from './notifications'
import { aiApi } from './ai'
import type { Database } from './supabaseClient'

type Report = Database['public']['Tables']['reports']['Row']
type ReportInsert = Database['public']['Tables']['reports']['Insert']
type ReportUpdate = Database['public']['Tables']['reports']['Update']

export interface ReportWithProfile extends Report {
  user_profiles: {
    full_name: string
    avatar_url?: string
  }
  category?: string
}

export const reportsApi = {
  // Get all reports for analytics
  async getAllReports() {
    const { data, error } = await supabase
      .from('reports')
      .select(`
        *,
        user_profiles!reports_user_id_fkey (
          full_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as ReportWithProfile[]
  },

  // Get all approved reports for the community feed
  async getApprovedReports() {
    const { data, error } = await supabase
      .from('reports')
      .select(`
        *,
        user_profiles!reports_user_id_fkey (
          full_name,
          avatar_url
        )
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as ReportWithProfile[]
  },

  // Get pending reports for admin review
  async getPendingReports() {
    const { data, error } = await supabase
      .from('reports')
      .select(`
        *,
        user_profiles!reports_user_id_fkey (
          full_name,
          avatar_url
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as ReportWithProfile[]
  },

  // Get reports by user
  async getUserReports(userId: string) {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Create a new report
  async createReport(report: ReportInsert) {
    try {
      // Use AI to categorize the report
      const category = await aiApi.categorizeReport({
        title: report.title,
        description: report.description
      })

      // Use AI to determine priority
      const priority = await aiApi.getReportPriority({
        title: report.title,
        description: report.description,
        location: report.location
      })

      const { data, error } = await supabase
        .from('reports')
        .insert({
          ...report,
          category: category,
          priority: priority
        })
        .select(`
          *,
          user_profiles!reports_user_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .single()

      if (error) throw error

      const reportWithProfile = data as ReportWithProfile

      // Notify admins about new report submission
      try {
        // Get all admin users
        const { data: admins } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('role', 'admin')

        if (admins && admins.length > 0) {
          // Create notifications for all admins
          await Promise.all(
            admins.map(admin =>
              notificationsApi.createNotification({
                user_id: admin.id,
                title: 'New Report Submitted',
                message: `A new ${category} report "${reportWithProfile.title}" has been submitted and needs review.`,
                type: 'report_submitted',
                data: { report_id: reportWithProfile.id, report_title: reportWithProfile.title, category }
              })
            )
          )
        }
      } catch (notificationError) {
        console.error('Failed to create admin notifications:', notificationError)
        // Don't throw error here as the main operation succeeded
      }

      return reportWithProfile
    } catch (error) {
      console.error('Error creating report:', error)
      throw error
    }
  },

  // Update report status (admin only)
  async updateReportStatus(id: string, status: ReportUpdate['status']) {
    const { data, error } = await supabase
      .from('reports')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        *,
        user_profiles!reports_user_id_fkey (
          full_name,
          avatar_url
        )
      `)
      .single()

    if (error) throw error

    const reportWithProfile = data as ReportWithProfile

    // Create notification for the user
    try {
      if (status === 'approved') {
        await notificationsApi.createNotification({
          user_id: reportWithProfile.user_id,
          title: 'Report Approved! 🎉',
          message: `Your report "${reportWithProfile.title}" has been approved and is now visible to the community.`,
          type: 'report_approved',
          data: { report_id: id, report_title: reportWithProfile.title }
        })
      } else if (status === 'rejected') {
        await notificationsApi.createNotification({
          user_id: reportWithProfile.user_id,
          title: 'Report Update',
          message: `Your report "${reportWithProfile.title}" has been reviewed.`,
          type: 'report_rejected',
          data: { report_id: id, report_title: reportWithProfile.title }
        })
      }
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError)
      // Don't throw error here as the main operation succeeded
    }

    return reportWithProfile
  },

  // Delete a report
  async deleteReport(id: string) {
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Get report by ID
  async getReportById(id: string) {
    const { data, error } = await supabase
      .from('reports')
      .select(`
        *,
        user_profiles!reports_user_id_fkey (
          full_name,
          avatar_url
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data as ReportWithProfile
  },

  // Subscribe to real-time report updates
  subscribeToReports(callback: (payload: any) => void) {
    return supabase
      .channel('reports')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'reports' },
        callback
      )
      .subscribe()
  }
}
