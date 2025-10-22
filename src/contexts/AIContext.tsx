import React, { createContext, useContext, useState } from 'react'
import { aiApi } from '../api/ai'
import type { AIInsight, EcoBotRequest } from '../api/ai'

interface AIContextType {
  isAIChatOpen: boolean
  currentInsights: AIInsight[]
  isLoading: boolean
  error: string | null

  // Actions
  toggleAIChat: () => void
  openAIChat: () => void
  closeAIChat: () => void
  getInsights: (request: EcoBotRequest) => Promise<void>
  clearInsights: () => void
  sendMessage: (message: string) => Promise<void>
}

const AIContext = createContext<AIContextType | undefined>(undefined)

export const useAI = () => {
  const context = useContext(AIContext)
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider')
  }
  return context
}

interface AIProviderProps {
  children: React.ReactNode
}

export const AIProvider: React.FC<AIProviderProps> = ({ children }) => {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false)
  const [currentInsights, setCurrentInsights] = useState<AIInsight[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleAIChat = () => setIsAIChatOpen(!isAIChatOpen)
  const openAIChat = () => setIsAIChatOpen(true)
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
          insights = await aiApi.getEventSuggestions()
          break
        case 'kpi_analysis':
          if (request.kpiData) {
            const kpiInsight = await aiApi.analyzeKPIs(request.kpiData)
            insights = [kpiInsight]
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
      // For now, we'll use general context for chat messages
      // In a full implementation, you'd want to analyze the message intent
      const request: EcoBotRequest = {
        context: 'general',
        userInput: message
      }

      await getInsights(request)
    } catch (err) {
      setError('Failed to send message. Please try again.')
      console.error('AI Send Message Error:', err)
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
  }

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  )
}
