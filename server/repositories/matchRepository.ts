import { BaseRepository } from "./baseRepository";
import { Match } from "../models/Match";

export class MatchRepository extends BaseRepository<any> {
  constructor() {
    super(Match);
  }
}

export const matchRepository = new MatchRepository();
