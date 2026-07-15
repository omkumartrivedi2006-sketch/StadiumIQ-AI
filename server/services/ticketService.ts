import { ticketRepository } from "../repositories/ticketRepository";
import { matchRepository } from "../repositories/matchRepository";
import { userRepository } from "../repositories/userRepository";

export const ticketService = {
  async getAllTickets(filter: any, options: any) {
    const opts = {
      ...options,
      populate: options.populate || ["userId", { path: "matchId", populate: { path: "stadiumId" } }],
    };
    return ticketRepository.find(filter, opts);
  },

  async createTicket(data: any) {
    // Validate User & Match
    const [user, match] = await Promise.all([
      userRepository.findById(data.userId),
      matchRepository.findById(data.matchId),
    ]);

    if (!user) {
      throw new Error("Invalid User ID provided");
    }
    if (!match) {
      throw new Error("Invalid Match ID provided");
    }
    if (match.seatAvailability <= 0) {
      throw new Error("No seats available for this match");
    }

    // Decrement seat availability
    match.seatAvailability -= 1;
    await match.save();

    // Mock QR Code generation if not provided
    if (!data.QRCode) {
      data.QRCode = `TICKET-${match._id}-${data.seatNumber}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }

    return ticketRepository.create(data);
  },

  async updateTicket(id: string, data: any) {
    return ticketRepository.update(id, data);
  },

  async deleteTicket(id: string) {
    const ticket = await ticketRepository.findById(id);
    if (ticket) {
      // Re-increment seat availability
      const match = await matchRepository.findById(ticket.matchId);
      if (match) {
        match.seatAvailability += 1;
        await match.save();
      }
    }
    return ticketRepository.delete(id);
  },
};
