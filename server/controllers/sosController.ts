import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { sosService } from "../services/sosService";
import { apiResponse } from "../utils/apiResponse";
import { emitEvent } from "../utils/socket";

export const sosController = {
  async getAllSOSReports(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = (req.query.status as string) || "";

      const filter: any = {};
      if (status) {
        filter.status = status;
      }
      if (req.user && req.user.role === "fan") {
        filter.userId = req.user.id;
      }

      const result = await sosService.getAllSOSReports(filter, { page, limit });
      apiResponse.success(res, "SOS reports retrieved successfully", result);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to retrieve SOS reports");
    }
  },

  async createSOSReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const reportData = {
        ...req.body,
        userId: req.user?.id,
      };

      const report = await sosService.createSOSReport(reportData);
      
      // Emit socket event to volunteers, organizers, and admins
      emitEvent("new-sos", report, "volunteer");
      emitEvent("new-sos", report, "organizer");
      emitEvent("new-sos", report, "admin");

      apiResponse.success(res, "SOS alert triggered successfully. Help is on the way.", report, 201);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to trigger SOS alert");
    }
  },

  async updateSOSReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const updateData = { ...req.body };
      
      // If setting responder, attach current user ID (for volunteers claiming task)
      if (updateData.claim === true && req.user) {
        updateData.responder = req.user.id;
        updateData.status = "pending";
      }

      const report = await sosService.updateSOSReport(req.params.id, updateData);
      if (!report) {
        apiResponse.error(res, "SOS report not found", [], 404);
        return;
      }

      // Emit updated socket event
      emitEvent("update-sos", report, "volunteer");
      emitEvent("update-sos", report, "organizer");
      emitEvent("update-sos", report, "admin");

      apiResponse.success(res, "SOS report updated successfully", report);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to update SOS report");
    }
  },
};
