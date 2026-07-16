import { Router } from "express";
import { matchController } from "../controllers/matchController";
import { sportsApiController } from "../services/sportsApi/controllers/SportsApiController";
import { authenticateUser, authorizeRoles } from "../middleware/authMiddleware";
import { validateMatch, handleValidationErrors } from "../middleware/validator";

const router = Router();

// Publicly readable
router.get("/live", sportsApiController.getLiveMatches);
router.get("/upcoming", sportsApiController.getUpcomingMatches);
router.get("/completed", sportsApiController.getCompletedMatches);
router.get("/:id/events", sportsApiController.getMatchEvents);
router.get("/:id/statistics", sportsApiController.getMatchStatistics);

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

