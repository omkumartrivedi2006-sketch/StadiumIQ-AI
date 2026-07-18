import { BaseRepository } from "./baseRepository";
import { Zone } from "../models/Zone";

export class ZoneRepository extends BaseRepository<any> {
  constructor() {
    super(Zone);
  }
}

export const zoneRepository = new ZoneRepository();
