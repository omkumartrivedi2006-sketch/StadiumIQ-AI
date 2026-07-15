import { transportRepository } from "../repositories/transportRepository";
import { stadiumRepository } from "../repositories/stadiumRepository";

export const transportService = {
  async getAllTransportOptions(filter: any, options: any) {
    const opts = {
      ...options,
      populate: options.populate || "stadiumId",
    };
    return transportRepository.find(filter, opts);
  },

  async createOrUpdateTransportOption(data: any) {
    const stadium = await stadiumRepository.findById(data.stadiumId);
    if (!stadium) {
      throw new Error("Invalid Stadium ID provided");
    }

    const existing = await transportRepository.findOne({ stadiumId: data.stadiumId });
    if (existing) {
      return transportRepository.update(existing._id.toString(), data);
    } else {
      return transportRepository.create(data);
    }
  },

  async updateTransportOption(id: string, data: any) {
    return transportRepository.update(id, data);
  },
};
