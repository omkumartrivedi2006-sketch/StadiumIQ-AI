import { Router } from "express";
import { authController } from "../controllers/authController";
import { authenticateUser } from "../middleware/authMiddleware";
import {
  validateRegister,
  validateLogin,
  handleValidationErrors,
} from "../middleware/validator";

const router = Router();

// Public Routes
router.post("/register", validateRegister, handleValidationErrors, authController.register);
router.post("/login", validateLogin, handleValidationErrors, authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// Protected Routes
router.post("/logout", authenticateUser, authController.logout);
router.get("/profile", authenticateUser, authController.getProfile);
router.put("/profile", authenticateUser, authController.updateProfile);
router.put("/change-password", authenticateUser, authController.changePassword);
router.delete("/logout-all", authenticateUser, authController.logoutAll);

export default router;
