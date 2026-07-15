import { Schema, model } from "mongoose";

const menuItemSchema = new Schema({
  itemName: { type: String, required: true },
  price: { type: Number, required: true },
  availability: { type: Boolean, default: true },
});

const foodVendorSchema = new Schema(
  {
    stadiumId: {
      type: Schema.Types.ObjectId,
      ref: "Stadium",
      required: [true, "Stadium ID is required"],
    },
    vendorName: {
      type: String,
      required: [true, "Vendor name is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Food category (e.g. Burgers, Italian) is required"],
      trim: true,
    },
    menu: {
      type: [menuItemSchema],
      default: [],
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    averageWaitingTime: {
      type: Number,
      default: 5, // in minutes
    },
    location: {
      type: String,
      required: [true, "Vendor location (e.g. Section A, Gate 3) is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

foodVendorSchema.index({ stadiumId: 1 });
foodVendorSchema.index({ vendorName: 1 });

export const FoodVendor = model("FoodVendor", foodVendorSchema);
