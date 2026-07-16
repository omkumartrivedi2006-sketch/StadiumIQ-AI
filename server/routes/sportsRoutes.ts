import { Router } from "express";
import { sportsApiController } from "../services/sportsApi/controllers/SportsApiController";
import { authenticateUser } from "../middleware/authMiddleware";
import { param } from "express-validator";
import { handleValidationErrors } from "../middleware/validator";

const router = Router();

// Secure all endpoints with authentication
router.use(authenticateUser);

// Teams
router.get("/teams", sportsApiController.getTeams);
router.get(
  "/teams/:id",
  [param("id").notEmpty().withMessage("Team ID is required")],
  handleValidationErrors,
  sportsApiController.getTeamById
);

// Players
router.get(
  "/players/:id",
  [param("id").notEmpty().withMessage("Player ID is required")],
  handleValidationErrors,
  sportsApiController.getPlayerById
);

// Standings
router.get("/standings", sportsApiController.getStandings);

// Weather
router.get(
  "/weather/stadium/:id",
  [param("id").notEmpty().withMessage("Stadium ID is required")],
  handleValidationErrors,
  sportsApiController.getStadiumWeather
);

export default router;
