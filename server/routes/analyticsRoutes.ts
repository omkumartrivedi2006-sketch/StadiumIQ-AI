import { Router } from "express";
import { analyticsController } from "../controllers/analyticsController";
import { authenticateUser, authorizeRoles } from "../middleware/authMiddleware";

const router = Router();

// Protect to Admin only
router.get("/analytics", authenticateUser, authorizeRoles("admin"), analyticsController.getAdminAnalytics);

export default router;
