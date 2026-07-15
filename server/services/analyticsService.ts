import { analyticsRepository } from "../repositories/analyticsRepository";

export const analyticsService = {
  async getLatestAnalytics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let record = await analyticsRepository.findOne({
      date: { $gte: today },
    });

    if (!record) {
      // Seed with some initial baseline mock metrics if it's a new day
      record = await analyticsRepository.create({
        visitors: 45230,
        AIRequests: 12450,
        crowdReports: 86,
        incidents: 23,
        popularRoutes: ["Gate 3 to Section B", "Metro Station to Gate 1"],
        foodOrders: 324,
        date: today,
      });
    }

    return record;
  },

  async incrementMetric(metric: "visitors" | "AIRequests" | "crowdReports" | "incidents" | "foodOrders") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let record = await analyticsRepository.findOne({
      date: { $gte: today },
    });

    if (!record) {
      // Create first
      record = await analyticsRepository.create({
        visitors: 45230,
        AIRequests: 12450,
        crowdReports: 86,
        incidents: 23,
        popularRoutes: ["Gate 3 to Section B", "Metro Station to Gate 1"],
        foodOrders: 324,
        date: today,
      });
    }

    record[metric] = (record[metric] || 0) + 1;
    return record.save();
  },
};
