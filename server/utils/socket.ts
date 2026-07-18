import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { liveLocationRepository } from "../repositories/liveLocationRepository";
import { sosReportRepository } from "../repositories/sosReportRepository";
import { parkingSlotRepository } from "../repositories/parkingSlotRepository";

let io: Server | null = null;

export function initSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    console.log(`[Socket.IO] New client connected: ${socket.id}`);

    // Register user details on connection
    socket.on("register-user", ({ userId, role }) => {
      socket.data.userId = userId;
      socket.data.role = role;
      if (role && ["fan", "volunteer", "organizer", "admin"].includes(role)) {
        socket.join(role);
        console.log(`[Socket.IO] Client ${socket.id} registered user ${userId} with role ${role}`);
      }
    });

    // Join room based on user role (for role-specific broadcasts)
    socket.on("join-role-room", (role: string) => {
      socket.data.role = role;
      if (role && ["fan", "volunteer", "organizer", "admin"].includes(role)) {
        socket.join(role);
        console.log(`[Socket.IO] Client ${socket.id} joined room: ${role}`);
      }
    });

    // Listen for live location streams
    socket.on("update-location", async (data: { latitude: number; longitude: number; accuracy: number; heading?: number; speed?: number }) => {
      const userId = socket.data.userId;
      const role = socket.data.role || "fan";
      if (!userId) return;

      try {
        const locationData = {
          userId,
          role,
          latitude: data.latitude,
          longitude: data.longitude,
          accuracy: data.accuracy,
          heading: data.heading !== undefined ? data.heading : null,
          speed: data.speed !== undefined ? data.speed : null,
          socketId: socket.id,
          online: true,
          lastSeen: new Date(),
        };

        const existing = await liveLocationRepository.findOne({ userId });
        let updatedLoc;
        if (existing) {
          updatedLoc = await liveLocationRepository.update(existing._id.toString(), locationData);
        } else {
          updatedLoc = await liveLocationRepository.create(locationData);
        }

        // Broadcast to admins (admins monitor everything)
        emitEvent("location-updated", updatedLoc, "admin");

        if (role === "organizer") {
          // Organizers see other organizers
          emitEvent("location-updated", updatedLoc, "organizer");
        } else if (role === "volunteer") {
          // Organizers see volunteers
          emitEvent("location-updated", updatedLoc, "organizer");
          // Volunteers see other volunteers
          emitEvent("location-updated", updatedLoc, "volunteer");
        } else if (role === "fan") {
          // Organizers see fans as anonymous crowd movement dots
          const crowdPoint = {
            latitude: data.latitude,
            longitude: data.longitude,
            accuracy: data.accuracy,
            updatedAt: new Date(),
          };
          emitEvent("crowd-movement-updated", crowdPoint, "organizer");

          // If the fan has an active SOS, share their live location with volunteers/organizers
          const activeSOS = await sosReportRepository.find({ userId, status: "active" }, { limit: 1 });
          if (activeSOS.docs && activeSOS.docs.length > 0) {
            const sosUpdate = {
              sosId: activeSOS.docs[0]._id,
              userId,
              latitude: data.latitude,
              longitude: data.longitude,
              accuracy: data.accuracy,
              updatedAt: new Date(),
            };
            emitEvent("sos-location-updated", sosUpdate, "volunteer");
            emitEvent("sos-location-updated", sosUpdate, "organizer");
          }
        }
      } catch (err) {
        console.error("[Socket.IO] Error handling live location update:", err);
      }
    });

    socket.on("disconnect", async () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
      const userId = socket.data.userId;
      if (userId) {
        try {
          const existing = await liveLocationRepository.findOne({ userId });
          if (existing) {
            await liveLocationRepository.update(existing._id.toString(), {
              online: false,
              socketId: null,
            });
            emitEvent("location-offline", { userId, role: socket.data.role }, "admin");
            if (socket.data.role === "volunteer") {
              emitEvent("location-offline", { userId, role: "volunteer" }, "organizer");
            }
          }
        } catch (e) {
          console.error("[Socket.IO] Error handling socket disconnect presence:", e);
        }
      }
    });
  });

  // Start background operational telemetry simulator (pings every 15 seconds)
  setInterval(async () => {
    if (!io) return;
    try {
      // 1. Simulate Parking availability fluctuations
      const parkingSlots = await parkingSlotRepository.find({}, { limit: 100 });
      for (const slot of parkingSlots.docs) {
        const delta = Math.floor(Math.random() * 7) - 3; // -3 to +3 slots
        const newAvailable = Math.max(0, Math.min(slot.capacity, slot.availableSlots + delta));
        const newOccupied = slot.capacity - newAvailable;
        const newStatus = newAvailable === 0 ? "full" : "active";

        const updated = await parkingSlotRepository.update(slot._id.toString(), {
          availableSlots: newAvailable,
          occupiedSlots: newOccupied,
          status: newStatus,
        });

        if (updated) {
          emitEvent("parking-updated", updated);
        }
      }

      // 2. Simulate Crowd levels fluctuations at gates
      const gates = ["Gate 1", "Gate 2", "Gate 3", "Gate 4"];
      const randomGate = gates[Math.floor(Math.random() * gates.length)];
      const densities = ["Low", "Medium", "High"];
      const randomDensity = densities[Math.floor(Math.random() * densities.length)];
      emitEvent("crowd-status-updated", { gate: randomGate, crowdLevel: randomDensity });

    } catch (e) {
      console.error("[Socket Simulator] Error in background simulator:", e);
    }
  }, 15000);

  return io;
}

export function getIO() {
  return io;
}

export function emitEvent(event: string, data: any, room?: string) {
  if (!io) {
    console.warn("[Socket.IO] io is not initialized yet. Event skipped:", event);
    return;
  }
  if (room) {
    io.to(room).emit(event, data);
  } else {
    io.emit(event, data);
  }
}
