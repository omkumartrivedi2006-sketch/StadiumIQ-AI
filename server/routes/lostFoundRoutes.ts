import { Router } from "express";
import { lostFoundController } from "../controllers/lostFoundController";
import { authenticateUser, authorizeRoles } from "../middleware/authMiddleware";
import { validateLostFound, handleValidationErrors } from "../middleware/validator";

const router = Router();

// Requires authentication
router.use(authenticateUser);

router.get("/", lostFoundController.getAllItems);
router.post("/", validateLostFound, handleValidationErrors, lostFoundController.reportItem);
router.put("/:id", authorizeRoles("admin", "volunteer"), lostFoundController.updateItemStatus);

export default router;
