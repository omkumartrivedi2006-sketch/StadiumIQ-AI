import { Schema, model } from "mongoose";

const stadiumSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Stadium name is required"],
      unique: true,
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
    },
    sections: {
      type: [String],
      default: [],
    },
    gates: {
      type: [String],
      default: [],
    },
    parking: {
      type: [String],
      default: [],
    },
    emergencyPoints: {
      type: [String],
      default: [],
    },
    medicalRooms: {
      type: [String],
      default: [],
    },
    accessibilityRoutes: {
      type: [String],
      default: [],
    },
    foodZones: {
      type: [String],
      default: [],
    },
    transportStations: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

stadiumSchema.index({ name: 1 });

export const Stadium = model("Stadium", stadiumSchema);
