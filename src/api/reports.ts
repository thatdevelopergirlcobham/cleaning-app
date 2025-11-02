import { supabase } from './supabaseClient'
import type { Database } from './supabaseClient'

export type Report = Database['public']['Tables']['reports']['Row']
export type ReportInsert = Database['public']['Tables']['reports']['Insert']
export type ReportUpdate = Database['public']['Tables']['reports']['Update']

// interface User {
//   id: string
//   name: string
//   email?: string
//   avatar_url?: string | null
// }

export type ReportStatus = 'pending' | 'approved' | 'rejected' | 'resolved' | 'in_progress';
export type ReportLocation = { lat: number; lng: number } | string | null;

export interface ReportWithProfile {
  id: string
  title: string
  description: string
  status: ReportStatus
  image_url: string
  location: ReportLocation
  created_at: string
  updated_at: string
  user_id: string
  votes: number
  comments_count: number
  is_resolved: boolean
  resolved_at: string | null
  type: string | null
  severity: 'low' | 'medium' | 'high' | 'urgent' | null
  area: string | null
  tags: string[]
  category: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  is_anonymous: boolean
  resolution_status: string | null
  resolved_by: string | null
  resolution_notes: string | null
  user_profiles?: {
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

export const getReportById = async (id: string): Promise<ReportWithProfile | null> => {
  const { data, error } = await supabase
    .from('reports')
    .select(`
      *,
      user_profiles (
        full_name,
        avatar_url
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    if ('code' in error && error.code === 'PGRST116') return null; // not found
    throw error;
  }

  return data || null;
}

export const createReport = async (report: ReportInsert): Promise<Report> => {
  // Add default values to match the HTML version
  const reportData = {
    ...report,
    votes: 0,
    comments_count: 0,
    is_resolved: false,
    resolved_at: null,
    type: null,
    severity: null,
    area: null,
    tags: [],
    is_anonymous: false,
    resolution_status: null,
    resolved_by: null,
    resolution_notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('reports')
    .insert(reportData)
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