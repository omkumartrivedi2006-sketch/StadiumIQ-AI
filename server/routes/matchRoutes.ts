import { Router } from "express";
import { matchController } from "../controllers/matchController";
import { authenticateUser, authorizeRoles } from "../middleware/authMiddleware";
import { validateMatch, handleValidationErrors } from "../middleware/validator";

const router = Router();

// Publicly readable
router.get("/", matchController.getAllMatches);
router.get("/:id", matchController.getMatchById);

// Organizer & Admin writes
router.post(
  "/",
  authenticateUser,
  authorizeRoles("admin", "organizer"),
  validateMatch,
  handleValidationErrors,
  matchController.createMatch
);
router.put(
  "/:id",
  authenticateUser,
  authorizeRoles("admin", "organizer"),
  matchController.updateMatch
);
router.delete(
  "/:id",
  authenticateUser,
  authorizeRoles("admin"),
  matchController.deleteMatch
);

export default router;
