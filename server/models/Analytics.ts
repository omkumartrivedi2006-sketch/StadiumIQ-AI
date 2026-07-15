import { Schema, model } from "mongoose";

const analyticsSchema = new Schema(
  {
    visitors: {
      type: Number,
      default: 0,
    },
    AIRequests: {
      type: Number,
      default: 0,
    },
    crowdReports: {
      type: Number,
      default: 0,
    },
    incidents: {
      type: Number,
      default: 0,
    },
    popularRoutes: {
      type: [String],
      default: [],
    },
    foodOrders: {
      type: Number,
      default: 0,
    },
    date: {
      type: Date,
      default: Date.now,
      unique: true, // One analytics record per day/period
    },
  },
  {
    timestamps: true,
  }
);

analyticsSchema.index({ date: -1 });

export const Analytics = model("Analytics", analyticsSchema);
