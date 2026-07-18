import { Schema, model } from "mongoose";

const routeSchema = new Schema(
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
    startLatitude: {
      type: Number,
      required: true,
    },
    startLongitude: {
      type: Number,
      required: true,
    },
    endLatitude: {
      type: Number,
      required: true,
    },
    endLongitude: {
      type: Number,
      required: true,
    },
    waypoints: {
      type: [{ lat: Number, lng: Number }],
      default: [],
    },
    distance: {
      type: Number,
      required: true, // in meters
    },
    walkTime: {
      type: Number,
      required: true, // in minutes
    },
    category: {
      type: String,
      required: true,
      enum: ["pedestrian", "wheelchair", "evacuation"],
    },
    status: {
      type: String,
      default: "open",
      enum: ["open", "closed", "restricted"],
    },
  },
  {
    timestamps: true,
  }
);

routeSchema.index({ stadiumId: 1 });
routeSchema.index({ category: 1 });

export const Route = model("Route", routeSchema);
