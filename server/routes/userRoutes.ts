import { Router } from "express";
import { userController } from "../controllers/userController";
import { authenticateUser, authorizeRoles } from "../middleware/authMiddleware";

const router = Router();

// Protect all routes to Admin and Organizer roles
router.use(authenticateUser, authorizeRoles("admin", "organizer"));

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

export default router;
