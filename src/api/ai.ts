// Get API key from environment variables
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Gemini API configuration
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

// Validate API key on import
if (!GEMINI_API_KEY) {
  console.warn("Warning: VITE_GEMINI_API_KEY is not set. AI features will not work.");
}

export interface AIInsight {
  type:
    | "eco_tip"
    | "contextual_insight"
    | "event_suggestion"
    | "template_suggestion"
    | "kpi_interpretation";
  content: string;
  confidence?: number;
}

export interface EcoBotRequest {
  context:
    | "report_review"
    | "report_creation"
    | "event_planning"
    | "kpi_analysis"
    | "general";
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
  // private validateApiKey() {
  //   if (!GEMINI_API_KEY || GEMINI_API_KEY.length < 10) {
  //     throw new Error("Invalid API key. Please check your VITE_GEMINI_API_KEY environment variable.");
  //   }
  // }

  async testGemini(prompt: string): Promise<string> {
    try {
      if (!GEMINI_API_KEY) {
        throw new Error("Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file.");
      }

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
            maxOutputTokens: 512,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      });

      // ---- handle any network or CORS blocks gracefully ----
      if (!response.ok) {
        const errText = await response.text();
        console.error("Gemini error:", response.status, errText);
        return `⚠️ Gemini API error (${response.status}): ${response.statusText}`;
      }

      const data = await response.json();

      // Response shapes vary between models / API versions. Try a few common locations
      // for the generated text so the function remains robust.
      const result = (
        data?.candidates?.[0]?.output ||
        data?.candidates?.[0]?.outputText ||
        data?.candidates?.[0]?.content?.[0]?.text ||
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        data?.text ||
        data?.output ||
        "No response text returned."
      ).toString().trim();
      console.log("Gemini success:", result);
      return result;
    } catch (error) {
      const err = error as Error;
      console.error("Gemini fetch error:", err);
      
      if (err.message.includes('API key')) {
        return "⚠️ API Key Error: Please check your Gemini API key in the environment variables.";
      }
      if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
        return "⚠️ Network Error: Please check your internet connection.";
      }
      if (err.message.includes('quota')) {
        return "⚠️ API Quota Exceeded: Your Gemini API quota has been exceeded. Please check your Google Cloud Console.";
      }
      return `⚠️ API Error: ${err.message}`;
    }
  }

  // ---- example real feature (chat) using testGemini ----
  async chatWithEcoBot(userMessage: string): Promise<string> {
    if (!GEMINI_API_KEY) {
      return "⚠️ AI Assistant is not configured. Please check your API key settings.";
    }

    const prompt = `
You are EcoBot, an AI assistant for a waste management app in Calabar, Nigeria called CleanCal.
Your role is to help users with waste management, recycling, and environmental questions.
Be friendly, concise, and provide practical advice.

User message: ${userMessage}

Please provide a helpful response in 2-3 sentences.`;
    
    try {
      return await this.testGemini(prompt);
    } catch (error) {
      console.error('Error in chatWithEcoBot:', error);
      return "⚠️ Sorry, I'm having trouble connecting to the AI service. Please try again later.";
    }
  }

  // ---- example for report insights ----
  async getReportInsights(reportData: EcoBotRequest["reportData"]): Promise<AIInsight[]> {
    const prompt = `
Analyze this waste report and provide 2 actionable insights.

Title: ${reportData?.title}
Description: ${reportData?.description}
Location: ${reportData?.location.lat}, ${reportData?.location.lng}

Return your advice in 2–3 short paragraphs.`;
    const text = await this.testGemini(prompt);
    return [{ type: "eco_tip", content: text, confidence: 0.9 }];
  }
}

export const aiApi = new AIApiService();