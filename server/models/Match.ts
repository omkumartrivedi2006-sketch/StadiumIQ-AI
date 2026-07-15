import { Schema, model } from "mongoose";

const matchSchema = new Schema(
  {
    stadiumId: {
      type: Schema.Types.ObjectId,
      ref: "Stadium",
      required: [true, "Stadium ID is required"],
    },
    homeTeam: {
      type: String,
      required: [true, "Home team is required"],
      trim: true,
    },
    awayTeam: {
      type: String,
      required: [true, "Away team is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Match date is required"],
    },
    kickoffTime: {
      type: String,
      required: [true, "Kickoff time is required"],
    },
    status: {
      type: String,
      enum: ["scheduled", "live", "completed", "cancelled"],
      default: "scheduled",
    },
    seatAvailability: {
      type: Number,
      required: [true, "Seat availability count is required"],
    },
    weather: {
      type: String,
      default: "Clear",
    },
    attendance: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

matchSchema.index({ stadiumId: 1 });
matchSchema.index({ date: 1 });

export const Match = model("Match", matchSchema);
