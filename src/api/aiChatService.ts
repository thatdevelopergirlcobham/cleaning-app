import { supabase } from './supabaseClient'

export type ChatRole = 'user' | 'assistant'

export interface ChatMessageRecord {
  id: string
  user_id: string
  role: ChatRole
  content: string
  created_at: string
}

export const aiChatService = {
  async fetchMessages(userId: string, limit = 100): Promise<ChatMessageRecord[]> {
    const { data, error } = await supabase
      .from('ai_chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(limit)

    if (error) throw error
    return data || []
  },

  async appendMessage(userId: string, role: ChatRole, content: string): Promise<void> {
    const { error } = await supabase
      .from('ai_chat_messages')
      .insert({ user_id: userId, role, content })

    if (error) throw error
  },
}
