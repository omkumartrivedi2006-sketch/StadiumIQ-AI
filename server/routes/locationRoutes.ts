import { Router } from "express";
import { locationController } from "../controllers/locationController";
import { authenticateUser, authorizeRoles } from "../middleware/authMiddleware";

const router = Router();

// All location endpoints require JWT authentication
router.use(authenticateUser);

router.post("/update", locationController.updateLocation);
router.get("/me", locationController.getMyLocation);

// Restricted endpoints by roles
router.get("/volunteers", authorizeRoles("admin", "organizer"), locationController.getVolunteers);
router.get("/organizers", authorizeRoles("admin"), locationController.getOrganizers);
router.get("/users", authorizeRoles("admin"), locationController.getUsers);
router.get("/live", authorizeRoles("admin", "organizer", "volunteer", "fan"), locationController.getLiveLocations);

router.delete("/stop", locationController.stopLocation);

export default router;
