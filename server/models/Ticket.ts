import { Schema, model } from "mongoose";

const ticketSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    matchId: {
      type: Schema.Types.ObjectId,
      ref: "Match",
      required: [true, "Match ID is required"],
    },
    seatNumber: {
      type: String,
      required: [true, "Seat number is required"],
      trim: true,
    },
    gate: {
      type: String,
      required: [true, "Gate is required"],
      trim: true,
    },
    QRCode: {
      type: String,
      required: [true, "QR Code is required"],
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "scanned", "cancelled"],
      default: "active",
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

ticketSchema.index({ userId: 1 });
ticketSchema.index({ matchId: 1 });

export const Ticket = model("Ticket", ticketSchema);
