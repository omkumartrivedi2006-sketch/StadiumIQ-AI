import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { stadiumService } from "../services/stadiumService";
import { apiResponse } from "../utils/apiResponse";
import { crowdReportRepository } from "../repositories/crowdReportRepository";
import { analyticsService } from "../services/analyticsService";

export const stadiumController = {
  async getAllStadiums(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || "";

      const filter: any = {};
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { city: { $regex: search, $options: "i" } },
        ];
      }

      const result = await stadiumService.getAllStadiums(filter, { page, limit });
      apiResponse.success(res, "Stadiums retrieved successfully", result);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to retrieve stadiums");
    }
  },

  async getStadiumById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const stadium = await stadiumService.getStadiumById(req.params.id);
      if (!stadium) {
        apiResponse.error(res, "Stadium not found", [], 404);
        return;
      }
      apiResponse.success(res, "Stadium retrieved successfully", stadium);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to retrieve stadium");
    }
  },

  async createStadium(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const stadium = await stadiumService.createStadium(req.body);
      apiResponse.success(res, "Stadium created successfully", stadium, 201);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to create stadium");
    }
  },

  async updateStadium(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const stadium = await stadiumService.updateStadium(req.params.id, req.body);
      if (!stadium) {
        apiResponse.error(res, "Stadium not found", [], 404);
        return;
      }
      apiResponse.success(res, "Stadium updated successfully", stadium);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to update stadium");
    }
  },

  async createCrowdReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { location, density } = req.body;
      if (!location || !density) {
        apiResponse.error(res, "Location and density are required", [], 400);
        return;
      }
      const stadiumsList = await stadiumService.getAllStadiums({}, { limit: 1 });
      const stadium = stadiumsList.docs[0];
      if (!stadium) {
        apiResponse.error(res, "Stadium not found", [], 404);
        return;
      }
      const report = await crowdReportRepository.create({
        stadiumId: stadium._id,
        location,
        density,
        updatedBy: req.user?.id,
        timestamp: new Date(),
      });
      await analyticsService.incrementMetric("crowdReports");
      apiResponse.success(res, "Crowd report submitted successfully", report, 201);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to submit crowd report");
    }
  },

  async deleteStadium(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const stadium = await stadiumService.deleteStadium(req.params.id);
      if (!stadium) {
        apiResponse.error(res, "Stadium not found", [], 404);
        return;
      }
      apiResponse.success(res, "Stadium deleted successfully", stadium);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to delete stadium");
    }
  },
};
