import { Schema, model } from "mongoose";

const sosReportSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID triggering SOS is required"],
    },
    location: {
      type: String,
      required: [true, "SOS location is required"],
      trim: true,
    },
    emergencyType: {
      type: String,
      enum: ["Medical Help", "Nearest Exit", "Security", "Accessibility", "General Emergency"],
      default: "General Emergency",
    },
    status: {
      type: String,
      enum: ["active", "pending", "resolved"],
      default: "active",
    },
    responder: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

sosReportSchema.index({ userId: 1 });
sosReportSchema.index({ status: 1 });

export const SOSReport = model("SOSReport", sosReportSchema);
