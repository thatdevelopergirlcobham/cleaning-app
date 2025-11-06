import React, { useState } from 'react'
import { aiApi } from '../api/ai'
import type { AIInsight, EcoBotRequest } from '../api/ai'
import { AIContext } from './AIContext.types';
import { useAuth } from '../hooks/useAuth'
import { aiChatService } from '../api/aiChatService'

interface AIProviderProps {
  children: React.ReactNode
}

export const AIProvider: React.FC<AIProviderProps> = ({ children }) => {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false)
  const [currentInsights, setCurrentInsights] = useState<AIInsight[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const toggleAIChat = () => {
    if (!isAIChatOpen && currentInsights.length === 0) {
      // Show welcome message when opening chat for the first time
      setCurrentInsights([{
        type: 'eco_tip',
        content: "Hi! I'm EcoBot, your AI assistant for waste management in Calabar. I can help you with recycling tips, waste sorting, proper disposal methods, and community events. What would you like to know?",
        confidence: 1.0
      }])
    }
    setIsAIChatOpen(!isAIChatOpen)
  }

  // Helper to fetch chat history for current user
  const getChatHistory = async () => {
    if (!user?.id) return [] as { role: 'user' | 'assistant', content: string, created_at: string }[]
    try {
      const rows = await aiChatService.fetchMessages(user.id, 200)
      return rows.map(r => ({ role: r.role as 'user' | 'assistant', content: r.content, created_at: r.created_at }))
    } catch (e) {
      console.warn('Load chat history failed', e)
      return []
    }
  }
  
  const openAIChat = () => {
    if (currentInsights.length === 0) {
      setCurrentInsights([{
        type: 'eco_tip',
        content: "Hi! I'm EcoBot, your AI assistant for waste management in Calabar. I can help you with recycling tips, waste sorting, proper disposal methods, and community events. What would you like to know?",
        confidence: 1.0
      }])
    }
    setIsAIChatOpen(true)
  }
  
  const closeAIChat = () => setIsAIChatOpen(false)

  const getInsights = async (request: EcoBotRequest) => {
    setIsLoading(true)
    setError(null)

    try {
      let insights: AIInsight[] = []

      switch (request.context) {
        case 'report_review':
        case 'report_creation':
          if (request.reportData) {
            insights = await aiApi.getReportInsights(request.reportData)
          }
          break
        case 'event_planning':
          insights = [{
            type: 'event_suggestion',
            content: 'Event suggestions are not available at this time.',
            confidence: 0.8
          }]
          break
        case 'kpi_analysis':
          if (request.kpiData) {
            insights = [{
              type: 'kpi_interpretation',
              content: 'KPI analysis is not available at this time.',
              confidence: 0.8
            }]
          }
          break
        case 'general':
        default:
          insights = [{
            type: 'eco_tip',
            content: 'Hello! I\'m EcoBot, your AI assistant for waste management. I can help with eco tips, report insights, event suggestions, and more!',
            confidence: 0.9
          }]
          break
      }

      setCurrentInsights(insights)
    } catch (err) {
      setError('Failed to get AI insights. Please try again.')
      console.error('AI Context Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async (message: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // 1) Persist user message if authenticated
      if (user?.id) {
        try { await aiChatService.appendMessage(user.id, 'user', message) } catch (e) { console.warn('Persist user msg failed', e) }
      }

      // 2) Try primary endpoint: cleancal-ai
      let botResponse: string | null = null
      try {
        const resp = await fetch('https://cleancal-ai.vercel.app/ask-agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: message }),
        })
        if (resp.ok) {
          const data = await resp.json()
          botResponse = (data?.response ?? '').toString()
        } else {
          const txt = await resp.text()
          console.warn('AI endpoint error', resp.status, txt)
        }
      } catch (e) {
        console.warn('AI endpoint fetch failed, falling back to Gemini', e)
      }

      // 3) Fallback to Gemini service if needed
      if (!botResponse || botResponse.trim().length === 0) {
        botResponse = await aiApi.chatWithEcoBot(message)
      }

      // Convert the response to an AIInsight format
      const responseInsight: AIInsight = {
        type: 'eco_tip',
        content: botResponse,
        confidence: 0.9
      }

      // Add the bot's response to current insights
      setCurrentInsights(prev => [...prev, responseInsight])

      // 4) Persist bot response if authenticated
      if (user?.id) {
        try { await aiChatService.appendMessage(user.id, 'assistant', botResponse) } catch (e) { console.warn('Persist bot msg failed', e) }
      }
    } catch (err) {
      const error = err as Error
      const errorMessage = error.message || 'Failed to send message. Please try again.'
      setError(errorMessage)
      console.error('AI Send Message Error:', err)
      
      // Show error message in chat
      const errorInsight: AIInsight = {
        type: 'eco_tip',
        content: `❌ ${errorMessage}`,
        confidence: 0.5
      }
      setCurrentInsights(prev => [...prev, errorInsight])
    } finally {
      setIsLoading(false)
    }
  }

  const clearInsights = () => {
    setCurrentInsights([])
    setError(null)
  }

  const value = {
    isAIChatOpen,
    currentInsights,
    isLoading,
    error,
    toggleAIChat,
    openAIChat,
    closeAIChat,
    getInsights,
    clearInsights,
    sendMessage,
    getChatHistory,
  }

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  )
}
