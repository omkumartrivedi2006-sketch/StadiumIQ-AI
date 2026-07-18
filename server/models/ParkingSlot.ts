import { Schema, model } from "mongoose";

const parkingSlotSchema = new Schema(
  {
    parkingName: {
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
    capacity: {
      type: Number,
      required: true,
    },
    availableSlots: {
      type: Number,
      required: true,
    },
    occupiedSlots: {
      type: Number,
      required: true,
    },
    parkingType: {
      type: String,
      required: true,
      enum: ["VIP", "Public", "Accessible"],
    },
    nearestEntrance: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      default: "active",
      enum: ["active", "full", "maintenance"],
    },
  },
  {
    timestamps: true,
  }
);

parkingSlotSchema.index({ stadiumId: 1 });
parkingSlotSchema.index({ parkingType: 1 });

export const ParkingSlot = model("ParkingSlot", parkingSlotSchema);
