import { BaseRepository } from "./baseRepository";
import { Transportation } from "../models/Transportation";

export class TransportRepository extends BaseRepository<any> {
  constructor() {
    super(Transportation);
  }
}

export const transportRepository = new TransportRepository();
