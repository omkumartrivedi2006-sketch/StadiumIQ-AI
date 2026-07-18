import { Schema, model } from "mongoose";

const servicePointSchema = new Schema(
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
        "ATM",
        "Charging Station",
        "Water Station",
        "Smoking Zone",
        "Information Center",
        "Lost & Found",
        "Prayer Room",
        "Volunteer Help Desk",
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

servicePointSchema.index({ stadiumId: 1 });
servicePointSchema.index({ category: 1 });

export const ServicePoint = model("ServicePoint", servicePointSchema);
