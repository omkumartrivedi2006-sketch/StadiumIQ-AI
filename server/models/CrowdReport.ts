import { Schema, model } from "mongoose";

const crowdReportSchema = new Schema(
  {
    stadiumId: {
      type: Schema.Types.ObjectId,
      ref: "Stadium",
      required: [true, "Stadium ID is required"],
    },
    location: {
      type: String,
      required: [true, "Location (e.g. Gate 1, Section A) is required"],
      trim: true,
    },
    density: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: [true, "Crowd density level is required"],
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reporting is required"],
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

crowdReportSchema.index({ stadiumId: 1 });
crowdReportSchema.index({ location: 1 });

export const CrowdReport = model("CrowdReport", crowdReportSchema);
