import { supabase } from './supabaseClient'
import type { Database } from './supabaseClient'

type Event = Database['public']['Tables']['events']['Row']
type EventInsert = Database['public']['Tables']['events']['Insert']
type EventUpdate = Database['public']['Tables']['events']['Update']

export interface EventWithProfile extends Event {
  user_profiles: {
    full_name: string
    avatar_url?: string
  }
}

export const eventsApi = {
  // Get all events for analytics
  async getAllEvents() {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        user_profiles!events_user_id_fkey (
          full_name,
          avatar_url
        )
      `)
      .order('date', { ascending: false })

    if (error) throw error
    return data as EventWithProfile[]
  },

  // Get all upcoming events
  async getUpcomingEvents() {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        user_profiles!events_user_id_fkey (
          full_name,
          avatar_url
        )
      `)
      .gte('date', new Date().toISOString())
      .order('date', { ascending: true })

    if (error) throw error
    return data as EventWithProfile[]
  },

  // Get events by user
  async getUserEvents(userId: string) {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        user_profiles!events_user_id_fkey (
          full_name,
          avatar_url
        )
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) throw error
    return data as EventWithProfile[]
  },

  // Get event by ID
  async getEventById(id: string) {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        user_profiles!events_user_id_fkey (
          full_name,
          avatar_url
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data as EventWithProfile
  },

  // Create a new event
  async createEvent(event: EventInsert) {
    const { data, error } = await supabase
      .from('events')
      .insert(event)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update event
  async updateEvent(id: string, updates: EventUpdate) {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete event
  async deleteEvent(id: string) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Join event (you might want to create a separate participants table for this)
  async joinEvent(_eventId: string, _userId: string) { // eslint-disable-line @typescript-eslint/no-unused-vars
    // This is a placeholder - you might want to implement a participants table
    // For now, we'll just return success
    return { success: true, message: 'Joined event successfully' }
  },

  // Leave event
  async leaveEvent(_eventId: string, _userId: string) { // eslint-disable-line @typescript-eslint/no-unused-vars
    // This is a placeholder - you might want to implement a participants table
    // For now, we'll just return success
    return { success: true, message: 'Left event successfully' }
  },

  // Subscribe to real-time event updates
  subscribeToEvents(callback: (payload: any) => void) {
    return supabase
      .channel('events')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        callback
      )
      .subscribe()
  }
}
