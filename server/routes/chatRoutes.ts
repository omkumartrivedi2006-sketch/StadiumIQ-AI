import { Router } from "express";
import { chatController } from "../controllers/chatController";
import { authenticateUser } from "../middleware/authMiddleware";
import { validateChatMsg, handleValidationErrors } from "../middleware/validator";

const router = Router();

// Requires authentication
router.use(authenticateUser);

router.get("/history", chatController.getChatHistory);
router.post("/history", validateChatMsg, handleValidationErrors, chatController.saveChatMessage);
router.delete("/history", chatController.clearChatHistory);

export default router;
