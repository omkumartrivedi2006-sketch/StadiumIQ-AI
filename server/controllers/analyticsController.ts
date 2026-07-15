import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { analyticsService } from "../services/analyticsService";
import { apiResponse } from "../utils/apiResponse";

export const analyticsController = {
  async getAdminAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const stats = await analyticsService.getLatestAnalytics();
      apiResponse.success(res, "Analytics retrieved successfully", stats);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to retrieve analytics");
    }
  },
};
