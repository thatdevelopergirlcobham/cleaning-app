import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hajgpcqbfougojrpaprr.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhamdwY3FiZm91Z29qcnBhcHJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0Njc1MjksImV4cCI6MjA3NjA0MzUyOX0.JcY366RLPTKNCmv19lKcKVJZE1fpTv3VeheDwXRGchY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database Types (to be extended based on your Supabase schema)
export type Database = {
  public: {
    Tables: {
      reports: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          location: { lat: number; lng: number }
          image_url?: string
          status: 'pending' | 'approved' | 'rejected' | 'resolved'
          category?: string
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          location: { lat: number; lng: number }
          image_url?: string
          status?: 'pending' | 'approved' | 'rejected' | 'resolved'
          category?: string
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          location?: { lat: number; lng: number }
          image_url?: string
          status?: 'pending' | 'approved' | 'rejected' | 'resolved'
          category?: string
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          location: { lat: number; lng: number }
          date: string
          max_participants?: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          location: { lat: number; lng: number }
          date: string
          max_participants?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          location?: { lat: number; lng: number }
          date?: string
          max_participants?: number
          created_at?: string
        }
      }
      agent_bookings: {
        Row: {
          id: string
          user_id: string
          agent_id: string
          report_id?: string
          service_type: string
          scheduled_date: string
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          agent_id: string
          report_id?: string
          service_type: string
          scheduled_date: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          agent_id?: string
          report_id?: string
          service_type?: string
          scheduled_date?: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url?: string
          role: 'user' | 'agent' | 'admin'
          phone?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          avatar_url?: string
          role?: 'user' | 'agent' | 'admin'
          phone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string
          role?: 'user' | 'agent' | 'admin'
          phone?: string
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'report_approved' | 'report_rejected' | 'report_submitted' | 'system' | 'ai_insight'
          read: boolean
          data?: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: 'report_approved' | 'report_rejected' | 'report_submitted' | 'system' | 'ai_insight'
          read?: boolean
          data?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: 'report_approved' | 'report_rejected' | 'report_submitted' | 'system' | 'ai_insight'
          read?: boolean
          data?: any
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
