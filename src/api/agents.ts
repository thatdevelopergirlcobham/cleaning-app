import { supabase } from './supabaseClient'
import type { Database } from './supabaseClient'

type AgentBooking = Database['public']['Tables']['agent_bookings']['Row']
type AgentBookingInsert = Database['public']['Tables']['agent_bookings']['Insert']
type AgentBookingUpdate = Database['public']['Tables']['agent_bookings']['Update']

export interface AgentBookingWithDetails extends AgentBooking {
  user_profiles: {
    full_name: string
    email: string
    phone?: string
  }
  reports?: {
    title: string
    location: { lat: number; lng: number }
  }
}

export const agentsApi = {
  // Get all agent bookings
  async getAgentBookings() {
    const { data, error } = await supabase
      .from('agent_bookings')
      .select(`
        *,
        user_profiles!agent_bookings_user_id_fkey (
          full_name,
          email,
          phone
        ),
        reports!agent_bookings_report_id_fkey (
          title,
          location
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as AgentBookingWithDetails[]
  },

  // Get bookings by user
  async getUserBookings(userId: string) {
    const { data, error } = await supabase
      .from('agent_bookings')
      .select(`
        *,
        reports!agent_bookings_report_id_fkey (
          title,
          location
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Get bookings for a specific agent
  async getAgentBookingsForAgent(agentId: string) {
    const { data, error } = await supabase
      .from('agent_bookings')
      .select(`
        *,
        user_profiles!agent_bookings_user_id_fkey (
          full_name,
          email,
          phone
        ),
        reports!agent_bookings_report_id_fkey (
          title,
          location
        )
      `)
      .eq('agent_id', agentId)
      .order('scheduled_date', { ascending: true })

    if (error) throw error
    return data as AgentBookingWithDetails[]
  },

  // Create a new booking
  async createBooking(booking: AgentBookingInsert) {
    const { data, error } = await supabase
      .from('agent_bookings')
      .insert(booking)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update booking status
  async updateBookingStatus(id: string, status: AgentBookingUpdate['status']) {
    const { data, error } = await supabase
      .from('agent_bookings')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Cancel booking
  async cancelBooking(id: string) {
    return this.updateBookingStatus(id, 'cancelled')
  },

  // Complete booking
  async completeBooking(id: string) {
    return this.updateBookingStatus(id, 'completed')
  },

  // Get available agents
  async getAvailableAgents() {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('role', 'agent')
      .order('full_name')

    if (error) throw error
    return data
  },

  // Get agent by ID
  async getAgentById(id: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .eq('role', 'agent')
      .single()

    if (error) throw error
    return data
  },

  // Subscribe to real-time booking updates
  subscribeToBookings(callback: (payload: any) => void) {
    return supabase
      .channel('agent_bookings')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'agent_bookings' },
        callback
      )
      .subscribe()
  }
}
