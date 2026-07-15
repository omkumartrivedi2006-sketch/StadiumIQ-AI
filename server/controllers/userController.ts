import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { userService } from "../services/userService";
import { apiResponse } from "../utils/apiResponse";

export const userController = {
  async getAllUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || "";
      const role = (req.query.role as string) || "";

      const filter: any = {};
      if (search) {
        filter.$or = [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }
      if (role) {
        filter.role = role;
      }

      const result = await userService.getAllUsers(filter, { page, limit });
      apiResponse.success(res, "Users retrieved successfully", result);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to retrieve users");
    }
  },

  async getUserById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = await userService.getUserById(req.params.id);
      if (!user) {
        apiResponse.error(res, "User not found", [], 404);
        return;
      }
      apiResponse.success(res, "User retrieved successfully", user);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to retrieve user");
    }
  },

  async updateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = await userService.updateUser(req.params.id, req.body);
      if (!user) {
        apiResponse.error(res, "User not found or update failed", [], 404);
        return;
      }
      apiResponse.success(res, "User updated successfully", user);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to update user");
    }
  },

  async deleteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = await userService.deleteUser(req.params.id);
      if (!user) {
        apiResponse.error(res, "User not found", [], 404);
        return;
      }
      apiResponse.success(res, "User deleted successfully", user);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to delete user");
    }
  },
};
