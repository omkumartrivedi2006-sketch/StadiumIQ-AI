import { connectDB } from "../config/db";
import { userRepository } from "../repositories/userRepository";
import { stadiumRepository } from "../repositories/stadiumRepository";
import { matchRepository } from "../repositories/matchRepository";
import { foodVendorRepository } from "../repositories/foodVendorRepository";
import { transportRepository } from "../repositories/transportRepository";
import { lostFoundRepository } from "../repositories/lostFoundRepository";
import { notificationRepository } from "../repositories/notificationRepository";
import { analyticsRepository } from "../repositories/analyticsRepository";
import { crowdReportRepository } from "../repositories/crowdReportRepository";
import { sosReportRepository } from "../repositories/sosReportRepository";
import { chatHistoryRepository } from "../repositories/chatHistoryRepository";
import mongoose from "mongoose";

async function run() {
  try {
    await connectDB();
    console.log("=== COLLECTION COUNTS ===");
    console.log("Users:", await userRepository.count());
    console.log("Stadiums:", await stadiumRepository.count());
    console.log("Matches:", await matchRepository.count());
    console.log("Food Vendors:", await foodVendorRepository.count());
    console.log("Transport:", await transportRepository.count());
    console.log("Lost/Found:", await lostFoundRepository.count());
    console.log("Notifications:", await notificationRepository.count());
    console.log("Analytics:", await analyticsRepository.count());
    console.log("Crowd Reports:", await crowdReportRepository.count());
    console.log("SOS Reports:", await sosReportRepository.count());
    console.log("Chat History:", await chatHistoryRepository.count());
    console.log("=========================");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Failed checking database:", error);
    process.exit(1);
  }
}

run();
