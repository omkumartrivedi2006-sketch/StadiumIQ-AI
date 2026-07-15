import { BaseRepository } from "./baseRepository";
import { Analytics } from "../models/Analytics";

export class AnalyticsRepository extends BaseRepository<any> {
  constructor() {
    super(Analytics);
  }
}

export const analyticsRepository = new AnalyticsRepository();
