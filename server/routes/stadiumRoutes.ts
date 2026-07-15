import { Router } from "express";
import { stadiumController } from "../controllers/stadiumController";
import { authenticateUser, authorizeRoles } from "../middleware/authMiddleware";
import { validateStadium, handleValidationErrors } from "../middleware/validator";

const router = Router();

// Publicly readable
router.get("/", stadiumController.getAllStadiums);
router.get("/:id", stadiumController.getStadiumById);
router.post("/crowd-report", authenticateUser, stadiumController.createCrowdReport);

// Gated write operations (Admin & Organizer roles)
router.post(
  "/",
  authenticateUser,
  authorizeRoles("admin", "organizer"),
  validateStadium,
  handleValidationErrors,
  stadiumController.createStadium
);
router.put(
  "/:id",
  authenticateUser,
  authorizeRoles("admin", "organizer"),
  stadiumController.updateStadium
);
router.delete(
  "/:id",
  authenticateUser,
  authorizeRoles("admin"),
  stadiumController.deleteStadium
);

export default router;
