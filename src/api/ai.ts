const GEMINI_API_KEY =
  import.meta.env.VITE_GEMINI_API_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhamdwY3FiZm91Z29qcnBhcHJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0Njc1MjksImV4cCI6MjA3NjA0MzUyOX0.JcY366RLPTKNCmv19lKcKVJZE1fpTv3VeheDwXRGchY";

// Use a generally available v1 model endpoint. The older `gemini-1.5-flash-latest:generateContent`
// path is not available on v1beta for all projects which caused the 404 the app saw.
// Switch to a stable text-bison model endpoint and use a flexible parser for responses.
// Direct Google AI API endpoint with proper version and model
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

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
  private validateApiKey() {
    if (!GEMINI_API_KEY || GEMINI_API_KEY.length < 10) {
      throw new Error("Invalid API key. Please check your VITE_GEMINI_API_KEY environment variable.");
    }
  }

  async testGemini(prompt: string): Promise<string> {
    try {
      this.validateApiKey();

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
    const prompt = `
You are EcoBot, an AI assistant for a waste management app in Calabar, Nigeria called CleanCal.
User message: ${userMessage}
Provide a short, helpful, and friendly answer.`;
    return await this.testGemini(prompt);
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
