import { BaseRepository } from "./baseRepository";
import { Stadium } from "../models/Stadium";

export class StadiumRepository extends BaseRepository<any> {
  constructor() {
    super(Stadium);
  }
}

export const stadiumRepository = new StadiumRepository();
