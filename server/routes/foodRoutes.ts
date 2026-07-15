import { Router } from "express";
import { foodController } from "../controllers/foodController";
import { authenticateUser, authorizeRoles } from "../middleware/authMiddleware";
import { validateFoodVendor, handleValidationErrors } from "../middleware/validator";

const router = Router();

// Publicly readable
router.get("/", foodController.getAllFoodVendors);

// Gated writes
router.post(
  "/",
  authenticateUser,
  authorizeRoles("admin", "organizer"),
  validateFoodVendor,
  handleValidationErrors,
  foodController.createFoodVendor
);
router.put(
  "/:id",
  authenticateUser,
  authorizeRoles("admin", "organizer"),
  foodController.updateFoodVendor
);
router.delete(
  "/:id",
  authenticateUser,
  authorizeRoles("admin"),
  foodController.deleteFoodVendor
);

export default router;
