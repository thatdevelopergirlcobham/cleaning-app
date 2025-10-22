import { supabase } from './supabaseClient'
import type { Database } from './supabaseClient'

type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']

export const usersApi = {
  // Get user profile by ID
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  },

  // Create user profile
  async createUserProfile(profile: UserProfileInsert) {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(profile)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: UserProfileUpdate) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get all agents
  async getAgents() {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('role', 'agent')
      .order('full_name')

    if (error) throw error
    return data
  },

  // Get all admins
  async getAdmins() {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('role', 'admin')
      .order('full_name')

    if (error) throw error
    return data
  },

  // Update user role (admin only)
  async updateUserRole(userId: string, role: UserProfileUpdate['role']) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get user profile by email
  async getUserProfileByEmail(email: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 is "not found"
    return data
  },

  // Get all users (admin only)
  async getAllUsers() {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },
}
