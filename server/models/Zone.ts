import { Schema, model } from "mongoose";

const zoneSchema = new Schema(
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
    polygonCoordinates: {
      type: [{ lat: Number, lng: Number }],
      default: [],
    },
    category: {
      type: String,
      required: true,
      enum: ["operational", "volunteer", "crowd", "VIP"],
    },
    assignedTo: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    crowdLevel: {
      type: String,
      default: "Low",
      enum: ["Low", "Medium", "High"],
    },
  },
  {
    timestamps: true,
  }
);

zoneSchema.index({ stadiumId: 1 });
zoneSchema.index({ category: 1 });

export const Zone = model("Zone", zoneSchema);
