import { Router } from "express";
import { mapController } from "../controllers/mapController";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

// All map and navigation services require JWT authentication
router.use(authenticateUser);

router.get("/stadium", mapController.getStadiumMap);
router.get("/markers", mapController.getMapLocations);
router.get("/routes", mapController.getRoutes);
router.get("/parking", mapController.getParkingLots);
router.get("/food", mapController.getFoodVendors);
router.get("/services", mapController.getServicePoints);
router.post("/navigation", mapController.getNavigationRoute);
router.get("/search", mapController.searchMap);
router.get("/nearby", mapController.getNearbyPoints);
router.get("/distance", mapController.calculateDistance);

export default router;
