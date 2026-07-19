import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { incidentService } from "../services/incidentService";
import { apiResponse } from "../utils/apiResponse";

export const incidentController = {
  async getAllIncidents(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const status = (req.query.status as string) || "";

      const filter: any = {};
      if (status) {
        filter.status = status;
      }

      const result = await incidentService.getAllIncidents(filter, { page, limit });
      apiResponse.success(res, "Incidents retrieved successfully", result);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to retrieve incidents");
    }
  },

  async createIncident(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const incidentData = {
        ...req.body,
        reporter: req.user?.id,
      };
      const incident = await incidentService.createIncident(incidentData);
      apiResponse.success(res, "Incident reported successfully", incident, 201);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to report incident");
    }
  },

  async updateIncident(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const incident = await incidentService.updateIncident(req.params.id, req.body);
      if (!incident) {
        apiResponse.error(res, "Incident not found", [], 404);
        return;
      }
      apiResponse.success(res, "Incident updated successfully", incident);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to update incident");
    }
  },
};
