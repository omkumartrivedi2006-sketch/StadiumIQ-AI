import { Schema, model } from "mongoose";

const lostFoundSchema = new Schema(
  {
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    color: {
      type: String,
      default: "",
    },
    reportedTime: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "found", "claimed"],
      default: "pending",
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

lostFoundSchema.index({ status: 1 });
lostFoundSchema.index({ reportedTime: -1 });

export const LostFound = model("LostFound", lostFoundSchema);
