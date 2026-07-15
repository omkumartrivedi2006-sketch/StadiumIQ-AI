import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { chatService } from "../services/chatService";
import { apiResponse } from "../utils/apiResponse";

export const chatController = {
  async getChatHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        apiResponse.error(res, "Not authenticated", [], 401);
        return;
      }

      const result = await chatService.getChatHistory(req.user.id);
      apiResponse.success(res, "Chat history retrieved successfully", result);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to retrieve chat history");
    }
  },

  async saveChatMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        apiResponse.error(res, "Not authenticated", [], 401);
        return;
      }
      const { prompt, response } = req.body;
      const chatMsg = await chatService.saveChatMessage(req.user.id, prompt, response);
      apiResponse.success(res, "Chat message saved successfully", chatMsg, 201);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to save chat message");
    }
  },

  async clearChatHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        apiResponse.error(res, "Not authenticated", [], 401);
        return;
      }

      await chatService.clearChatHistory(req.user.id);
      apiResponse.success(res, "Chat history cleared successfully");
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to clear chat history");
    }
  },
};
