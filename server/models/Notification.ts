import { Schema, model } from "mongoose";

const notificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null, // Null indicates global announcement
    },
    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["announcement", "alert", "ticket", "sos", "general"],
      default: "general",
    },
    readStatus: {
      type: Boolean,
      default: false,
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

notificationSchema.index({ userId: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ timestamp: -1 });

export const Notification = model("Notification", notificationSchema);
