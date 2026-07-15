import { Router } from "express";
import { sosController } from "../controllers/sosController";
import { authenticateUser, authorizeRoles } from "../middleware/authMiddleware";
import { validateSOS, handleValidationErrors } from "../middleware/validator";

const router = Router();

// Requires authentication
router.use(authenticateUser);

router.post("/", validateSOS, handleValidationErrors, sosController.createSOSReport);
router.get("/", authorizeRoles("admin", "volunteer"), sosController.getAllSOSReports);
router.put("/:id", authorizeRoles("admin", "volunteer"), sosController.updateSOSReport);

export default router;
