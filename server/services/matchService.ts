import { matchRepository } from "../repositories/matchRepository";
import { stadiumRepository } from "../repositories/stadiumRepository";

export const matchService = {
  async getAllMatches(filter: any, options: any) {
    // Return populated stadium details
    const optionsWithPopulate = {
      ...options,
      populate: options.populate || "stadiumId",
    };
    return matchRepository.find(filter, optionsWithPopulate);
  },

  async getMatchById(id: string) {
    return matchRepository.findById(id, "stadiumId");
  },

  async createMatch(data: any) {
    // Validate that stadium exists
    const stadium = await stadiumRepository.findById(data.stadiumId);
    if (!stadium) {
      throw new Error("Invalid Stadium ID provided");
    }
    return matchRepository.create(data);
  },

  async updateMatch(id: string, data: any) {
    if (data.stadiumId) {
      const stadium = await stadiumRepository.findById(data.stadiumId);
      if (!stadium) {
        throw new Error("Invalid Stadium ID provided");
      }
    }
    return matchRepository.update(id, data);
  },

  async deleteMatch(id: string) {
    return matchRepository.delete(id);
  },
};
