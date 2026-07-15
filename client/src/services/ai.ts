import { apiClient } from "../api/client";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export const aiService = {
  async getChatHistory(): Promise<ChatMessage[]> {
    try {
      const response = await apiClient.get("/ai/history?feature=chat");
      if (response.data?.success && response.data?.data?.docs) {
        const msgs: ChatMessage[] = [];
        response.data.data.docs.forEach((chat: any) => {
          msgs.push({
            id: chat._id + "-prompt",
            role: "user",
            content: chat.prompt,
            timestamp: new Date(chat.timestamp || chat.createdAt),
          });
          msgs.push({
            id: chat._id + "-response",
            role: "assistant",
            content: chat.response,
            timestamp: new Date(chat.timestamp || chat.createdAt),
          });
        });
        return msgs;
      }
    } catch (e) {
      console.error("Failed to load chat history from backend:", e);
    }
    return [];
  },

  async sendMessage(message: string, history: ChatMessage[]): Promise<string> {
    try {
      const response = await apiClient.post("/ai/chat", {
        prompt: message,
        language: localStorage.getItem("language") || "en"
      });
      if (response.data?.success && response.data?.data?.response) {
        return response.data.data.response;
      }
    } catch (e) {
      console.error("Failed to send chat message:", e);
    }
    return "Failed to connect to AI Assistant. Please check your internet connection.";
  },

  async clearHistory(): Promise<boolean> {
    try {
      const response = await apiClient.delete("/ai/history?feature=chat");
      return response.data?.success === true;
    } catch (e) {
      console.error("Failed to clear chat history:", e);
      return false;
    }
  },

  async getNavigationAdvice(prompt: string): Promise<string> {
    try {
      const response = await apiClient.post("/ai/navigation", {
        prompt,
        language: localStorage.getItem("language") || "en"
      });
      return response.data?.data?.response || "Navigation suggestion currently unavailable.";
    } catch (e) {
      return "Failed to fetch navigation assistance.";
    }
  },

  async getCrowdInsights(prompt: string): Promise<string> {
    try {
      const response = await apiClient.post("/ai/crowd", {
        prompt,
        language: localStorage.getItem("language") || "en"
      });
      return response.data?.data?.response || "Crowd analytics currently unavailable.";
    } catch (e) {
      return "Failed to fetch crowd insights.";
    }
  },

  async getTransportAdvice(prompt: string): Promise<string> {
    try {
      const response = await apiClient.post("/ai/transport", {
        prompt,
        language: localStorage.getItem("language") || "en"
      });
      return response.data?.data?.response || "Transport suggestions currently unavailable.";
    } catch (e) {
      return "Failed to fetch transportation advice.";
    }
  },

  async getFoodRecommendations(prompt: string): Promise<string> {
    try {
      const response = await apiClient.post("/ai/food", {
        prompt,
        language: localStorage.getItem("language") || "en"
      });
      return response.data?.data?.response || "Food recommendations currently unavailable.";
    } catch (e) {
      return "Failed to fetch food recommendations.";
    }
  },

  async getAccessibilityAdvice(prompt: string): Promise<string> {
    try {
      const response = await apiClient.post("/ai/accessibility", {
        prompt,
        language: localStorage.getItem("language") || "en"
      });
      return response.data?.data?.response || "Accessibility suggestions currently unavailable.";
    } catch (e) {
      return "Failed to fetch accessibility advice.";
    }
  },

  async getEmergencyGuidance(prompt: string): Promise<string> {
    try {
      const response = await apiClient.post("/ai/emergency", {
        prompt,
        language: localStorage.getItem("language") || "en"
      });
      return response.data?.data?.response || "Emergency guidance currently unavailable.";
    } catch (e) {
      return "Failed to fetch emergency safety advice.";
    }
  },

  async translateText(text: string, targetLanguage: string): Promise<string> {
    try {
      const response = await apiClient.post("/ai/chat", {
        prompt: `Translate the following text strictly into the language code ${targetLanguage}. Do not add any conversational text or explanation, just return the translated result:\n\n"${text}"`
      });
      if (response.data?.success && response.data?.data?.response) {
        return response.data.data.response;
      }
    } catch (e) {
      console.error("Translation failed:", e);
    }
    return text;
  },
};
