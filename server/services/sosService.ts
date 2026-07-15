import { sosReportRepository } from "../repositories/sosReportRepository";
import { userRepository } from "../repositories/userRepository";
import { analyticsService } from "./analyticsService";

export const sosService = {
  async getAllSOSReports(filter: any, options: any) {
    const opts = {
      ...options,
      populate: options.populate || ["userId", "responder"],
    };
    return sosReportRepository.find(filter, opts);
  },

  async createSOSReport(data: any) {
    const user = await userRepository.findById(data.userId);
    if (!user) {
      throw new Error("Invalid User ID provided");
    }

    const report = await sosReportRepository.create(data);
    
    // Increment incident analytics counter
    try {
      await analyticsService.incrementMetric("incidents");
    } catch (e) {
      // Non-blocking log
      console.error("Analytics increment failed:", e);
    }

    return report;
  },

  async updateSOSReport(id: string, data: any) {
    if (data.responder) {
      const responder = await userRepository.findById(data.responder);
      if (!responder) {
        throw new Error("Invalid Responder ID provided");
      }
    }
    return sosReportRepository.update(id, data);
  },
};
