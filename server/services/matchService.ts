import { matchRepository } from "../repositories/matchRepository";
import { stadiumRepository } from "../repositories/stadiumRepository";
import { sportsMatchRepository } from "./sportsApi/repositories/SportsMatchRepository";

export const matchService = {
  async getAllMatches(filter: any, options: any) {
    // Fetch live synchronized matches from our sportsMatchRepository
    const docs = await sportsMatchRepository.getAllMatches(filter?.status);
    
    // Apply basic filtering if stadiumId is specified
    let filteredDocs = docs;
    if (filter?.stadiumId) {
      filteredDocs = docs.filter((d: any) => 
        d.stadiumId?._id?.toString() === filter.stadiumId.toString() ||
        d.stadiumId?.toString() === filter.stadiumId.toString()
      );
    }

    // Apply pagination
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const startIndex = (page - 1) * limit;
    const paginatedDocs = filteredDocs.slice(startIndex, startIndex + limit);

    return {
      docs: paginatedDocs,
      totalDocs: filteredDocs.length,
      limit,
      page,
      pages: Math.ceil(filteredDocs.length / limit) || 1
    };
  },

  async getMatchById(id: string) {
    return sportsMatchRepository.getMatchById(id);
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

