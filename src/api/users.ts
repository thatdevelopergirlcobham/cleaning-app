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
  async getUserProfile(userId: string): Promise<UserProfile> {
    // First try to get the profile
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    // If no profile exists, create one
    if (error && error.code === 'PGRST116') {
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert([{ id: userId }])
        .select()
        .single()
      
      if (createError) throw createError
      return newProfile
    }

    if (error) throw error
    return data
  },

  async updateUserProfile(userId: string, updates: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>): Promise<UserProfile> {
    // Ensure the profile exists
    await this.getUserProfile(userId)
    
    const { data, error } = await supabase
      .from('profiles')
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
      .from('profiles')
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
      .from('profiles')
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
