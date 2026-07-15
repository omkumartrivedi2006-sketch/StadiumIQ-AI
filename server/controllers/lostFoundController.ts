import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { lostFoundService } from "../services/lostFoundService";
import { apiResponse } from "../utils/apiResponse";

export const lostFoundController = {
  async getAllItems(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = (req.query.search as string) || "";
      const status = (req.query.status as string) || "";

      const filter: any = {};
      if (search) {
        filter.$or = [
          { description: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
        ];
      }
      if (status) {
        filter.status = status;
      }

      const result = await lostFoundService.getAllItems(filter, { page, limit });
      apiResponse.success(res, "Lost and found items retrieved successfully", result);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to retrieve items");
    }
  },

  async reportItem(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const itemData = {
        ...req.body,
        reportedBy: req.user?.id,
        reportedTime: new Date(),
      };

      const item = await lostFoundService.reportItem(itemData);
      apiResponse.success(res, "Item reported successfully", item, 201);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to report item");
    }
  },

  async updateItemStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { status } = req.body;
      const item = await lostFoundService.updateItemStatus(req.params.id, status);
      if (!item) {
        apiResponse.error(res, "Item not found", [], 404);
        return;
      }
      apiResponse.success(res, "Item status updated successfully", item);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to update item status");
    }
  },
};
