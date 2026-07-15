import { Router } from "express";
import { transportController } from "../controllers/transportController";
import { authenticateUser, authorizeRoles } from "../middleware/authMiddleware";

const router = Router();

// Publicly readable
router.get("/", transportController.getAllTransportOptions);

// Admin & Organizer config routes
router.post(
  "/",
  authenticateUser,
  authorizeRoles("admin", "organizer"),
  transportController.createOrUpdateTransportOption
);
router.put(
  "/:id",
  authenticateUser,
  authorizeRoles("admin", "organizer"),
  transportController.updateTransportOption
);

export default router;
