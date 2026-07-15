import { Router } from "express";
import { ticketController } from "../controllers/ticketController";
import { authenticateUser, authorizeRoles } from "../middleware/authMiddleware";
import { validateTicket, handleValidationErrors } from "../middleware/validator";

const router = Router();

// Requires authentication
router.use(authenticateUser);

router.get("/", ticketController.getAllTickets);
router.post("/", validateTicket, handleValidationErrors, ticketController.createTicket);
router.put("/:id", authorizeRoles("admin", "organizer"), ticketController.updateTicket);
router.delete("/:id", ticketController.deleteTicket);

export default router;
