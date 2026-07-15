import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { matchService } from "../services/matchService";
import { apiResponse } from "../utils/apiResponse";

export const matchController = {
  async getAllMatches(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = (req.query.status as string) || "";
      const stadiumId = (req.query.stadiumId as string) || "";

      const filter: any = {};
      if (status) {
        filter.status = status;
      }
      if (stadiumId) {
        filter.stadiumId = stadiumId;
      }

      const result = await matchService.getAllMatches(filter, { page, limit });
      apiResponse.success(res, "Matches retrieved successfully", result);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to retrieve matches");
    }
  },

  async getMatchById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const match = await matchService.getMatchById(req.params.id);
      if (!match) {
        apiResponse.error(res, "Match not found", [], 404);
        return;
      }
      apiResponse.success(res, "Match retrieved successfully", match);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to retrieve match");
    }
  },

  async createMatch(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const match = await matchService.createMatch(req.body);
      apiResponse.success(res, "Match created successfully", match, 201);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to create match");
    }
  },

  async updateMatch(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const match = await matchService.updateMatch(req.params.id, req.body);
      if (!match) {
        apiResponse.error(res, "Match not found", [], 404);
        return;
      }
      apiResponse.success(res, "Match updated successfully", match);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to update match");
    }
  },

  async deleteMatch(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const match = await matchService.deleteMatch(req.params.id);
      if (!match) {
        apiResponse.error(res, "Match not found", [], 404);
        return;
      }
      apiResponse.success(res, "Match deleted successfully", match);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to delete match");
    }
  },
};
