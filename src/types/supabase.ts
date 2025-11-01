export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      reports: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string
          location: Json
          image_url?: string
          status: 'pending' | 'in_progress' | 'resolved'
          severity?: 'low' | 'medium' | 'high' | 'urgent'
          waste_type?: string
          user_id: string
          updated_at?: string
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description: string
          location: Json
          image_url?: string
          status?: 'pending' | 'in_progress' | 'resolved'
          severity?: 'low' | 'medium' | 'high' | 'urgent'
          waste_type?: string
          user_id: string
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string
          location?: Json
          image_url?: string
          status?: 'pending' | 'in_progress' | 'resolved'
          severity?: 'low' | 'medium' | 'high' | 'urgent'
          waste_type?: string
          user_id?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          full_name: string
          avatar_url?: string
          updated_at?: string
        }
        Insert: {
          id: string
          created_at?: string
          full_name: string
          avatar_url?: string
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          full_name?: string
          avatar_url?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}