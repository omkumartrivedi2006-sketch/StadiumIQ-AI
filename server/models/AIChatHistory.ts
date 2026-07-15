import { Schema, model } from "mongoose";

const aiChatHistorySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    role: {
      type: String,
      enum: ["fan", "volunteer", "organizer", "admin"],
      default: "fan",
    },
    prompt: {
      type: String,
      required: [true, "User prompt is required"],
      trim: true,
    },
    response: {
      type: String,
      required: [true, "AI response is required"],
      trim: true,
    },
    feature: {
      type: String,
      enum: ["chat", "navigation", "crowd", "transport", "food", "accessibility", "emergency"],
      default: "chat",
    },
    language: {
      type: String,
      default: "en",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

aiChatHistorySchema.index({ userId: 1 });
aiChatHistorySchema.index({ timestamp: -1 });

export const AIChatHistory = model("AIChatHistory", aiChatHistorySchema);
