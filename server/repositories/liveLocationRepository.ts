import { BaseRepository } from "./baseRepository";
import { LiveLocation } from "../models/LiveLocation";

export class LiveLocationRepository extends BaseRepository<any> {
  constructor() {
    super(LiveLocation);
  }
}

export const liveLocationRepository = new LiveLocationRepository();
