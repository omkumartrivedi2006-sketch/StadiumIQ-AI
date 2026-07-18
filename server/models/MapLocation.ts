import { Schema, model } from "mongoose";

const mapLocationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    stadiumId: {
      type: Schema.Types.ObjectId,
      ref: "Stadium",
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "gate",
        "exit",
        "seating",
        "food",
        "medical",
        "emergency",
        "restroom",
        "parking",
        "transportation",
        "shopping",
        "services",
        "volunteer",
      ],
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    openingHours: {
      type: String,
      default: "24/7",
      trim: true,
    },
    status: {
      type: String,
      default: "active",
      enum: ["active", "inactive"],
    },
  },
  {
    timestamps: true,
  }
);

mapLocationSchema.index({ stadiumId: 1 });
mapLocationSchema.index({ category: 1 });
mapLocationSchema.index({ name: 1 });

export const MapLocation = model("MapLocation", mapLocationSchema);
