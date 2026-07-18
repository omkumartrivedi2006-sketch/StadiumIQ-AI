import { BaseRepository } from "./baseRepository";
import { ServicePoint } from "../models/ServicePoint";

export class ServicePointRepository extends BaseRepository<any> {
  constructor() {
    super(ServicePoint);
  }
}

export const servicePointRepository = new ServicePointRepository();
