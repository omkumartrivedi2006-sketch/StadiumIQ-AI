import { foodVendorRepository } from "../repositories/foodVendorRepository";
import { stadiumRepository } from "../repositories/stadiumRepository";

export const foodService = {
  async getAllFoodVendors(filter: any, options: any) {
    const opts = {
      ...options,
      populate: options.populate || "stadiumId",
    };
    return foodVendorRepository.find(filter, opts);
  },

  async getFoodVendorById(id: string) {
    return foodVendorRepository.findById(id, "stadiumId");
  },

  async createFoodVendor(data: any) {
    const stadium = await stadiumRepository.findById(data.stadiumId);
    if (!stadium) {
      throw new Error("Invalid Stadium ID provided");
    }
    return foodVendorRepository.create(data);
  },

  async updateFoodVendor(id: string, data: any) {
    if (data.stadiumId) {
      const stadium = await stadiumRepository.findById(data.stadiumId);
      if (!stadium) {
        throw new Error("Invalid Stadium ID provided");
      }
    }
    return foodVendorRepository.update(id, data);
  },

  async deleteFoodVendor(id: string) {
    return foodVendorRepository.delete(id);
  },
};
