import { Response } from "express";
import { AuthenticatedRequest } from "../../../middleware/authMiddleware";
import { sportsMatchRepository } from "../repositories/SportsMatchRepository";
import { sportsTeamRepository } from "../repositories/SportsTeamRepository";
import { sportsPlayerRepository } from "../repositories/SportsPlayerRepository";
import { sportsStandingRepository } from "../repositories/SportsStandingRepository";
import { sportsStadiumRepository } from "../repositories/SportsStadiumRepository";
import { apiResponse } from "../../../utils/apiResponse";
import { logger } from "../../../utils/logger";

export const sportsApiController = {
  // Matches Controllers
  async getLiveMatches(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const matches = await sportsMatchRepository.getAllMatches("live");
      apiResponse.success(res, "Live matches retrieved successfully", { docs: matches });
    } catch (error: any) {
      logger.error("Error in getLiveMatches controller:", error);
      apiResponse.error(res, error.message || "Failed to retrieve live matches");
    }
  },

  async getUpcomingMatches(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const matches = await sportsMatchRepository.getAllMatches("upcoming");
      apiResponse.success(res, "Upcoming matches retrieved successfully", { docs: matches });
    } catch (error: any) {
      logger.error("Error in getUpcomingMatches controller:", error);
      apiResponse.error(res, error.message || "Failed to retrieve upcoming matches");
    }
  },

  async getCompletedMatches(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const matches = await sportsMatchRepository.getAllMatches("completed");
      apiResponse.success(res, "Completed matches retrieved successfully", { docs: matches });
    } catch (error: any) {
      logger.error("Error in getCompletedMatches controller:", error);
      apiResponse.error(res, error.message || "Failed to retrieve completed matches");
    }
  },

  async getMatchById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const match = await sportsMatchRepository.getMatchById(req.params.id);
      if (!match) {
        apiResponse.error(res, "Match not found", [], 404);
        return;
      }
      apiResponse.success(res, "Match details retrieved successfully", match);
    } catch (error: any) {
      logger.error(`Error in getMatchById controller for ID ${req.params.id}:`, error);
      apiResponse.error(res, error.message || "Failed to retrieve match details");
    }
  },

  async getMatchEvents(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const events = await sportsMatchRepository.getMatchEvents(req.params.id);
      apiResponse.success(res, "Match events retrieved successfully", events);
    } catch (error: any) {
      logger.error(`Error in getMatchEvents controller for match ${req.params.id}:`, error);
      apiResponse.error(res, error.message || "Failed to retrieve match events");
    }
  },

  async getMatchStatistics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const stats = await sportsMatchRepository.getMatchStatistics(req.params.id);
      apiResponse.success(res, "Match statistics retrieved successfully", stats);
    } catch (error: any) {
      logger.error(`Error in getMatchStatistics controller for match ${req.params.id}:`, error);
      apiResponse.error(res, error.message || "Failed to retrieve match statistics");
    }
  },

  // Teams Controllers
  async getTeams(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const teams = await sportsTeamRepository.getTeams();
      apiResponse.success(res, "Teams retrieved successfully", { docs: teams });
    } catch (error: any) {
      logger.error("Error in getTeams controller:", error);
      apiResponse.error(res, error.message || "Failed to retrieve teams");
    }
  },

  async getTeamById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const team = await sportsTeamRepository.getTeamById(req.params.id);
      if (!team) {
        apiResponse.error(res, "Team not found", [], 404);
        return;
      }
      apiResponse.success(res, "Team details retrieved successfully", team);
    } catch (error: any) {
      logger.error(`Error in getTeamById controller for ID ${req.params.id}:`, error);
      apiResponse.error(res, error.message || "Failed to retrieve team details");
    }
  },

  // Players Controllers
  async getPlayerById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const player = await sportsPlayerRepository.getPlayerById(req.params.id);
      if (!player) {
        apiResponse.error(res, "Player not found", [], 404);
        return;
      }
      apiResponse.success(res, "Player details retrieved successfully", player);
    } catch (error: any) {
      logger.error(`Error in getPlayerById controller for ID ${req.params.id}:`, error);
      apiResponse.error(res, error.message || "Failed to retrieve player details");
    }
  },

  // Standings Controller
  async getStandings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const standings = await sportsStandingRepository.getStandings();
      apiResponse.success(res, "Standings retrieved successfully", standings);
    } catch (error: any) {
      logger.error("Error in getStandings controller:", error);
      apiResponse.error(res, error.message || "Failed to retrieve standings");
    }
  },

  // Stadiums Controllers
  async getStadiums(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await sportsStadiumRepository.getAllStadiums();
      apiResponse.success(res, "Stadiums retrieved successfully", result);
    } catch (error: any) {
      logger.error("Error in getStadiums controller:", error);
      apiResponse.error(res, error.message || "Failed to retrieve stadiums");
    }
  },

  async getStadiumById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const stadium = await sportsStadiumRepository.getStadiumById(req.params.id);
      if (!stadium) {
        apiResponse.error(res, "Stadium not found", [], 404);
        return;
      }
      apiResponse.success(res, "Stadium retrieved successfully", stadium);
    } catch (error: any) {
      logger.error(`Error in getStadiumById controller for ID ${req.params.id}:`, error);
      apiResponse.error(res, error.message || "Failed to retrieve stadium");
    }
  },

  // Weather Controller
  async getStadiumWeather(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const weather = await sportsStadiumRepository.getStadiumWeather(req.params.id);
      apiResponse.success(res, "Stadium weather retrieved successfully", weather);
    } catch (error: any) {
      logger.error(`Error in getStadiumWeather controller for stadium ID ${req.params.id}:`, error);
      apiResponse.error(res, error.message || "Failed to retrieve stadium weather");
    }
  }
};
