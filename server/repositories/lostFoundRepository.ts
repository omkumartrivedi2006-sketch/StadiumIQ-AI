import { BaseRepository } from "./baseRepository";
import { LostFound } from "../models/LostFound";

export class LostFoundRepository extends BaseRepository<any> {
  constructor() {
    super(LostFound);
  }
}

export const lostFoundRepository = new LostFoundRepository();
