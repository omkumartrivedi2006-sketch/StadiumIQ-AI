import mongoose, { Schema, Document } from "mongoose";

export interface IIncident extends Document {
  title: string;
  description: string;
  location: string;
  severity: "low" | "medium" | "high";
  status: "open" | "resolved";
  reporter?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const IncidentSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    severity: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    status: { type: String, enum: ["open", "resolved"], default: "open" },
    reporter: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Incident = mongoose.models.Incident || mongoose.model<IIncident>("Incident", IncidentSchema);
