import React, { createContext, useContext, useState } from 'react'

interface UIContextType {
  // Modal states
  isReportModalOpen: boolean
  isEventModalOpen: boolean
  isAgentModalOpen: boolean
  isAIModalOpen: boolean

  // Loading states
  isLoading: boolean

  // Mobile menu state
  isMobileMenuOpen: boolean

  // Theme state
  isDarkMode: boolean

  // Actions
  openReportModal: () => void
  closeReportModal: () => void
  openEventModal: () => void
  closeEventModal: () => void
  openAgentModal: () => void
  closeAgentModal: () => void
  openAIModal: () => void
  closeAIModal: () => void
  setLoading: (loading: boolean) => void
  toggleMobileMenu: () => void
  toggleDarkMode: () => void
}

const UIContext = createContext<UIContextType | undefined>(undefined)

export const useUI = () => {
  const context = useContext(UIContext)
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider')
  }
  return context
}

interface UIProviderProps {
  children: React.ReactNode
}

export const UIProvider: React.FC<UIProviderProps> = ({ children }) => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false)
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  const openReportModal = () => setIsReportModalOpen(true)
  const closeReportModal = () => setIsReportModalOpen(false)
  const openEventModal = () => setIsEventModalOpen(true)
  const closeEventModal = () => setIsEventModalOpen(false)
  const openAgentModal = () => setIsAgentModalOpen(true)
  const closeAgentModal = () => setIsAgentModalOpen(false)
  const openAIModal = () => setIsAIModalOpen(true)
  const closeAIModal = () => setIsAIModalOpen(false)
  const setLoading = (loading: boolean) => setIsLoading(loading)
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode)

  const value = {
    isReportModalOpen,
    isEventModalOpen,
    isAgentModalOpen,
    isAIModalOpen,
    isLoading,
    isMobileMenuOpen,
    isDarkMode,
    openReportModal,
    closeReportModal,
    openEventModal,
    closeEventModal,
    openAgentModal,
    closeAgentModal,
    openAIModal,
    closeAIModal,
    setLoading,
    toggleMobileMenu,
    toggleDarkMode,
  }

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  )
}
