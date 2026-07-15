import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Mobile phone number is required"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: ["fan", "volunteer", "organizer", "admin"],
      default: "fan",
    },
    profileImage: {
      type: String,
      default: "",
    },
    country: {
      type: String,
      required: [true, "Country is required"],
    },
    language: {
      type: String,
      default: "en",
    },
    favoriteTeam: {
      type: String,
      default: "",
    },
    stadiumPreferences: {
      type: [String],
      default: [],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Auto handles createdAt and updatedAt
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

export const User = model("User", userSchema);
