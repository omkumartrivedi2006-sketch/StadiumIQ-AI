import { Router } from "express";
import { searchController } from "../controllers/searchController";
import { authenticateUser } from "../middleware/authMiddleware";

const router = Router();

// Protect search endpoint
router.use(authenticateUser);

router.get("/", searchController.search);

export default router;
