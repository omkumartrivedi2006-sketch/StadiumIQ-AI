import { BaseRepository } from "./baseRepository";
import { Incident } from "../models/Incident";

export class IncidentRepository extends BaseRepository<any> {
  constructor() {
    super(Incident);
  }
}

export const incidentRepository = new IncidentRepository();
