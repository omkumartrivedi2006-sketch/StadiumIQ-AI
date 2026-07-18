import mongoose from "mongoose";
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
import { authService } from "../services/authService";
import { stadiumMapRepository } from "../repositories/stadiumMapRepository";
import { mapLocationRepository } from "../repositories/mapLocationRepository";
import { parkingSlotRepository } from "../repositories/parkingSlotRepository";
import { servicePointRepository } from "../repositories/servicePointRepository";
import { routeRepository } from "../repositories/routeRepository";
import { zoneRepository } from "../repositories/zoneRepository";

export async function seedDatabase() {
  try {
    console.log("Checking if database needs seeding...");
    const userCount = await userRepository.count();
    if (userCount > 0) {
      const mapCount = await stadiumMapRepository.count();
      if (mapCount === 0) {
        console.log("Database has users but lacks map coordinates. Seeding map coordinates only...");
        
        // Find MetLife stadium
        const stadiumResult = await stadiumRepository.find({ name: "MetLife Stadium" }, { limit: 1 });
        const metlifeStadium = stadiumResult.docs[0];

        const organizerResult = await userRepository.find({ email: "organizer@demo.stadiumiq.ai" }, { limit: 1 });
        const demoOrganizer = organizerResult.docs[0];

        const volunteerResult = await userRepository.find({ email: "volunteer@demo.stadiumiq.ai" }, { limit: 1 });
        const demoVolunteer = volunteerResult.docs[0];

        if (metlifeStadium) {
          await seedMapDataOnly(
            metlifeStadium._id,
            demoOrganizer?._id || new mongoose.Types.ObjectId(),
            demoVolunteer?._id || new mongoose.Types.ObjectId()
          );
          console.log("Map coordinates seeded successfully to existing DB.");
        }
      } else {
        console.log("Database already contains data. Skipping auto-seeding.");
      }
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
      crowdReportRepository.clear(),
      sosReportRepository.clear(),
      chatHistoryRepository.clear(),
      stadiumMapRepository.clear(),
      mapLocationRepository.clear(),
      parkingSlotRepository.clear(),
      servicePointRepository.clear(),
      routeRepository.clear(),
      zoneRepository.clear(),
    ]);

    console.log("Seeding users (including demo accounts)...");
    const hashedStandardPassword = await authService.hashPassword("Password123!");
    const hashedDemoPassword = await authService.hashPassword("demo1234");

    // Standard Users
    const adminUser = await userRepository.create({
      fullName: "Admin User",
      email: "admin@stadiumiq.com",
      phone: "+15550100",
      password: hashedStandardPassword,
      role: "admin",
      country: "USA",
      isVerified: true,
    });

    const fanUser = await userRepository.create({
      fullName: "John Doe",
      email: "john.doe@fifa.com",
      phone: "+15550200",
      password: hashedStandardPassword,
      role: "fan",
      country: "Canada",
      isVerified: true,
      favoriteTeam: "Canada",
      stadiumPreferences: ["A23 - Section B"],
    });

    const volunteerUser = await userRepository.create({
      fullName: "Volunteer User",
      email: "volunteer@stadiumiq.com",
      phone: "+15550300",
      password: hashedStandardPassword,
      role: "volunteer",
      country: "Mexico",
      isVerified: true,
    });

    const organizerUser = await userRepository.create({
      fullName: "Organizer User",
      email: "organizer@stadiumiq.com",
      phone: "+15550400",
      password: hashedStandardPassword,
      role: "organizer",
      country: "USA",
      isVerified: true,
    });

    // Demo Accounts (Optional quick demo login)
    const demoFan = await userRepository.create({
      fullName: "Demo Fan (Alex)",
      email: "fan@demo.stadiumiq.ai",
      phone: "+15551111",
      password: hashedDemoPassword,
      role: "fan",
      country: "USA",
      isVerified: true,
      favoriteTeam: "USA",
      stadiumPreferences: ["Section B - Row 12"],
    });

    const demoVolunteer = await userRepository.create({
      fullName: "Demo Volunteer (Sam)",
      email: "volunteer@demo.stadiumiq.ai",
      phone: "+15552222",
      password: hashedDemoPassword,
      role: "volunteer",
      country: "Mexico",
      isVerified: true,
    });

    const demoOrganizer = await userRepository.create({
      fullName: "Demo Organizer (Chris)",
      email: "organizer@demo.stadiumiq.ai",
      phone: "+15553333",
      password: hashedDemoPassword,
      role: "organizer",
      country: "Canada",
      isVerified: true,
    });

    const demoAdmin = await userRepository.create({
      fullName: "Demo Admin (Taylor)",
      email: "admin@demo.stadiumiq.ai",
      phone: "+15554444",
      password: hashedDemoPassword,
      role: "admin",
      country: "USA",
      isVerified: true,
    });

    // Seed Stadiums
    console.log("Seeding stadiums...");
    const metlifeStadium = await stadiumRepository.create({
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

    const sofiStadium = await stadiumRepository.create({
      name: "SoFi Stadium",
      city: "Los Angeles",
      country: "USA",
      capacity: 70000,
      sections: ["100 Level", "200 Level", "300 Level", "VIP Suites"],
      gates: ["Gate A", "Gate B", "Gate C", "Gate D"],
      parking: ["Lot Blue", "Lot Red", "Lot Green"],
      emergencyPoints: ["Gate B Exit", "Level 2 Corridor East"],
      medicalRooms: ["Level 1 First Aid Station"],
      accessibilityRoutes: ["VIP Elevator West", "Ramp Gate A"],
      foodZones: ["Concourse Eat Court", "VIP Lounge Bar"],
      transportStations: ["SoFi Shuttle Stop", "Metro Link Station"],
    });

    // Seed Matches
    console.log("Seeding matches...");
    const match1 = await matchRepository.create({
      stadiumId: metlifeStadium._id,
      homeTeam: "USA",
      awayTeam: "Mexico",
      date: new Date(Date.now() + 86400000 * 2), // 2 days later
      kickoffTime: "8:00 PM",
      status: "scheduled",
      seatAvailability: 15400,
      weather: "Clear, 72°F",
      attendance: 67100,
    });

    const match2 = await matchRepository.create({
      stadiumId: metlifeStadium._id,
      homeTeam: "Canada",
      awayTeam: "Argentina",
      date: new Date(Date.now() + 86400000 * 5), // 5 days later
      kickoffTime: "6:00 PM",
      status: "scheduled",
      seatAvailability: 8900,
      weather: "Partly Cloudy, 68°F",
      attendance: 78000,
    });

    const match3 = await matchRepository.create({
      stadiumId: sofiStadium._id,
      homeTeam: "Brazil",
      awayTeam: "France",
      date: new Date(Date.now() + 86400000 * 3), // 3 days later
      kickoffTime: "7:30 PM",
      status: "scheduled",
      seatAvailability: 4500,
      weather: "Indoor (Climate Controlled), 70°F",
      attendance: 69500,
    });

    // Seed Food Vendors
    console.log("Seeding food vendors...");
    await foodVendorRepository.create([
      {
        stadiumId: metlifeStadium._id,
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
        stadiumId: metlifeStadium._id,
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
        stadiumId: metlifeStadium._id,
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
        stadiumId: sofiStadium._id,
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
    ]);

    // Seed Transportation Options
    console.log("Seeding transportation...");
    await transportRepository.create([
      {
        stadiumId: metlifeStadium._id,
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
        stadiumId: sofiStadium._id,
        options: [
          { type: "Metro Link", icon: "🚇", waitTime: "6 min", fare: "$2.75", distance: "0.8 km", rating: 4.6 },
          { type: "SoFi Shuttle", icon: "🚌", waitTime: "5 min", fare: "Free", distance: "1.5 km", rating: 4.4 },
          { type: "Ride Share", icon: "🚗", waitTime: "10 min", fare: "$20-30", distance: "Varies", rating: 4.5 },
        ],
        parkingStatus: "Full",
      }
    ]);

    // Seed Lost and Found Items
    console.log("Seeding lost & found...");
    await lostFoundRepository.create([
      { description: "Blue backpack with laptop", location: "Gate 2", color: "Blue", status: "pending" },
      { description: "Red baseball cap", location: "Section A", color: "Red", status: "found" },
      { description: "Black wallet with ID", location: "Gate 5", color: "Black", status: "pending" },
      { description: "iPhone 15 with clear case", location: "VIP Suites", color: "Clear", status: "found" },
    ]);

    // Seed Notifications
    console.log("Seeding notifications...");
    await notificationRepository.create([
      { title: "Stadium Entrance Advisory", message: "Gate 1 experiencing high crowd levels. Recommend Gate 3.", type: "announcement" },
      { title: "Food Stall Advisory", message: "Food stall at Section C temporarily closed for restocking.", type: "announcement" },
      { title: "Medical Assistance Outage", message: "Section B Medical Bay is currently undergoing maintenance. Use Section C room.", type: "announcement" },
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

    // Seed Crowd Reports
    console.log("Seeding crowd reports...");
    await crowdReportRepository.create([
      {
        stadiumId: metlifeStadium._id,
        location: "Gate 1",
        density: "High",
        updatedBy: demoVolunteer._id,
        timestamp: new Date(Date.now() - 1800000), // 30 mins ago
      },
      {
        stadiumId: metlifeStadium._id,
        location: "Gate 3",
        density: "Low",
        updatedBy: demoVolunteer._id,
        timestamp: new Date(Date.now() - 1200000), // 20 mins ago
      },
      {
        stadiumId: metlifeStadium._id,
        location: "Section B",
        density: "Medium",
        updatedBy: demoVolunteer._id,
        timestamp: new Date(Date.now() - 600000), // 10 mins ago
      },
    ]);

    // Seed SOS Reports
    console.log("Seeding SOS reports...");
    await sosReportRepository.create([
      {
        userId: demoFan._id,
        location: "Section B - Row 12",
        emergencyType: "Medical Help",
        status: "active",
        responder: null,
      },
      {
        userId: demoFan._id,
        location: "Gate 3 Entrance",
        emergencyType: "Accessibility",
        status: "resolved",
        responder: demoVolunteer._id,
      },
    ]);

    // Seed AI Chat History
    console.log("Seeding AI chat history...");
    await chatHistoryRepository.create([
      {
        userId: demoFan._id,
        role: "fan",
        prompt: "Where is the nearest accessibility route to Section B?",
        response: "The nearest accessibility route is the Elevator located in Section B, which you can reach directly from the Ramp at Gate 3. Would you like me to draw the directions on the live map?",
        feature: "accessibility",
        language: "en",
        timestamp: new Date(Date.now() - 3600000 * 2), // 2 hours ago
      },
      {
        userId: demoFan._id,
        role: "fan",
        prompt: "How busy is Gate 1 right now?",
        response: "Gate 1 is currently reporting 'High' crowd density with average wait times of 15-20 minutes. I recommend entering via Gate 3, which is currently reporting 'Low' density with less than 3 minutes wait time.",
        feature: "crowd",
        language: "en",
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      },
      {
        userId: demoVolunteer._id,
        role: "volunteer",
        prompt: "Translate 'Please remain calm and follow the exits' to Spanish.",
        response: "In Spanish, this translates to: 'Por favor mantengan la calma y sigan las salidas.'",
        feature: "chat",
        language: "es",
        timestamp: new Date(Date.now() - 3600000 * 3), // 3 hours ago
      },
    ]);

    await seedMapDataOnly(metlifeStadium._id, demoOrganizer._id, demoVolunteer._id);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Database seeding failure:", error);
  }
}

export async function seedMapDataOnly(stadiumId: any, demoOrganizerId: any, demoVolunteerId: any) {
  try {
    // Seed Stadium Map Config
    console.log("Seeding stadium map configuration...");
    await stadiumMapRepository.create({
      stadiumId,
      name: "MetLife Stadium Map Layout",
      center: { lat: 40.8135, lng: -74.0744 },
      zoom: 16,
      boundaryCoordinates: [
        { lat: 40.8160, lng: -74.0780 },
        { lat: 40.8160, lng: -74.0710 },
        { lat: 40.8110, lng: -74.0710 },
        { lat: 40.8110, lng: -74.0780 }
      ]
    });

    // Seed Map Locations (Gates, Restrooms, Medical, Emergency exits, seating)
    console.log("Seeding map locations...");
    await mapLocationRepository.create([
      { name: "Gate 1 (North Entrance)", stadiumId, latitude: 40.8145, longitude: -74.0755, category: "gate", description: "North entrance gate near Lot A", status: "active" },
      { name: "Gate 2 (East Entrance)", stadiumId, latitude: 40.8138, longitude: -74.0725, category: "gate", description: "East entrance gate near Lot B", status: "active" },
      { name: "Gate 3 (South Entrance)", stadiumId, latitude: 40.8123, longitude: -74.0736, category: "gate", description: "South entrance gate - low congestion", status: "active" },
      { name: "Gate 4 (West Entrance)", stadiumId, latitude: 40.8128, longitude: -74.0760, category: "gate", description: "West entrance gate near rideshare", status: "active" },
      { name: "First Aid & Medical Room C", stadiumId, latitude: 40.8132, longitude: -74.0740, category: "medical", description: "First Aid & Medical Room C", status: "active" },
      { name: "Emergency Dispatch Desk - Gate 3", stadiumId, latitude: 40.8124, longitude: -74.0735, category: "medical", description: "First Aid near south entrance", status: "active" },
      { name: "Main Emergency Exit Gate 4", stadiumId, latitude: 40.8128, longitude: -74.0760, category: "emergency", description: "Main emergency evacuation assembly exit", status: "active" },
      { name: "Seating Section B - ADA Lift", stadiumId, latitude: 40.8136, longitude: -74.0746, category: "seating", description: "Section B seat rows with ADA lift access", status: "active" },
      { name: "Restroom - Gate 3 Lobby", stadiumId, latitude: 40.8125, longitude: -74.0737, category: "restroom", description: "Wheelchair accessible restroom", status: "active" }
    ]);

    // Seed Parking slots
    console.log("Seeding parking slots...");
    await parkingSlotRepository.create([
      { parkingName: "Parking Lot A (Premium)", stadiumId, latitude: 40.8105, longitude: -74.0780, capacity: 500, availableSlots: 154, occupiedSlots: 346, parkingType: "VIP", nearestEntrance: "Gate 4", status: "active" },
      { parkingName: "Parking Lot B (General / Shuttle)", stadiumId, latitude: 40.8112, longitude: -74.0705, capacity: 2000, availableSlots: 875, occupiedSlots: 1125, parkingType: "Public", nearestEntrance: "Gate 2", status: "active" },
      { parkingName: "Accessible ADA Parking Row 1", stadiumId, latitude: 40.8120, longitude: -74.0750, capacity: 50, availableSlots: 22, occupiedSlots: 28, parkingType: "Accessible", nearestEntrance: "Gate 3", status: "active" }
    ]);

    // Seed Service points
    console.log("Seeding service points...");
    await servicePointRepository.create([
      { name: "Stadium ATM - Gate 1", stadiumId, latitude: 40.8144, longitude: -74.0752, category: "ATM", description: "Chase ATM near north entrance", status: "active" },
      { name: "Mobile Charging Station - Concourse B", stadiumId, latitude: 40.8134, longitude: -74.0742, category: "Charging Station", description: "Free multi-port charging station", status: "active" },
      { name: "Water Refill Station - Section C", stadiumId, latitude: 40.8133, longitude: -74.0745, category: "Water Station", description: "Chilled water station", status: "active" },
      { name: "Lost & Found Central Hub", stadiumId, latitude: 40.8130, longitude: -74.0734, category: "Lost & Found", description: "Stadium operations desk", status: "active" }
    ]);

    // Seed Routes
    console.log("Seeding routes...");
    await routeRepository.create([
      {
        name: "Parking A to Gate 3",
        stadiumId,
        startLatitude: 40.8105,
        startLongitude: -74.0780,
        endLatitude: 40.8123,
        endLongitude: -74.0736,
        waypoints: [
          { lat: 40.8105, lng: -74.0780 },
          { lat: 40.8115, lng: -74.0760 },
          { lat: 40.8123, lng: -74.0736 }
        ],
        distance: 420,
        walkTime: 5,
        category: "pedestrian",
        status: "open"
      },
      {
        name: "Gate 3 to Section B Seat",
        stadiumId,
        startLatitude: 40.8123,
        startLongitude: -74.0736,
        endLatitude: 40.8136,
        endLongitude: -74.0746,
        waypoints: [
          { lat: 40.8123, lng: -74.0736 },
          { lat: 40.8130, lng: -74.0742 },
          { lat: 40.8136, lng: -74.0746 }
        ],
        distance: 180,
        walkTime: 3,
        category: "pedestrian",
        status: "open"
      },
      {
        name: "Accessible Pathway Gate 3",
        stadiumId,
        startLatitude: 40.8123,
        startLongitude: -74.0736,
        endLatitude: 40.8136,
        endLongitude: -74.0746,
        waypoints: [
          { lat: 40.8123, lng: -74.0736 },
          { lat: 40.8125, lng: -74.0737 },
          { lat: 40.8136, lng: -74.0746 }
        ],
        distance: 180,
        walkTime: 4,
        category: "wheelchair",
        status: "open"
      },
      {
        name: "Emergency Exit Section B",
        stadiumId,
        startLatitude: 40.8136,
        startLongitude: -74.0746,
        endLatitude: 40.8105,
        endLongitude: -74.0780,
        waypoints: [
          { lat: 40.8136, lng: -74.0746 },
          { lat: 40.8130, lng: -74.0742 },
          { lat: 40.8123, lng: -74.0736 },
          { lat: 40.8115, lng: -74.0760 },
          { lat: 40.8105, lng: -74.0780 }
        ],
        distance: 550,
        walkTime: 6,
        category: "evacuation",
        status: "open"
      }
    ]);

    // Seed Zones
    console.log("Seeding zones...");
    await zoneRepository.create([
      {
        name: "North Operations Zone",
        stadiumId,
        category: "operational",
        polygonCoordinates: [
          { lat: 40.8150, lng: -74.0760 },
          { lat: 40.8155, lng: -74.0740 },
          { lat: 40.8140, lng: -74.0740 },
          { lat: 40.8140, lng: -74.0760 }
        ],
        assignedTo: [demoOrganizerId],
        crowdLevel: "Medium"
      },
      {
        name: "South Volunteer Zone",
        stadiumId,
        category: "volunteer",
        polygonCoordinates: [
          { lat: 40.8130, lng: -74.0750 },
          { lat: 40.8130, lng: -74.0730 },
          { lat: 40.8120, lng: -74.0730 },
          { lat: 40.8120, lng: -74.0750 }
        ],
        assignedTo: [demoVolunteerId],
        crowdLevel: "Low"
      }
    ]);
  } catch (err) {
    console.error("Failed to seed map coordinates:", err);
  }
}
