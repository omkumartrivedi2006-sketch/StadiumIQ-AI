import { Router } from "express";
import { aiController } from "../controllers/aiController";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

// Secure all AI endpoints
router.use(authenticateUser);

router.post("/chat", aiController.chat);
router.post("/navigation", aiController.navigation);
router.post("/crowd", aiController.crowd);
router.post("/transport", aiController.transport);
router.post("/food", aiController.food);
router.post("/accessibility", aiController.accessibility);
router.post("/emergency", aiController.emergency);

router.get("/history", aiController.getChatHistory);
router.delete("/history", aiController.clearChatHistory);

export default router;
