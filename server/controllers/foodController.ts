import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { foodService } from "../services/foodService";
import { apiResponse } from "../utils/apiResponse";

export const foodController = {
  async getAllFoodVendors(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const stadiumId = (req.query.stadiumId as string) || "";
      const category = (req.query.category as string) || "";

      const filter: any = {};
      if (stadiumId) {
        filter.stadiumId = stadiumId;
      }
      if (category) {
        filter.category = category;
      }

      const result = await foodService.getAllFoodVendors(filter, { page, limit });
      apiResponse.success(res, "Food vendors retrieved successfully", result);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to retrieve food vendors");
    }
  },

  async createFoodVendor(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const vendor = await foodService.createFoodVendor(req.body);
      apiResponse.success(res, "Food vendor created successfully", vendor, 201);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to create food vendor");
    }
  },

  async updateFoodVendor(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const vendor = await foodService.updateFoodVendor(req.params.id, req.body);
      if (!vendor) {
        apiResponse.error(res, "Food vendor not found", [], 404);
        return;
      }
      apiResponse.success(res, "Food vendor updated successfully", vendor);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to update food vendor");
    }
  },

  async deleteFoodVendor(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const vendor = await foodService.deleteFoodVendor(req.params.id);
      if (!vendor) {
        apiResponse.error(res, "Food vendor not found", [], 404);
        return;
      }
      apiResponse.success(res, "Food vendor deleted successfully", vendor);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to delete food vendor");
    }
  },
};
