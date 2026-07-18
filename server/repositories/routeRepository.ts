import { BaseRepository } from "./baseRepository";
import { Route } from "../models/Route";

export class RouteRepository extends BaseRepository<any> {
  constructor() {
    super(Route);
  }
}

export const routeRepository = new RouteRepository();
