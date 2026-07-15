import { BaseRepository } from "./baseRepository";
import { AIChatHistory } from "../models/AIChatHistory";

export class ChatHistoryRepository extends BaseRepository<any> {
  constructor() {
    super(AIChatHistory);
  }
}

export const chatHistoryRepository = new ChatHistoryRepository();
