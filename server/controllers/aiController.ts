import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { aiService } from "../services/aiService";
import { chatHistoryRepository } from "../repositories/chatHistoryRepository";
import { apiResponse } from "../utils/apiResponse";

export const aiController = {
  // POST /api/ai/chat
  async chat(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { prompt, language } = req.body;
      if (!prompt) {
        apiResponse.error(res, "Prompt is required in the request body", [], 400);
        return;
      }

      const role = req.user?.role || "fan";
      const lang = language || (req.user as any)?.language || "en";
      const response = await aiService.generateCompletion(req.user!.id, role, "chat", lang, prompt);
      
      apiResponse.success(res, "AI response generated successfully", { response });
    } catch (error: any) {
      console.error("AI Chat Controller Error:", error);
      apiResponse.error(res, error.message || "Failed to generate AI response", [], 500);
    }
  },

  // POST /api/ai/navigation
  async navigation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { prompt, language } = req.body;
      if (!prompt) {
        apiResponse.error(res, "Prompt is required", [], 400);
        return;
      }

      const role = req.user?.role || "fan";
      const lang = language || (req.user as any)?.language || "en";
      const response = await aiService.generateCompletion(req.user!.id, role, "navigation", lang, prompt);
      
      apiResponse.success(res, "Navigation guidance generated", { response });
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to generate navigation guidance", [], 500);
    }
  },

  // POST /api/ai/crowd
  async crowd(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { prompt, language } = req.body;
      if (!prompt) {
        apiResponse.error(res, "Prompt is required", [], 400);
        return;
      }

      const role = req.user?.role || "fan";
      const lang = language || (req.user as any)?.language || "en";
      const response = await aiService.generateCompletion(req.user!.id, role, "crowd", lang, prompt);
      
      apiResponse.success(res, "Crowd insights generated", { response });
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to generate crowd insights", [], 500);
    }
  },

  // POST /api/ai/transport
  async transport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { prompt, language } = req.body;
      if (!prompt) {
        apiResponse.error(res, "Prompt is required", [], 400);
        return;
      }

      const role = req.user?.role || "fan";
      const lang = language || (req.user as any)?.language || "en";
      const response = await aiService.generateCompletion(req.user!.id, role, "transport", lang, prompt);
      
      apiResponse.success(res, "Transport suggestions generated", { response });
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to generate transport guidance", [], 500);
    }
  },

  // POST /api/ai/food
  async food(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { prompt, language } = req.body;
      if (!prompt) {
        apiResponse.error(res, "Prompt is required", [], 400);
        return;
      }

      const role = req.user?.role || "fan";
      const lang = language || (req.user as any)?.language || "en";
      const response = await aiService.generateCompletion(req.user!.id, role, "food", lang, prompt);
      
      apiResponse.success(res, "Food recommendations generated", { response });
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to generate food recommendations", [], 500);
    }
  },

  // POST /api/ai/accessibility
  async accessibility(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { prompt, language } = req.body;
      if (!prompt) {
        apiResponse.error(res, "Prompt is required", [], 400);
        return;
      }

      const role = req.user?.role || "fan";
      const lang = language || (req.user as any)?.language || "en";
      const response = await aiService.generateCompletion(req.user!.id, role, "accessibility", lang, prompt);
      
      apiResponse.success(res, "Accessibility suggestions generated", { response });
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to generate accessibility suggestions", [], 500);
    }
  },

  // POST /api/ai/emergency
  async emergency(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { prompt, language } = req.body;
      if (!prompt) {
        apiResponse.error(res, "Prompt is required", [], 400);
        return;
      }

      const role = req.user?.role || "fan";
      const lang = language || (req.user as any)?.language || "en";
      const response = await aiService.generateCompletion(req.user!.id, role, "emergency", lang, prompt);
      
      apiResponse.success(res, "Emergency safety guidance generated", { response });
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to generate emergency safety guidance", [], 500);
    }
  },

  // GET /api/ai/history
  async getChatHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const feature = req.query.feature as string;
      const query: any = { userId: req.user!.id };
      if (feature) {
        query.feature = feature;
      }
      
      const history = await chatHistoryRepository.find(query, { sort: { timestamp: 1 }, limit: 100 });
      apiResponse.success(res, "AI Chat history retrieved successfully", history);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to retrieve chat history", [], 500);
    }
  },

  // DELETE /api/ai/history
  async clearChatHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const feature = req.query.feature as string;
      const query: any = { userId: req.user!.id };
      if (feature) {
        query.feature = feature;
      }

      const list = await chatHistoryRepository.find(query, { limit: 1000 });
      const promises = list.docs.map((doc) => chatHistoryRepository.delete(doc._id.toString()));
      await Promise.all(promises);
      
      apiResponse.success(res, "AI Chat history cleared successfully", { success: true });
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to clear chat history", [], 500);
    }
  },
};
