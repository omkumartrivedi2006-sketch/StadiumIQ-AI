import { BaseRepository } from "./baseRepository";
import { SOSReport } from "../models/SOSReport";

export class SOSReportRepository extends BaseRepository<any> {
  constructor() {
    super(SOSReport);
  }
}

export const sosReportRepository = new SOSReportRepository();
