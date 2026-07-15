import { stadiumRepository } from "../repositories/stadiumRepository";

export const stadiumService = {
  async getAllStadiums(filter: any, options: any) {
    return stadiumRepository.find(filter, options);
  },

  async getStadiumById(id: string) {
    return stadiumRepository.findById(id);
  },

  async createStadium(data: any) {
    return stadiumRepository.create(data);
  },

  async updateStadium(id: string, data: any) {
    return stadiumRepository.update(id, data);
  },

  async deleteStadium(id: string) {
    return stadiumRepository.delete(id);
  },
};
