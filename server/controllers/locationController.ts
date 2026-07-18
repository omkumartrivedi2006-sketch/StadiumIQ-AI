import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { liveLocationRepository } from "../repositories/liveLocationRepository";
import { apiResponse } from "../utils/apiResponse";

export const locationController = {
  // POST /api/location/update
  async updateLocation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const role = req.user?.role || "fan";
      const { latitude, longitude, accuracy, heading, speed, socketId } = req.body;

      if (latitude === undefined || longitude === undefined || accuracy === undefined) {
        apiResponse.error(res, "Missing required location fields: latitude, longitude, accuracy", [], 400);
        return;
      }

      const locationData = {
        userId,
        role,
        latitude,
        longitude,
        accuracy,
        heading: heading !== undefined ? heading : null,
        speed: speed !== undefined ? speed : null,
        socketId: socketId || null,
        online: true,
        lastSeen: new Date(),
      };

      const existing = await liveLocationRepository.findOne({ userId });
      let result;

      if (existing) {
        result = await liveLocationRepository.update(existing._id.toString(), locationData);
      } else {
        result = await liveLocationRepository.create(locationData);
      }

      apiResponse.success(res, "Location updated successfully", result);
    } catch (error: any) {
      console.error("Failed to update location:", error);
      apiResponse.error(res, error.message || "Failed to update location", [], 500);
    }
  },

  // GET /api/location/me
  async getMyLocation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const location = await liveLocationRepository.findOne({ userId, online: true });
      if (!location) {
        apiResponse.error(res, "No active location found for current user", [], 404);
        return;
      }
      apiResponse.success(res, "User location retrieved successfully", location);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to retrieve location", [], 500);
    }
  },

  // GET /api/location/volunteers
  async getVolunteers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Find all online volunteers
      const result = await liveLocationRepository.find({ role: "volunteer", online: true }, { limit: 1000 });
      apiResponse.success(res, "Active volunteer locations retrieved successfully", result.docs);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to retrieve volunteer locations", [], 500);
    }
  },

  // GET /api/location/organizers
  async getOrganizers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await liveLocationRepository.find({ role: "organizer", online: true }, { limit: 1000 });
      apiResponse.success(res, "Active organizer locations retrieved successfully", result.docs);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to retrieve organizer locations", [], 500);
    }
  },

  // GET /api/location/users
  async getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await liveLocationRepository.find({ online: true }, { limit: 1000 });
      apiResponse.success(res, "Active user locations retrieved successfully", result.docs);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to retrieve user locations", [], 500);
    }
  },

  // GET /api/location/live
  async getLiveLocations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const role = req.user?.role;
      let query: any = { online: true };

      // Apply role permission filtering on coordinates
      if (role === "organizer") {
        // Organizers can see volunteers and organizers
        query.role = { $in: ["volunteer", "organizer"] };
      } else if (role === "volunteer") {
        // Volunteers can see other volunteers and their own location
        query.role = "volunteer";
      } else if (role === "fan") {
        // Fans can only see their own location (handled by client context, but safeguard endpoint)
        query.userId = req.user?.id;
      }

      const result = await liveLocationRepository.find(query, { limit: 1000 });
      apiResponse.success(res, "Live locations retrieved successfully", result.docs);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to retrieve live locations", [], 500);
    }
  },

  // DELETE /api/location/stop
  async stopLocation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const existing = await liveLocationRepository.findOne({ userId });
      if (existing) {
        const result = await liveLocationRepository.update(existing._id.toString(), {
          online: false,
          socketId: null,
        });
        apiResponse.success(res, "Location tracking stopped successfully", result);
      } else {
        apiResponse.success(res, "No active location found to stop", { success: true });
      }
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to stop location tracking", [], 500);
    }
  },
};
