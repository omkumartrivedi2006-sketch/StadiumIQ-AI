import { chatHistoryRepository } from "../repositories/chatHistoryRepository";
import { analyticsService } from "./analyticsService";

export const chatService = {
  async getChatHistory(userId: string) {
    return chatHistoryRepository.find({ userId }, { sort: { timestamp: 1 }, limit: 100 });
  },

  async saveChatMessage(userId: string, prompt: string, response: string) {
    const chatMsg = await chatHistoryRepository.create({
      userId,
      prompt,
      response,
      timestamp: new Date(),
    });

    // Increment AIRequests counter in analytics
    try {
      await analyticsService.incrementMetric("AIRequests");
    } catch (e) {
      console.error("Failed to increment AIRequest analytics:", e);
    }

    return chatMsg;
  },

  async clearChatHistory(userId: string) {
    const list = await chatHistoryRepository.find({ userId }, { limit: 1000 });
    const promises = list.docs.map((doc) => chatHistoryRepository.delete(doc._id.toString()));
    await Promise.all(promises);
    return true;
  },
};
