import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { ticketService } from "../services/ticketService";
import { apiResponse } from "../utils/apiResponse";

export const ticketController = {
  async getAllTickets(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const matchId = (req.query.matchId as string) || "";
      const userId = (req.query.userId as string) || "";

      const filter: any = {};
      if (matchId) {
        filter.matchId = matchId;
      }

      // RBAC Check: Fans can only view their own tickets
      if (req.user?.role === "fan") {
        filter.userId = req.user.id;
      } else if (userId) {
        filter.userId = userId;
      }

      const result = await ticketService.getAllTickets(filter, { page, limit });
      apiResponse.success(res, "Tickets retrieved successfully", result);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to retrieve tickets");
    }
  },

  async createTicket(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const ticketData = {
        ...req.body,
        userId: req.user?.role === "fan" ? req.user.id : req.body.userId || req.user?.id,
      };

      const ticket = await ticketService.createTicket(ticketData);
      apiResponse.success(res, "Ticket booked successfully", ticket, 201);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to book ticket");
    }
  },

  async updateTicket(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const ticket = await ticketService.updateTicket(req.params.id, req.body);
      if (!ticket) {
        apiResponse.error(res, "Ticket not found", [], 404);
        return;
      }
      apiResponse.success(res, "Ticket updated successfully", ticket);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to update ticket");
    }
  },

  async deleteTicket(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const ticket = await ticketService.deleteTicket(req.params.id);
      if (!ticket) {
        apiResponse.error(res, "Ticket not found", [], 404);
        return;
      }
      apiResponse.success(res, "Ticket cancelled successfully", ticket);
    } catch (error: any) {
      apiResponse.error(res, error.message || "Failed to cancel ticket");
    }
  },
};
