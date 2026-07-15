import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { apiResponse } from "../utils/apiResponse";
import { Match } from "../models/Match";
import { Stadium } from "../models/Stadium";
import { FoodVendor } from "../models/FoodVendor";
import { Transportation } from "../models/Transportation";
import { User } from "../models/User";

export const searchController = {
  // GET /api/search?q=query
  async search(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const query = (req.query.q as string) || "";
      if (!query.trim()) {
        apiResponse.success(res, "Empty search query", {
          matches: [],
          stadiums: [],
          foodVendors: [],
          transport: [],
          users: []
        });
        return;
      }

      const isRegex = { $regex: query, $options: "i" };

      // Parallel queries to mongoose models
      const [matches, stadiums, foodVendors, transport] = await Promise.all([
        Match.find({
          $or: [
            { homeTeam: isRegex },
            { awayTeam: isRegex },
            { status: isRegex }
          ]
        }).limit(5).exec(),
        Stadium.find({
          $or: [
            { name: isRegex },
            { city: isRegex }
          ]
        }).limit(5).exec(),
        FoodVendor.find({
          $or: [
            { name: isRegex },
            { category: isRegex },
            { location: isRegex }
          ]
        }).limit(5).exec(),
        Transportation.find({
          $or: [
            { type: isRegex },
            { routeName: isRegex },
            { destination: isRegex }
          ]
        }).limit(5).exec()
      ]);

      // Only allow admins to search users
      let users: any[] = [];
      if (req.user?.role === "admin") {
        users = await User.find({
          $or: [
            { fullName: isRegex },
            { email: isRegex }
          ]
        }).limit(5).exec();
      }

      apiResponse.success(res, "Global search completed successfully", {
        matches,
        stadiums,
        foodVendors,
        transport,
        users
      });

    } catch (error: any) {
      console.error("Global Search Error:", error);
      apiResponse.error(res, error.message || "Failed to execute global search", [], 500);
    }
  }
};
