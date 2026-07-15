import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { transportService } from "../services/transportService";
import { apiResponse } from "../utils/apiResponse";

export const transportController = {
  async getAllTransportOptions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const stadiumId = (req.query.stadiumId as string) || "";

      const filter: any = {};
      if (stadiumId) {
        filter.stadiumId = stadiumId;
      }

      const result = await transportService.getAllTransportOptions(filter, { page, limit });
      apiResponse.success(res, "Transportation options retrieved successfully", result);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to retrieve transportation options");
    }
  },

  async createOrUpdateTransportOption(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const transport = await transportService.createOrUpdateTransportOption(req.body);
      apiResponse.success(res, "Transportation config updated successfully", transport);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to configure transportation");
    }
  },

  async updateTransportOption(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const transport = await transportService.updateTransportOption(req.params.id, req.body);
      if (!transport) {
        apiResponse.error(res, "Transportation config not found", [], 404);
        return;
      }
      apiResponse.success(res, "Transportation option updated successfully", transport);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to update transportation option");
    }
  },
};
