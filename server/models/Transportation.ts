import { Schema, model } from "mongoose";

const transitOptionSchema = new Schema({
  type: { type: String, required: true }, // Metro, Taxi, Bus, Ride Share, Walking, Shuttle
  icon: { type: String, default: "" },
  waitTime: { type: String, default: "Immediate" },
  fare: { type: String, default: "Free" },
  distance: { type: String, default: "Varies" },
  rating: { type: Number, default: 5.0 },
  status: { type: String, enum: ["active", "suspended", "delayed"], default: "active" },
});

const transportationSchema = new Schema(
  {
    stadiumId: {
      type: Schema.Types.ObjectId,
      ref: "Stadium",
      required: [true, "Stadium ID is required"],
      unique: true, // One transportation config per stadium
    },
    options: {
      type: [transitOptionSchema],
      default: [],
    },
    parkingStatus: {
      type: String,
      default: "Available", // e.g. Available, Full, Limited
    },
  },
  {
    timestamps: true,
  }
);

transportationSchema.index({ stadiumId: 1 });

export const Transportation = model("Transportation", transportationSchema);
