import { incidentRepository } from "../repositories/incidentRepository";

export const incidentService = {
  async getAllIncidents(filter: any, options: any) {
    return incidentRepository.find(filter, options);
  },

  async createIncident(data: any) {
    return incidentRepository.create(data);
  },

  async updateIncident(id: string, data: any) {
    return incidentRepository.update(id, data);
  },
};
