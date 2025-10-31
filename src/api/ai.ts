const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyCuoCwkVC_gDCZh4kb_Pr7k8QCgW4_-KgA';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

export interface AIInsight {
  type: 'eco_tip' | 'contextual_insight' | 'event_suggestion' | 'template_suggestion' | 'kpi_interpretation';
  content: string;
  confidence?: number;
}

export interface EcoBotRequest {
  context: 'report_review' | 'report_creation' | 'event_planning' | 'kpi_analysis' | 'general';
  userInput?: string;
  reportData?: {
    title: string;
    description: string;
    location: { lat: number; lng: number };
    imageUrl?: string;
  };
  kpiData?: {
    totalReports: number;
    resolvedReports: number;
    averageResolutionTime: number;
  };
}

class AIApiService {
  // === API CALL METHODS ===

  // 1. Generate AI insights for reports (Original method at line 31)
  async getReportInsights(reportData: EcoBotRequest['reportData']): Promise<AIInsight[]> {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'AIzaSyCuoCwkVC_gDCZh4kb_Pr7k8QCgW4_-KgA') {
      // Return mock data for development
      return this.getMockReportInsights(reportData);
    }

    try {
      const prompt = this.buildReportPrompt(reportData);
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseGeminiResponse(data);
    } catch (error) {
      console.error('AI API Error:', error);
      throw new Error('Network error. Please check your connection and try again.');
    }
  }
  // No comma needed here

  // 2. Generate AI suggestions for events
  async getEventSuggestions(): Promise<AIInsight[]> {
    if (!GEMINI_API_KEY) {
      throw new Error('AI service not configured. Please add your API key.');
    }

    try {
      const prompt = `Suggest 3 creative community cleanup event ideas for a waste management app in Calabar, Nigeria. Consider local context, seasonal timing, and community engagement. Format as JSON with title, description, and suggested date for each event.`;

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseEventSuggestions(data);
    } catch (error) {
      console.error('AI Event Suggestions Error:', error);
      throw new Error('Network error. Please check your connection and try again.');
    }
  }

  // 3. Generate response templates for admins
  async getResponseTemplates(context: 'report_approval' | 'report_rejection' | 'agent_assignment'): Promise<string[]> {
    if (!GEMINI_API_KEY) {
      throw new Error('AI service not configured. Please add your API key.');
    }

    try {
      const prompts = {
        report_approval: 'Generate 3 professional response templates for approving waste reports in a community waste management app.',
        report_rejection: 'Generate 3 polite response templates for rejecting waste reports in a community waste management app.',
        agent_assignment: 'Generate 3 professional response templates for assigning agents to waste cleanup tasks.'
      };

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompts[context]
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseResponseTemplates(data);
    } catch (error) {
      console.error('AI Templates Error:', error);
      throw new Error('Network error. Please check your connection and try again.');
    }
  }

  // 4. Categorize a report based on title and description
  async categorizeReport(reportData: { title: string; description: string }): Promise<string> {
    if (!GEMINI_API_KEY) {
      throw new Error('AI service not configured. Please add your API key.');
    }

    try {
      const prompt = `Analyze this waste report and categorize it into one of these categories:
      - Plastic Waste
      - Organic Waste
      - Electronic Waste
      - Construction Waste
      - Hazardous Waste
      - General Waste
      - Illegal Dumping

      Report Title: ${reportData.title}
      Report Description: ${reportData.description}

      Return only the category name, nothing else.`;

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 50,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      const category = this.parseCategoryResponse(data);
      return category || 'General Waste';
    } catch (error) {
      console.error('AI Categorization Error:', error);
      throw new Error('Network error. Please check your connection and try again.');
    }
  }

  // 5. Get priority score for a report
  async getReportPriority(reportData: { title: string; description: string; location: { lat: number; lng: number } }): Promise<'low' | 'medium' | 'high' | 'urgent'> {
    if (!GEMINI_API_KEY) {
      throw new Error('AI service not configured. Please add your API key.');
    }

    try {
      const prompt = `Analyze this waste report and assign a priority level (low, medium, high, urgent):

      Report Title: ${reportData.title}
      Report Description: ${reportData.description}
      Location: ${reportData.location.lat}, ${reportData.location.lng}

      Consider:
      - Environmental impact
      - Health and safety risks
      - Location sensitivity (schools, hospitals, water sources)
      - Volume and type of waste

      Return only: low, medium, high, or urgent`;

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 20,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      const priority = this.parsePriorityResponse(data);
      return priority || 'medium';
    } catch (error) {
      console.error('AI Priority Analysis Error:', error);
      throw new Error('Network error. Please check your connection and try again.');
    }
  }

  // 6. Chat with EcoBot (general conversation)
  async chatWithEcoBot(userMessage: string): Promise<string> {
    console.log('ChatWithEcoBot called with:', userMessage);
    console.log('API Key available:', !!GEMINI_API_KEY);

    if (!GEMINI_API_KEY) {
      throw new Error('AI service not configured. Please add your API key.');
    }

    try {
      const prompt = `You are EcoBot, an AI assistant for a waste management app in Calabar, Nigeria called CleanCal. 
      You help users with:
      - Waste sorting and recycling tips
      - Information about waste categories (plastic, organic, electronic, etc.)
      - Proper disposal methods
      - Environmental impact of waste
      - Community cleanup events
      - Waste management best practices
      
      User message: ${userMessage}
      
      Provide a helpful, friendly, and concise response (2-3 sentences max).`;

      console.log('Calling Gemini API...');
      
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 256,
          }
        })
      });

      console.log('Gemini API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error response:', errorText);
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Gemini API response data:', data);
      
      const botResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      
      if (botResponse) {
        console.log('Got response from Gemini:', botResponse);
        return botResponse;
      } else {
        throw new Error('No response from AI. Please try again.');
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      throw new Error('Network error. Please check your connection and try again.');
    }
  }

  // 7. Analyze KPI data
  async analyzeKPIs(kpiData: EcoBotRequest['kpiData']): Promise<AIInsight> {
    if (!GEMINI_API_KEY) {
      throw new Error('AI service not configured. Please add your API key.');
    }

    try {
      const prompt = this.buildKPIPrompt(kpiData);
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 512,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseKPIAnalysis(data, kpiData);
    } catch (error) {
      console.error('AI KPI Analysis Error:', error);
      throw new Error('Network error. Please check your connection and try again.');
    }
  }
  
  // === PRIVATE UTILITY METHODS ===

  private buildReportPrompt(reportData?: EcoBotRequest['reportData']): string {
    if (!reportData) {
      return 'Provide general eco-friendly waste management tips for Calabar, Nigeria.';
    }

    return `
      Analyze this waste report and provide 2-3 actionable insights:

      Title: ${reportData.title}
      Description: ${reportData.description}
      Location: ${reportData.location.lat}, ${reportData.location.lng}

      Focus on:
      1. Waste type identification and sorting recommendations
      2. Nearby recycling centers or proper disposal locations in Calabar
      3. Environmental impact and urgency assessment
      4. Community engagement suggestions

      Format as structured insights with clear recommendations.
    `;
  }

  private buildKPIPrompt(kpiData?: EcoBotRequest['kpiData']): string {
    if (!kpiData) {
      return 'Analyze general waste management KPIs for a community platform.';
    }

    const resolutionRate = ((kpiData.resolvedReports / kpiData.totalReports) * 100).toFixed(1);

    return `
      Analyze these waste management KPIs:
      - Total Reports: ${kpiData.totalReports}
      - Resolved Reports: ${kpiData.resolvedReports}
      - Resolution Rate: ${resolutionRate}%
      - Average Resolution Time: ${kpiData.averageResolutionTime} hours

      Provide insights on performance, areas for improvement, and actionable recommendations for the CleanCal platform in Calabar, Nigeria.
    `;
  }

  // === PARSING METHODS ===

  private parseGeminiResponse(data: Record<string, unknown>): AIInsight[] {
    try {
      const candidates = data?.candidates as Array<{content?: {parts?: Array<{text?: string}>}}> | undefined;
      const text = candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      
      if (text) {
        return [{
          type: 'eco_tip',
          content: text,
          confidence: 0.9
        }];
      }
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
    }
    return [];
  }

  private parseEventSuggestions(data: Record<string, unknown>): AIInsight[] {
    try {
      const candidates = data?.candidates as Array<{content?: {parts?: Array<{text?: string}>}}> | undefined;
      const text = candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      
      if (text) {
        return [{
          type: 'event_suggestion',
          content: text,
          confidence: 0.85
        }];
      }
    } catch (error) {
      console.error('Error parsing event suggestions:', error);
    }
    return [];
  }

  private parseResponseTemplates(data: Record<string, unknown>): string[] {
    try {
      const candidates = data?.candidates as Array<{content?: {parts?: Array<{text?: string}>}}> | undefined;
      const text = candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      
      if (text) {
        return text.split('\n').filter(line => line.trim().length > 0);
      }
    } catch (error) {
      console.error('Error parsing templates:', error);
    }
    return [];
  }

  private getMockKPIAnalysis(_kpiData?: EcoBotRequest['kpiData']): AIInsight {
    return {
      type: 'kpi_interpretation',
      content: `Your platform shows ${_kpiData?.totalReports || 0} total reports with a ${((_kpiData?.resolvedReports || 0) / (_kpiData?.totalReports || 1) * 100).toFixed(1)}% resolution rate. Consider increasing agent availability during peak hours.`,
      confidence: 0.82
    };
  }

  private parseCategoryResponse(data: Record<string, unknown>): string | null {
    try {
      // Type guard for Gemini response structure
      const candidates = data?.candidates as Array<{content?: {parts?: Array<{text?: string}>}}> | undefined;
      const text = candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      
      if (text) {
        // Clean up the response and match against known categories
        const cleanText = text.replace(/["']/g, '').trim();
        const categories = [
          'Plastic Waste',
          'Organic Waste',
          'Electronic Waste',
          'Construction Waste',
          'Hazardous Waste',
          'General Waste',
          'Illegal Dumping'
        ];

        const matchedCategory = categories.find(cat =>
          cleanText.toLowerCase().includes(cat.toLowerCase().split(' ')[0])
        );

        return matchedCategory || 'General Waste';
      }
    } catch (error) {
      console.error('Error parsing category response:', error);
    }
    return null;
  }

  private parsePriorityResponse(data: Record<string, unknown>): 'low' | 'medium' | 'high' | 'urgent' | null {
    try {
      // Type guard for Gemini response structure
      const candidates = data?.candidates as Array<{content?: {parts?: Array<{text?: string}>}}> | undefined;
      const text = candidates?.[0]?.content?.parts?.[0]?.text?.trim()?.toLowerCase();
      
      if (text && ['low', 'medium', 'high', 'urgent'].includes(text)) {
        return text as 'low' | 'medium' | 'high' | 'urgent';
      }
    } catch (error) {
      console.error('Error parsing priority response:', error);
    }
    return null;
  }

  private parseKPIAnalysis(data: Record<string, unknown>, kpiData?: EcoBotRequest['kpiData']): AIInsight {
    try {
      const candidates = data?.candidates as Array<{content?: {parts?: Array<{text?: string}>}}> | undefined;
      const text = candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      
      if (text) {
        return {
          type: 'kpi_interpretation',
          content: text,
          confidence: 0.85
        };
      }
    } catch (error) {
      console.error('Error parsing KPI analysis:', error);
    }
    
    // Fallback with basic analysis
    const resolutionRate = kpiData ? ((kpiData.resolvedReports / kpiData.totalReports) * 100).toFixed(1) : '0';
    return {
      type: 'kpi_interpretation',
      content: `Your platform shows ${kpiData?.totalReports || 0} total reports with a ${resolutionRate}% resolution rate.`,
      confidence: 0.7
    };
  }
}

export const aiApi = new AIApiService();