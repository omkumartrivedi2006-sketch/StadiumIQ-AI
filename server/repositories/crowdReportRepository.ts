import { BaseRepository } from "./baseRepository";
import { CrowdReport } from "../models/CrowdReport";

export class CrowdReportRepository extends BaseRepository<any> {
  constructor() {
    super(CrowdReport);
  }
}

export const crowdReportRepository = new CrowdReportRepository();
