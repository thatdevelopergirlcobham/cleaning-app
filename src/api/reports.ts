import { supabase } from './supabaseClient'
import type { Database } from './supabaseClient'

export type Report = Database['public']['Tables']['reports']['Row']
export type ReportInsert = Database['public']['Tables']['reports']['Insert']
export type ReportUpdate = Database['public']['Tables']['reports']['Update']

interface User {
  id: string
  name: string
  email?: string
  avatar_url?: string | null
}

export interface ReportWithProfile extends Report {
  user: User
  user_profiles: {
    full_name: string
    avatar_url?: string | null
  } | null
}

export const getReports = async (): Promise<ReportWithProfile[]> => {
  const { data, error } = await supabase
    .from('reports')
    .select(`
      *,
      user_profiles (
        full_name,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export const createReport = async (report: ReportInsert): Promise<Report> => {
  const { data, error } = await supabase
    .from('reports')
    .insert(report)
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateReport = async (id: string, updates: Partial<ReportUpdate>): Promise<Report> => {
  const { data, error } = await supabase
    .from('reports')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const subscribeToReports = (
  callback: (payload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
    schema: string
    table: string
    new: ReportWithProfile
    old: ReportWithProfile | null
    commit_timestamp: string
    errors: Array<{
      message: string
      code?: string
      details?: string
      hint?: string
    }>
  }) => void
) => {
  return supabase
    .channel('reports')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'reports'
      },
      (payload) => {
        // Transform the payload to match our expected type
        const transformedPayload = {
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE' | '*',
          schema: payload.schema,
          table: payload.table,
          new: payload.new as ReportWithProfile,
          old: payload.old as ReportWithProfile | null,
          commit_timestamp: new Date().toISOString(),
          errors: []
        }
        callback(transformedPayload)
      }
    )
    .subscribe()
}