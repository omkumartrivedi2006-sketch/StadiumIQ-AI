import { BaseRepository } from "./baseRepository";
import { FoodVendor } from "../models/FoodVendor";

export class FoodVendorRepository extends BaseRepository<any> {
  constructor() {
    super(FoodVendor);
  }
}

export const foodVendorRepository = new FoodVendorRepository();
