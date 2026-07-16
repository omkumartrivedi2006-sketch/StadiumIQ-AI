import { connectDB } from "../config/db";
import { userRepository } from "../repositories/userRepository";
import { stadiumRepository } from "../repositories/stadiumRepository";
import { foodVendorRepository } from "../repositories/foodVendorRepository";
import { transportRepository } from "../repositories/transportRepository";
import { lostFoundRepository } from "../repositories/lostFoundRepository";
import { crowdReportRepository } from "../repositories/crowdReportRepository";
import mongoose from "mongoose";

async function run() {
  try {
    await connectDB();
    console.log("Checking for missing collections data...");

    // Find MetLife Stadium
    const metlife = await stadiumRepository.findOne({ name: "MetLife Stadium" });
    const sofi = await stadiumRepository.findOne({ name: "SoFi Stadium" });

    if (!metlife || !sofi) {
      console.log("Could not find stadiums to seed against. Ensure database contains MetLife and SoFi Stadium.");
      await mongoose.disconnect();
      return;
    }

    console.log(`Found Stadiums: MetLife (${metlife._id}), SoFi (${sofi._id})`);

    // Find a volunteer or any user to act as updatedBy
    const reporter = await userRepository.findOne({ role: "volunteer" }) || await userRepository.findOne({});
    if (!reporter) {
      console.log("Could not find any user in the database to act as the CrowdReport reporter.");
      await mongoose.disconnect();
      return;
    }
    console.log(`Using user ${reporter.fullName} (${reporter._id}) as reporter for CrowdReports`);

    // 1. Food Vendors
    const foodCount = await foodVendorRepository.count();
    if (foodCount === 0) {
      console.log("Seeding Food Vendors...");
      const foodVendors = [
        {
          stadiumId: metlife._id,
          vendorName: "Burger King",
          category: "Burgers",
          averageWaitingTime: 5,
          rating: 4.7,
          location: "Section A",
          menu: [
            { itemName: "Whopper Meal", price: 12.99, availability: true },
            { itemName: "Chicken Fries", price: 5.99, availability: true },
          ],
        },
        {
          stadiumId: metlife._id,
          vendorName: "Pizza Place",
          category: "Italian",
          averageWaitingTime: 10,
          rating: 4.5,
          location: "Section B",
          menu: [
            { itemName: "Pepperoni Slice", price: 4.99, availability: true },
            { itemName: "Large Cheese Pizza", price: 18.99, availability: true },
          ],
        },
        {
          stadiumId: metlife._id,
          vendorName: "Taco Stand",
          category: "Mexican",
          averageWaitingTime: 3,
          rating: 4.8,
          location: "Gate 3",
          menu: [
            { itemName: "Beef Taco", price: 3.50, availability: true },
            { itemName: "Quesadilla", price: 7.99, availability: true },
          ],
        },
        {
          stadiumId: sofi._id,
          vendorName: "LA Tacos & Brews",
          category: "Mexican",
          averageWaitingTime: 4,
          rating: 4.9,
          location: "200 Level East",
          menu: [
            { itemName: "Street Taco Trio", price: 11.50, availability: true },
            { itemName: "Local Craft IPA", price: 9.00, availability: true },
          ],
        },
      ];

      for (const vendor of foodVendors) {
        await foodVendorRepository.create(vendor);
      }
      console.log("Food Vendors seeded!");
    } else {
      console.log(`Food Vendors count: ${foodCount}, skipping.`);
    }

    // 2. Transport
    const transportCount = await transportRepository.count();
    if (transportCount === 0) {
      console.log("Seeding Transport options...");
      const transportOptions = [
        {
          stadiumId: metlife._id,
          options: [
            { type: "Metro", icon: "🚇", waitTime: "3 min", fare: "$2.50", distance: "1.2 km", rating: 4.7 },
            { type: "Taxi", icon: "🚕", waitTime: "8 min", fare: "$12-18", distance: "Varies", rating: 4.5 },
            { type: "Bus", icon: "🚌", waitTime: "12 min", fare: "$1.50", distance: "2.5 km", rating: 4.3 },
            { type: "Ride Share", icon: "🚗", waitTime: "5 min", fare: "$15-25", distance: "Varies", rating: 4.8 },
            { type: "Walking", icon: "🚶", waitTime: "Immediate", fare: "Free", distance: "3 km", rating: 4.0 },
          ],
          parkingStatus: "Limited",
        },
        {
          stadiumId: sofi._id,
          options: [
            { type: "Metro Link", icon: "🚇", waitTime: "6 min", fare: "$2.75", distance: "0.8 km", rating: 4.6 },
            { type: "SoFi Shuttle", icon: "🚌", waitTime: "5 min", fare: "Free", distance: "1.5 km", rating: 4.4 },
            { type: "Ride Share", icon: "🚗", waitTime: "10 min", fare: "$20-30", distance: "Varies", rating: 4.5 },
          ],
          parkingStatus: "Full",
        }
      ];

      for (const transport of transportOptions) {
        await transportRepository.create(transport);
      }
      console.log("Transport seeded!");
    } else {
      console.log(`Transport count: ${transportCount}, skipping.`);
    }

    // 3. Lost & Found
    const lostCount = await lostFoundRepository.count();
    if (lostCount === 0) {
      console.log("Seeding Lost & Found...");
      const lostFoundItems = [
        { description: "Blue backpack with laptop", location: "Gate 2", color: "Blue", status: "pending" },
        { description: "Red baseball cap", location: "Section A", color: "Red", status: "found" },
        { description: "Black wallet with ID", location: "Gate 5", color: "Black", status: "pending" },
        { description: "iPhone 15 with clear case", location: "VIP Suites", color: "Clear", status: "found" },
      ];

      for (const item of lostFoundItems) {
        await lostFoundRepository.create(item);
      }
      console.log("Lost & Found seeded!");
    } else {
      console.log(`Lost & Found count: ${lostCount}, skipping.`);
    }

    // 4. Crowd Reports
    const crowdCount = await crowdReportRepository.count();
    if (crowdCount === 0) {
      console.log("Seeding Crowd Reports...");
      const crowdReports = [
        {
          stadiumId: metlife._id,
          location: "Gate 1",
          density: "High",
          updatedBy: reporter._id,
          timestamp: new Date(Date.now() - 1800000),
        },
        {
          stadiumId: metlife._id,
          location: "Gate 3",
          density: "Low",
          updatedBy: reporter._id,
          timestamp: new Date(Date.now() - 1200000),
        },
        {
          stadiumId: metlife._id,
          location: "Section B",
          density: "Medium",
          updatedBy: reporter._id,
          timestamp: new Date(Date.now() - 600000),
        },
      ];

      for (const report of crowdReports) {
        await crowdReportRepository.create(report);
      }
      console.log("Crowd Reports seeded!");
    } else {
      console.log(`Crowd Reports count: ${crowdCount}, skipping.`);
    }

    console.log("Missing collections checks completed.");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Seeding missing failed:", error);
    process.exit(1);
  }
}

run();
