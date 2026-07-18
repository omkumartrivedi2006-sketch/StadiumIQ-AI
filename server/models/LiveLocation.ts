import { Schema, model } from "mongoose";

const liveLocationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      unique: true,
    },
    role: {
      type: String,
      enum: ["fan", "volunteer", "organizer", "admin"],
      required: [true, "User role is required"],
    },
    latitude: {
      type: Number,
      required: [true, "Latitude is required"],
    },
    longitude: {
      type: Number,
      required: [true, "Longitude is required"],
    },
    accuracy: {
      type: Number,
      required: [true, "Accuracy is required"],
    },
    heading: {
      type: Number,
      default: null,
    },
    speed: {
      type: Number,
      default: null,
    },
    online: {
      type: Boolean,
      default: true,
    },
    socketId: {
      type: String,
      default: null,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for rapid geo-queries and updates
liveLocationSchema.index({ userId: 1 });
liveLocationSchema.index({ role: 1 });
liveLocationSchema.index({ online: 1 });

export const LiveLocation = model("LiveLocation", liveLocationSchema);
