import { BaseRepository } from "./baseRepository";
import { Ticket } from "../models/Ticket";

export class TicketRepository extends BaseRepository<any> {
  constructor() {
    super(Ticket);
  }
}

export const ticketRepository = new TicketRepository();
