import { BaseRepository } from "./baseRepository";
import { ParkingSlot } from "../models/ParkingSlot";

export class ParkingSlotRepository extends BaseRepository<any> {
  constructor() {
    super(ParkingSlot);
  }
}

export const parkingSlotRepository = new ParkingSlotRepository();
