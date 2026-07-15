import { userRepository } from "../repositories/userRepository";
import { stadiumRepository } from "../repositories/stadiumRepository";
import { matchRepository } from "../repositories/matchRepository";
import { foodVendorRepository } from "../repositories/foodVendorRepository";
import { transportRepository } from "../repositories/transportRepository";
import { lostFoundRepository } from "../repositories/lostFoundRepository";
import { notificationRepository } from "../repositories/notificationRepository";
import { analyticsRepository } from "../repositories/analyticsRepository";
import { authService } from "../services/authService";

export async function seedDatabase() {
  try {
    console.log("Checking if database needs seeding...");
    const userCount = await userRepository.count();
    if (userCount > 0) {
      console.log("Database already contains data. Skipping auto-seeding.");
      return;
    }

    console.log("Cleaning up database collections before seeding...");
    await Promise.all([
      userRepository.clear(),
      stadiumRepository.clear(),
      matchRepository.clear(),
      foodVendorRepository.clear(),
      transportRepository.clear(),
      lostFoundRepository.clear(),
      notificationRepository.clear(),
      analyticsRepository.clear(),
    ]);

    console.log("Seeding users...");
    const hashedPassword = await authService.hashPassword("Password123!");
    
    await userRepository.create({
      fullName: "Admin User",
      email: "admin@stadiumiq.com",
      phone: "+15550100",
      password: hashedPassword,
      role: "admin",
      country: "USA",
      isVerified: true,
    });

    const fanUser = await userRepository.create({
      fullName: "John Doe",
      email: "john.doe@fifa.com",
      phone: "+15550200",
      password: hashedPassword,
      role: "fan",
      country: "Canada",
      isVerified: true,
      favoriteTeam: "Canada",
      stadiumPreferences: ["A23 - Section B"],
    });

    await userRepository.create({
      fullName: "Volunteer User",
      email: "volunteer@stadiumiq.com",
      phone: "+15550300",
      password: hashedPassword,
      role: "volunteer",
      country: "Mexico",
      isVerified: true,
    });

    await userRepository.create({
      fullName: "Organizer User",
      email: "organizer@stadiumiq.com",
      phone: "+15550400",
      password: hashedPassword,
      role: "organizer",
      country: "USA",
      isVerified: true,
    });

    // Seed Stadiums
    console.log("Seeding stadiums...");
    const stadium = await stadiumRepository.create({
      name: "MetLife Stadium",
      city: "East Rutherford",
      country: "USA",
      capacity: 82500,
      sections: ["Section A", "Section B", "Section C", "Section D"],
      gates: ["Gate 1", "Gate 2", "Gate 3", "Gate 4", "Gate 5", "Gate 6"],
      parking: ["Lot A", "Lot B", "Lot C"],
      emergencyPoints: ["Gate 3 Emergency Exit", "Section C Corridor"],
      medicalRooms: ["Section C First Aid", "Gate 1 Medical Center"],
      accessibilityRoutes: ["Elevator Section B", "Ramp Gate 3"],
      foodZones: ["Concourse A Food Court", "Section D Snack Bar"],
      transportStations: ["MetLife Train Station", "Bus Terminal 1"],
    });

    // Seed Matches
    console.log("Seeding matches...");
    await matchRepository.create({
      stadiumId: stadium._id,
      homeTeam: "USA",
      awayTeam: "Mexico",
      date: new Date(Date.now() + 86400000 * 2), // 2 days later
      kickoffTime: "8:00 PM",
      status: "scheduled",
      seatAvailability: 15400,
      weather: "Clear, 72°F",
      attendance: 67100,
    });

    // Seed Food Vendors
    console.log("Seeding food vendors...");
    await foodVendorRepository.create([
      {
        stadiumId: stadium._id,
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
        stadiumId: stadium._id,
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
        stadiumId: stadium._id,
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
        stadiumId: stadium._id,
        vendorName: "Hot Dog Cart",
        category: "American",
        averageWaitingTime: 2,
        rating: 4.3,
        location: "Section C",
        menu: [
          { itemName: "Classic Hot Dog", price: 4.50, availability: true },
          { itemName: "Chili Cheese Dog", price: 5.50, availability: true },
        ],
      },
    ]);

    // Seed Transportation Options
    console.log("Seeding transportation...");
    await transportRepository.create({
      stadiumId: stadium._id,
      options: [
        { type: "Metro", icon: "🚇", waitTime: "3 min", fare: "$2.50", distance: "1.2 km", rating: 4.7 },
        { type: "Taxi", icon: "🚕", waitTime: "8 min", fare: "$12-18", distance: "Varies", rating: 4.5 },
        { type: "Bus", icon: "🚌", waitTime: "12 min", fare: "$1.50", distance: "2.5 km", rating: 4.3 },
        { type: "Ride Share", icon: "🚗", waitTime: "5 min", fare: "$15-25", distance: "Varies", rating: 4.8 },
        { type: "Walking", icon: "🚶", waitTime: "Immediate", fare: "Free", distance: "3 km", rating: 4.0 },
      ],
      parkingStatus: "Limited",
    });

    // Seed Lost and Found Items
    console.log("Seeding lost & found...");
    await lostFoundRepository.create([
      { description: "Blue backpack with laptop", location: "Gate 2", color: "Blue", status: "pending" },
      { description: "Red baseball cap", location: "Section A", color: "Red", status: "found" },
      { description: "Black wallet with ID", location: "Gate 5", color: "Black", status: "pending" },
    ]);

    // Seed Notifications
    console.log("Seeding notifications...");
    await notificationRepository.create([
      { title: "Stadium Entrance Advisory", message: "Gate 1 experiencing high crowd levels. Recommend Gate 3.", type: "announcement" },
      { title: "Food Stall Advisory", message: "Food stall at Section C temporarily closed for restocking.", type: "announcement" },
      { title: "Medical Assistance", message: "Medical team dispatched to Section A.", type: "announcement" },
      { title: "Lost & Found Bulletin", message: "Lost item reported: Blue backpack at Gate 2.", type: "announcement" },
    ]);

    // Seed Analytics
    console.log("Seeding analytics...");
    await analyticsRepository.create({
      visitors: 45230,
      AIRequests: 12450,
      crowdReports: 86,
      incidents: 23,
      popularRoutes: ["Gate 3 to Section B", "Metro Station to Gate 1"],
      foodOrders: 324,
      date: new Date(),
    });

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Database seeding failure:", error);
  }
}
