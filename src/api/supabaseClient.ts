import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

export const restHeaders = () => ({
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
})

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: {
      getItem: (key: string) => {
        if (typeof window !== 'undefined') {
          return localStorage.getItem(key)
        }
        return null
      },
      setItem: (key: string, value: string) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem(key, value)
        }
      },
      removeItem: (key: string) => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(key)
        }
      }
    }
  },
  global: {
    headers: {
      'x-client-info': 'supabase-js-web'
    },
    fetch: (url, options = {}) => {
      return fetch(url, {
        ...options,
        signal: AbortSignal.timeout(60000) // 60 second timeout
      })
    }
  }
})

// Database Types
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      report_comments: {
        Row: {
          id: string
          report_id: string
          user_id: string | null
          content: string
          is_anonymous: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          report_id: string
          user_id?: string | null
          content: string
          is_anonymous?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          report_id?: string
          user_id?: string | null
          content?: string
          is_anonymous?: boolean
          updated_at?: string
        }
      },
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
          data?: Record<string, unknown>
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
          data?: Record<string, unknown>
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
          data?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
