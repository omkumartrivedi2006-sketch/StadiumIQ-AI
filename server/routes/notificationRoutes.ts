import { Router } from "express";
import { notificationController } from "../controllers/notificationController";
import { authenticateUser, authorizeRoles } from "../middleware/authMiddleware";
import { validateNotification, handleValidationErrors } from "../middleware/validator";

const router = Router();

// Requires authentication
router.use(authenticateUser);

router.get("/", notificationController.getNotifications);

// Organizer & Admin broadcasts
router.post(
  "/",
  authorizeRoles("admin", "organizer"),
  validateNotification,
  handleValidationErrors,
  notificationController.createNotification
);
router.put("/:id", notificationController.updateNotification);
router.delete("/:id", notificationController.deleteNotification);

export default router;
