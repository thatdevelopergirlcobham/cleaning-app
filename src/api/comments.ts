import { supabase } from './supabaseClient'
import type { Database } from './supabaseClient'

export type Comment = Database['public']['Tables']['report_comments']['Row']
export type CommentInsert = Database['public']['Tables']['report_comments']['Insert']
export type CommentUpdate = Database['public']['Tables']['report_comments']['Update']

export interface CommentWithUser extends Comment {
  user_profiles?: {
    full_name: string
    avatar_url?: string | null
  } | null
}

export const commentsApi = {
  async getComments(reportId: string): Promise<CommentWithUser[]> {
    const { data, error } = await supabase
      .from('report_comments')
      .select(`
        *,
        user_profiles (
          full_name,
          avatar_url
        )
      `)
      .eq('report_id', reportId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  },

  async createComment(comment: CommentInsert): Promise<CommentWithUser> {
    const { data, error } = await supabase
      .from('report_comments')
      .insert(comment)
      .select(`
        *,
        user_profiles (
          full_name,
          avatar_url
        )
      `)
      .single()

    if (error) throw error
    return data
  },

  async deleteComment(commentId: string): Promise<void> {
    const { error } = await supabase
      .from('report_comments')
      .delete()
      .eq('id', commentId)

    if (error) throw error
  },

  async updateComment(commentId: string, content: string): Promise<CommentWithUser> {
    const { data, error } = await supabase
      .from('report_comments')
      .update({ content })
      .eq('id', commentId)
      .select(`
        *,
        user_profiles (
          full_name,
          avatar_url
        )
      `)
      .single()

    if (error) throw error
    return data as CommentWithUser
  },

  subscribeToComments(reportId: string, callback: (payload: CommentWithUser) => void) {
    return supabase
      .channel(`report_comments:${reportId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'report_comments',
          filter: `report_id=eq.${reportId}`
        },
        (payload) => {
          callback(payload.new as CommentWithUser)
        }
      )
      .subscribe()
  }
}