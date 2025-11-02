import type { AIInsight, EcoBotRequest } from '../api/ai';
import { createContext } from 'react';

export interface AIContextType {
  isAIChatOpen: boolean;
  currentInsights: AIInsight[];
  isLoading: boolean;
  error: string | null;
  toggleAIChat: () => void;
  openAIChat: () => void;
  closeAIChat: () => void;
  getInsights: (request: EcoBotRequest) => Promise<void>;
  clearInsights: () => void;
  sendMessage: (message: string) => Promise<void>;
}

export const AIContext = createContext<AIContextType | undefined>(undefined);