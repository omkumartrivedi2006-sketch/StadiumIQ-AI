import { BaseRepository } from "./baseRepository";
import { StadiumMap } from "../models/StadiumMap";

export class StadiumMapRepository extends BaseRepository<any> {
  constructor() {
    super(StadiumMap);
  }
}

export const stadiumMapRepository = new StadiumMapRepository();
