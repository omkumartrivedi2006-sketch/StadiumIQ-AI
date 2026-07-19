import { Router } from "express";
import { incidentController } from "../controllers/incidentController";
import { authenticateUser, authorizeRoles } from "../middleware/authMiddleware";

const router = Router();

// Protect all routes to authenticated users
router.use(authenticateUser);

router.post("/", authorizeRoles("admin", "volunteer"), incidentController.createIncident);
router.get("/", authorizeRoles("admin", "organizer"), incidentController.getAllIncidents);
router.put("/:id", authorizeRoles("admin", "organizer"), incidentController.updateIncident);

export default router;
