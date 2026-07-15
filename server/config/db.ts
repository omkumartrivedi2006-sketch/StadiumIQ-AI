import mongoose from "mongoose";
import dotenv from "dotenv";
import { seedDatabase } from "./seedHelper";

dotenv.config();

let mongoServer: any = null;

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/stadium_iq";

export async function connectDB() {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      attempt++;
      await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 2000 });
      console.log("MongoDB connected successfully to:", MONGODB_URI);
      
      // Seed database if it is empty
      await seedDatabase();
      return;
    } catch (error) {
      console.warn(`MongoDB connection attempt ${attempt}/${maxRetries} failed:`, error instanceof Error ? error.message : error);
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  // Fall back directly to Pure In-Memory Mock Repository Mode
  console.log("Falling back to Pure In-Memory Mock Repository Mode.");
  process.env.USE_MOCK_REPO = "true";
  
  // Seed the mock repository array store
  await seedDatabase();
  console.log("Pure In-Memory Mock Repository seeded and operational.");
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
}
