import { supabase } from './supabaseClient'

export type UserProfile = {
  id: string
  full_name: string | null
  avatar_url?: string | null
  phone?: string | null
  role?: string
  created_at: string
  updated_at: string
}

export const usersApi = {
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      if ('code' in error && error.code === 'PGRST116') return null
      throw error
    }

    return data
  },

  async createUserProfile(params: { id: string; email: string; full_name: string | null; role?: string }): Promise<UserProfile> {
    const { id, email, full_name, role } = params
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([{
        id,
        email,
        full_name: full_name ?? email.split('@')[0],
        role: role ?? 'user',
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateUserProfile(userId: string, updates: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>): Promise<UserProfile> {
    // Ensure the profile exists
    const existing = await this.getUserProfile(userId)
    if (!existing) throw new Error('Profile does not exist')
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
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
  async updateUserRole(userId: string, role: string) {
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

  // Delete user profile (admin only)
  async deleteUserProfile(userId: string) {
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId)

    if (error) throw error
    return true
  },
}
