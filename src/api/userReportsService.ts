import { supabase } from './supabaseClient'

// Types for Report
export interface Report {
  id: string
  profile_id: string
  title: string
  description: string
  status: 'pending' | 'approved' | 'rejected' | 'resolved'
  image_url?: string
  location?: {
    lat: number
    lng: number
    address?: string
  }
  created_at: string
  updated_at: string
  votes: number
  comments_count: number
  is_resolved: boolean
  resolved_at?: string
  type?: string
  severity?: 'low' | 'medium' | 'high'
  area?: string
  tags?: string[]
  category?: string
  priority?: 'low' | 'medium' | 'high'
  is_anonymous: boolean
  resolution_status?: string
  resolved_by?: string
  resolution_notes?: string
}

export interface CreateReportInput {
  title: string
  description: string
  category?: string
  type?: string
  severity?: 'low' | 'medium' | 'high'
  priority?: 'low' | 'medium' | 'high'
  area?: string
  image_url?: string
  location?: {
    lat: number
    lng: number
    address?: string
  }
  tags?: string[]
  is_anonymous?: boolean
}

export interface UpdateReportInput {
  title?: string
  description?: string
  category?: string
  type?: string
  severity?: 'low' | 'medium' | 'high'
  priority?: 'low' | 'medium' | 'high'
  area?: string
  image_url?: string
  location?: {
    lat: number
    lng: number
    address?: string
  }
  tags?: string[]
}

/**
 * User Reports Service
 * Handles CRUD operations for user-specific reports
 */
export class UserReportsService {
  /**
   * Get the current logged-in user's ID
   */
  private static async getCurrentUserId(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    return user.id
  }

  /**
   * GET: Fetch all reports for the current logged-in user
   */
  static async getUserReports(): Promise<Report[]> {
    try {
      const userId = await this.getCurrentUserId()
      
      if (!userId) {
        throw new Error('User not found')
      }

      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching user reports:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error in getUserReports:', error)
      throw error
    }
  }

  /**
   * GET: Fetch a single report by ID (only if it belongs to the user)
   */
  static async getUserReportById(reportId: string): Promise<Report | null> {
    try {
      const userId = await this.getCurrentUserId()
      
      if (!userId) {
        throw new Error('User not found')
      }

      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', reportId)
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Error fetching report:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in getUserReportById:', error)
      throw error
    }
  }

  /**
   * CREATE: Create a new report for the current user
   */
  static async createUserReport(reportData: CreateReportInput): Promise<Report> {
    try {
      const userId = await this.getCurrentUserId()
      
      if (!userId) {
        throw new Error('User not found')
      }

      const { data, error } = await supabase
        .from('reports')
        .insert({
          user_id: userId,
          title: reportData.title,
          description: reportData.description,
          category: reportData.category,
          type: reportData.type,
          severity: reportData.severity || 'low',
          priority: reportData.priority || 'low',
          area: reportData.area,
          image_url: reportData.image_url,
          location: reportData.location,
          tags: reportData.tags || [],
          is_anonymous: reportData.is_anonymous || false,
          status: 'pending',
          votes: 0,
          comments_count: 0,
          is_resolved: false
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating report:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in createUserReport:', error)
      throw error
    }
  }

  /**
   * UPDATE: Update an existing report (only if it belongs to the user)
   */
  static async updateUserReport(
    reportId: string,
    updates: UpdateReportInput
  ): Promise<Report> {
    try {
      const userId = await this.getCurrentUserId()
      
      if (!userId) {
        throw new Error('User not found')
      }

      // Build the update object with only provided fields
      const updateData: any = {
        updated_at: new Date().toISOString()
      }

      if (updates.title !== undefined) updateData.title = updates.title
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.category !== undefined) updateData.category = updates.category
      if (updates.type !== undefined) updateData.type = updates.type
      if (updates.severity !== undefined) updateData.severity = updates.severity
      if (updates.priority !== undefined) updateData.priority = updates.priority
      if (updates.area !== undefined) updateData.area = updates.area
      if (updates.image_url !== undefined) updateData.image_url = updates.image_url
      if (updates.location !== undefined) updateData.location = updates.location
      if (updates.tags !== undefined) updateData.tags = updates.tags

      const { data, error } = await supabase
        .from('reports')
        .update(updateData)
        .eq('id', reportId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating report:', error)
        throw error
      }

      if (!data) {
        throw new Error('Report not found or you do not have permission to update it')
      }

      return data
    } catch (error) {
      console.error('Error in updateUserReport:', error)
      throw error
    }
  }

  /**
   * DELETE: Delete a report (only if it belongs to the user)
   */
  static async deleteUserReport(reportId: string): Promise<boolean> {
    try {
      const userId = await this.getCurrentUserId()
      
      if (!userId) {
        throw new Error('User not found')
      }

      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId)
        .eq('user_id', userId)

      if (error) {
        console.error('Error deleting report:', error)
        throw error
      }

      return true
    } catch (error) {
      console.error('Error in deleteUserReport:', error)
      throw error
    }
  }

  /**
   * GET: Fetch reports with filters
   */
  static async getUserReportsWithFilters(filters: {
    status?: string
    category?: string
    priority?: string
    severity?: string
    is_resolved?: boolean
  }): Promise<Report[]> {
    try {
      const userId = await this.getCurrentUserId()
      
      if (!userId) {
        throw new Error('User not found')
      }

      let query = supabase
        .from('reports')
        .select('*')
        .eq('user_id', userId)

      // Apply filters
      if (filters.status) query = query.eq('status', filters.status)
      if (filters.category) query = query.eq('category', filters.category)
      if (filters.priority) query = query.eq('priority', filters.priority)
      if (filters.severity) query = query.eq('severity', filters.severity)
      if (filters.is_resolved !== undefined) query = query.eq('is_resolved', filters.is_resolved)

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) {
        console.error('Error fetching filtered reports:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error in getUserReportsWithFilters:', error)
      throw error
    }
  }

  /**
   * GET: Count user's reports by status
   */
  static async getUserReportsCount(): Promise<{
    total: number
    pending: number
    approved: number
    rejected: number
    resolved: number
  }> {
    try {
      const userId = await this.getCurrentUserId()
      
      if (!userId) {
        throw new Error('User not found')
      }

      const { data, error } = await supabase
        .from('reports')
        .select('status')
        .eq('user_id', userId)

      if (error) {
        console.error('Error fetching reports count:', error)
        throw error
      }

      const counts = {
        total: data?.length || 0,
        pending: data?.filter(r => r.status === 'pending').length || 0,
        approved: data?.filter(r => r.status === 'approved').length || 0,
        rejected: data?.filter(r => r.status === 'rejected').length || 0,
        resolved: data?.filter(r => r.status === 'resolved').length || 0
      }

      return counts
    } catch (error) {
      console.error('Error in getUserReportsCount:', error)
      throw error
    }
  }
}

export default UserReportsService
