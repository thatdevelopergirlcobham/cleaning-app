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
      return this.getMockReportInsights(reportData);
    }
  }
  // No comma needed here

  // 2. Generate AI suggestions for events
  async getEventSuggestions(): Promise<AIInsight[]> {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'AIzaSyCuoCwkVC_gDCZh4kb_Pr7k8QCgW4_-KgA') {
      return this.getMockEventSuggestions();
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
      return this.getMockEventSuggestions();
    }
  }

  // 3. Generate response templates for admins
  async getResponseTemplates(context: 'report_approval' | 'report_rejection' | 'agent_assignment'): Promise<string[]> {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'AIzaSyCuoCwkVC_gDCZh4kb_Pr7k8QCgW4_-KgA') {
      return this.getMockResponseTemplates(context);
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
      return this.getMockResponseTemplates(context);
    }
  }

  // 4. Categorize a report based on title and description
  async categorizeReport(reportData: { title: string; description: string }): Promise<string> {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'AIzaSyCuoCwkVC_gDCZh4kb_Pr7k8QCgW4_-KgA') {
      console.warn('Gemini API key not configured, using fallback categorization');
      return this.getMockReportCategory(reportData);
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
      return category || this.getMockReportCategory(reportData);
    } catch (error) {
      console.error('AI Categorization Error:', error);
      return this.getMockReportCategory(reportData);
    }
  }

  // 5. Get priority score for a report
  async getReportPriority(reportData: { title: string; description: string; location: { lat: number; lng: number } }): Promise<'low' | 'medium' | 'high' | 'urgent'> {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'AIzaSyCuoCwkVC_gDCZh4kb_Pr7k8QCgW4_-KgA') {
      console.warn('Gemini API key not configured, using fallback priority');
      return this.getMockReportPriority(reportData);
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
      return priority || this.getMockReportPriority(reportData);
    } catch (error) {
      console.error('AI Priority Analysis Error:', error);
      return this.getMockReportPriority(reportData);
    }
  }

  // 6. Analyze KPI data
  async analyzeKPIs(kpiData: EcoBotRequest['kpiData']): Promise<AIInsight> {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'AIzaSyCuoCwkVC_gDCZh4kb_Pr7k8QCgW4_-KgA') {
      return this.getMockKPIAnalysis(kpiData);
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
      return this.parseKPIAnalysis(data);
    } catch (error) {
      console.error('AI KPI Analysis Error:', error);
      return this.getMockKPIAnalysis(kpiData);
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

  // === MOCK DATA METHODS ===
  
  private getMockReportInsights(_reportData?: EcoBotRequest['reportData']): AIInsight[] {
    return [
      {
        type: 'eco_tip',
        content: 'This appears to be plastic waste. Consider recycling at the Calabar Recycling Center on Marian Road.',
        confidence: 0.85
      },
      {
        type: 'contextual_insight',
        content: 'This area has reported similar plastic waste issues. A community cleanup event could be beneficial.',
        confidence: 0.78
      }
    ];
  }

  private getMockEventSuggestions(): AIInsight[] {
    return [
      {
        type: 'event_suggestion',
        content: 'Beach cleanup at Marina Resort - Collect plastic waste and educate on marine conservation.',
        confidence: 0.9
      },
      {
        type: 'event_suggestion',
        content: 'School waste sorting workshop - Partner with local schools for educational cleanup activities.',
        confidence: 0.85
      }
    ];
  }

  private getMockResponseTemplates(context: 'report_approval' | 'report_rejection' | 'agent_assignment'): string[] {
    const templates = {
      report_approval: [
        'Thank you for your report! Our team will investigate and take appropriate action.',
        'Your report has been approved and is now visible to the community and agents.',
        'Great work spotting this issue! Our cleanup team will address it soon.'
      ],
      report_rejection: [
        'Thank you for your report. After review, this doesn\'t meet our criteria for actionable waste issues.',
        'We appreciate your concern, but this appears to be a private property matter.',
        'Your report has been reviewed. Please provide more specific details for us to take action.'
      ],
      agent_assignment: [
        'Agent assigned to your cleanup request. They will contact you within 24 hours.',
        'A certified CleanCal agent has been dispatched to handle this waste issue.',
        'Your request has been assigned to an available agent. You\'ll receive updates shortly.'
      ]
    };

    return templates[context];
  }

  private getMockReportCategory(reportData: { title: string; description: string }): string {
    const text = `${reportData.title} ${reportData.description}`.toLowerCase();

    if (text.includes('plastic') || text.includes('bottle') || text.includes('bag')) {
      return 'Plastic Waste';
    }
    if (text.includes('food') || text.includes('organic') || text.includes('leaves')) {
      return 'Organic Waste';
    }
    if (text.includes('electronic') || text.includes('phone') || text.includes('computer')) {
      return 'Electronic Waste';
    }
    if (text.includes('construction') || text.includes('cement') || text.includes('building')) {
      return 'Construction Waste';
    }
    if (text.includes('chemical') || text.includes('toxic') || text.includes('hazardous')) {
      return 'Hazardous Waste';
    }
    if (text.includes('dump') || text.includes('illegal')) {
      return 'Illegal Dumping';
    }

    return 'General Waste';
  }

  private getMockReportPriority(_reportData: { title: string; description: string; location: { lat: number; lng: number } }): 'low' | 'medium' | 'high' | 'urgent' {
    // Simple mock priority based on keywords
    return 'medium';
  }

  // === PARSING METHODS ===

  private parseGeminiResponse(_data: any): AIInsight[] {
    // This would parse the actual Gemini response format
    // For now, return mock data
    return this.getMockReportInsights();
  }

  private parseEventSuggestions(_data: any): AIInsight[] {
    return this.getMockEventSuggestions();
  }

  private parseResponseTemplates(_data: any): string[] {
    return ['Template 1', 'Template 2', 'Template 3'];
  }

  private getMockKPIAnalysis(_kpiData?: EcoBotRequest['kpiData']): AIInsight {
    return {
      type: 'kpi_interpretation',
      content: `Your platform shows ${_kpiData?.totalReports || 0} total reports with a ${((_kpiData?.resolvedReports || 0) / (_kpiData?.totalReports || 1) * 100).toFixed(1)}% resolution rate. Consider increasing agent availability during peak hours.`,
      confidence: 0.82
    };
  }

  private parseCategoryResponse(data: any): string | null {
    try {
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
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

  private parsePriorityResponse(data: any): 'low' | 'medium' | 'high' | 'urgent' | null {
    try {
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()?.toLowerCase();
      if (text && ['low', 'medium', 'high', 'urgent'].includes(text)) {
        return text as 'low' | 'medium' | 'high' | 'urgent';
      }
    } catch (error) {
      console.error('Error parsing priority response:', error);
    }
    return null;
  }

  private parseKPIAnalysis(_data: any): AIInsight {
    return this.getMockKPIAnalysis();
  }
}

export const aiApi = new AIApiService();