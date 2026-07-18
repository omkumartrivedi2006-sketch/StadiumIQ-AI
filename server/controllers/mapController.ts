import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { stadiumMapRepository } from "../repositories/stadiumMapRepository";
import { mapLocationRepository } from "../repositories/mapLocationRepository";
import { parkingSlotRepository } from "../repositories/parkingSlotRepository";
import { servicePointRepository } from "../repositories/servicePointRepository";
import { routeRepository } from "../repositories/routeRepository";
import { zoneRepository } from "../repositories/zoneRepository";
import { foodVendorRepository } from "../repositories/foodVendorRepository";
import { apiResponse } from "../utils/apiResponse";

// GIS Helper: Haversine distance in meters
function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Convert distance to walking time in minutes (based on 1.4 m/s average speed)
function getWalkingTimeInMins(meters: number): number {
  return Math.max(1, Math.round(meters / (1.4 * 60)));
}

export const mapController = {
  // GET /api/map/stadium
  async getStadiumMap(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await stadiumMapRepository.find({}, { limit: 1 });
      const stadiumMap = result.docs[0] || {
        name: "MetLife Stadium (World Cup 2026)",
        center: { lat: 40.8135, lng: -74.0744 },
        zoom: 16,
        boundaryCoordinates: [
          { lat: 40.816, lng: -74.078 },
          { lat: 40.816, lng: -74.071 },
          { lat: 40.811, lng: -74.071 },
          { lat: 40.811, lng: -74.078 },
        ],
      };
      apiResponse.success(res, "Stadium map config retrieved", stadiumMap);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to retrieve map config");
    }
  },

  // GET /api/map/markers
  async getMapLocations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const category = req.query.category as string;
      const filter: any = { status: "active" };
      if (category) {
        filter.category = category;
      }
      const result = await mapLocationRepository.find(filter, { limit: 1000 });
      apiResponse.success(res, "Locations retrieved", result.docs);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to retrieve locations");
    }
  },

  // GET /api/map/parking
  async getParkingLots(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await parkingSlotRepository.find({}, { limit: 100 });
      apiResponse.success(res, "Parking slots retrieved", result.docs);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to retrieve parking slots");
    }
  },

  // GET /api/map/food
  async getFoodVendors(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await foodVendorRepository.find({ status: { $ne: "closed" } }, { limit: 100 });
      apiResponse.success(res, "Food vendors retrieved", result.docs);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to retrieve food vendors");
    }
  },

  // GET /api/map/services
  async getServicePoints(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const category = req.query.category as string;
      const filter: any = { status: "active" };
      if (category) {
        filter.category = category;
      }
      const result = await servicePointRepository.find(filter, { limit: 100 });
      apiResponse.success(res, "Service points retrieved", result.docs);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to retrieve service points");
    }
  },

  // GET /api/map/routes
  async getRoutes(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const category = req.query.category as string;
      const filter: any = { status: "open" };
      if (category) {
        filter.category = category;
      }
      const result = await routeRepository.find(filter, { limit: 100 });
      apiResponse.success(res, "Routes retrieved", result.docs);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to retrieve routes");
    }
  },

  // POST /api/map/navigation
  async getNavigationRoute(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { startLat, startLng, endLat, endLng, category } = req.body;

      if (startLat === undefined || startLng === undefined || endLat === undefined || endLng === undefined) {
        apiResponse.error(res, "Start and end coordinates are required", [], 400);
        return;
      }

      // Check if a stored pre-defined route exists close to endpoints
      const routesResult = await routeRepository.find({ status: "open" }, { limit: 100 });
      let matchedRoute = null;

      for (const route of routesResult.docs) {
        const startDist = getDistanceInMeters(startLat, startLng, route.startLatitude, route.startLongitude);
        const endDist = getDistanceInMeters(endLat, endLng, route.endLatitude, route.endLongitude);
        // If start and end are within 25 meters of route endpoints
        if (startDist < 25 && endDist < 25) {
          matchedRoute = route;
          break;
        }
      }

      if (matchedRoute) {
        const arrivalTime = new Date(Date.now() + matchedRoute.walkTime * 60 * 1000);
        const steps = [
          `Depart from starting position (0m)`,
          `Walk along designated path for ${Math.round(matchedRoute.distance * 0.4)}m`,
          `Proceed towards destination Gate/Section for ${Math.round(matchedRoute.distance * 0.6)}m`,
          `Arrive at destination (${matchedRoute.name})`,
        ];

        apiResponse.success(res, "Navigation route resolved from database", {
          name: matchedRoute.name,
          distance: matchedRoute.distance,
          walkTime: matchedRoute.walkTime,
          waypoints: matchedRoute.waypoints,
          eta: arrivalTime,
          steps,
          category: matchedRoute.category,
        });
        return;
      }

      // Generate a dynamic straight-line fallback path with intermediate interpolated points
      const distance = Math.round(getDistanceInMeters(startLat, startLng, endLat, endLng));
      const walkTime = getWalkingTimeInMins(distance);
      const eta = new Date(Date.now() + walkTime * 60 * 1000);

      // Interpolate 2 intermediate waypoints to make the path line curve slightly
      const midLat1 = startLat + (endLat - startLat) * 0.33 + 0.0001;
      const midLng1 = startLng + (endLng - startLng) * 0.33 - 0.0001;
      const midLat2 = startLat + (endLat - startLat) * 0.66 - 0.0001;
      const midLng2 = startLng + (endLng - startLng) * 0.66 + 0.0001;

      const waypoints = [
        { lat: startLat, lng: startLng },
        { lat: midLat1, lng: midLng1 },
        { lat: midLat2, lng: midLng2 },
        { lat: endLat, lng: endLng },
      ];

      const steps = [
        `Start walking from current coordinates.`,
        `Follow the walkway towards the main concourse (${Math.round(distance * 0.4)}m).`,
        `Turn slightly and proceed straight for another ${Math.round(distance * 0.5)}m.`,
        `Reach destination point.`,
      ];

      apiResponse.success(res, "Dynamic navigation route calculated", {
        name: "Custom Path",
        distance,
        walkTime,
        waypoints,
        eta,
        steps,
        category: category || "pedestrian",
      });
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to calculate navigation route");
    }
  },

  // GET /api/map/search
  async searchMap(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const q = (req.query.q as string || "").toLowerCase().trim();
      if (!q) {
        apiResponse.success(res, "Empty search results", []);
        return;
      }

      const locations = await mapLocationRepository.find({}, { limit: 1000 });
      const parking = await parkingSlotRepository.find({}, { limit: 100 });
      const food = await foodVendorRepository.find({}, { limit: 100 });
      const services = await servicePointRepository.find({}, { limit: 100 });

      const matches: any[] = [];

      locations.docs.forEach(loc => {
        if (loc.name.toLowerCase().includes(q) || loc.category.toLowerCase().includes(q)) {
          matches.push({ name: loc.name, lat: loc.latitude, lng: loc.longitude, category: loc.category, type: "location" });
        }
      });

      parking.docs.forEach(p => {
        if (p.parkingName.toLowerCase().includes(q) || p.parkingType.toLowerCase().includes(q)) {
          matches.push({ name: p.parkingName, lat: p.latitude, lng: p.longitude, category: "parking", type: "parking", metadata: `${p.availableSlots}/${p.capacity} slots` });
        }
      });

      food.docs.forEach(f => {
        if (f.vendorName.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)) {
          matches.push({ name: f.vendorName, lat: f.latitude || 40.8135, lng: f.longitude || -74.0744, category: "food", type: "food", metadata: f.category });
        }
      });

      services.docs.forEach(s => {
        if (s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)) {
          matches.push({ name: s.name, lat: s.latitude, lng: s.longitude, category: s.category.toLowerCase(), type: "service" });
        }
      });

      apiResponse.success(res, "Fuzzy map search completed", matches.slice(0, 15));
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to search map");
    }
  },

  // GET /api/map/nearby
  async getNearbyPoints(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);
      const radius = parseFloat(req.query.radius as string) || 500; // in meters
      const category = req.query.category as string;

      if (isNaN(lat) || isNaN(lng)) {
        apiResponse.error(res, "Invalid lat/lng coordinates provided", [], 400);
        return;
      }

      const locations = await mapLocationRepository.find(category ? { category } : {}, { limit: 1000 });
      const food = await foodVendorRepository.find({}, { limit: 100 });
      const services = await servicePointRepository.find(category ? { category } : {}, { limit: 100 });

      const nearby: any[] = [];

      const checkProximity = (name: string, pLat: number, pLng: number, cat: string, type: string, extra = {}) => {
        const dist = getDistanceInMeters(lat, lng, pLat, pLng);
        if (dist <= radius) {
          nearby.push({
            name,
            latitude: pLat,
            longitude: pLng,
            category: cat,
            type,
            distance: Math.round(dist),
            walkTime: getWalkingTimeInMins(dist),
            ...extra,
          });
        }
      };

      locations.docs.forEach(loc => checkProximity(loc.name, loc.latitude, loc.longitude, loc.category, "location"));
      food.docs.forEach(f => checkProximity(f.vendorName, f.latitude || 40.8135, f.longitude || -74.0744, "food", "food", { cuisine: f.category }));
      services.docs.forEach(s => checkProximity(s.name, s.latitude, s.longitude, s.category, "service"));

      // Sort by distance ascending
      nearby.sort((a, b) => a.distance - b.distance);

      apiResponse.success(res, "Nearby locations identified", nearby);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to retrieve nearby points");
    }
  },

  // GET /api/map/distance
  async calculateDistance(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const startLat = parseFloat(req.query.startLat as string);
      const startLng = parseFloat(req.query.startLng as string);
      const endLat = parseFloat(req.query.endLat as string);
      const endLng = parseFloat(req.query.endLng as string);

      if (isNaN(startLat) || isNaN(startLng) || isNaN(endLat) || isNaN(endLng)) {
        apiResponse.error(res, "Start and end coordinates are required", [], 400);
        return;
      }

      const distance = Math.round(getDistanceInMeters(startLat, startLng, endLat, endLng));
      const walkTime = getWalkingTimeInMins(distance);
      const eta = new Date(Date.now() + walkTime * 60 * 1000);

      apiResponse.success(res, "Distance matrices calculated", {
        distance, // in meters
        walkTime, // in minutes
        eta,
      });
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to calculate distance");
    }
  },
};
