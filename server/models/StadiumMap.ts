import { Schema, model } from "mongoose";

const stadiumMapSchema = new Schema(
  {
    stadiumId: {
      type: Schema.Types.ObjectId,
      ref: "Stadium",
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    boundaryCoordinates: {
      type: [{ lat: Number, lng: Number }],
      default: [],
    },
    center: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    zoom: {
      type: Number,
      default: 16,
    },
  },
  {
    timestamps: true,
  }
);

stadiumMapSchema.index({ stadiumId: 1 });

export const StadiumMap = model("StadiumMap", stadiumMapSchema);
