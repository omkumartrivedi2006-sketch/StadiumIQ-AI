import mongoose from "mongoose";
import { connectDB } from "./config/db";
import { seedDatabase } from "./config/seedHelper";

async function main() {
  try {
    await connectDB();
    await seedDatabase();
    console.log("Seeding process completed successfully.");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

main();
