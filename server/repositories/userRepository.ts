import { BaseRepository } from "./baseRepository";
import { User } from "../models/User";

export class UserRepository extends BaseRepository<any> {
  constructor() {
    super(User);
  }
}

export const userRepository = new UserRepository();
