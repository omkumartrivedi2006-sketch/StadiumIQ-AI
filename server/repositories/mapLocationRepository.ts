import { BaseRepository } from "./baseRepository";
import { MapLocation } from "../models/MapLocation";

export class MapLocationRepository extends BaseRepository<any> {
  constructor() {
    super(MapLocation);
  }
}

export const mapLocationRepository = new MapLocationRepository();
