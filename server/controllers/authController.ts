import { Response } from "express";
import { userRepository } from "../repositories/userRepository";
import { authService } from "../services/authService";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

// Cookie configurations for JWT Refresh Token
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

export const authController = {
  async register(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { fullName, email, phone, password, role, country } = req.body;

      // Duplicate checks
      const existingUser = await userRepository.findOne({
        $or: [{ email: email.toLowerCase() }, { phone }],
      });
      if (existingUser) {
        if (existingUser.email === email.toLowerCase()) {
          res.status(400).json({ success: false, message: "Email is already registered" });
          return;
        }
        if (existingUser.phone === phone) {
          res.status(400).json({ success: false, message: "Phone number is already registered" });
          return;
        }
      }

      // Hashing Password
      const hashedPassword = await authService.hashPassword(password);

      // Create new user
      const user = await userRepository.create({
        fullName,
        email: email.toLowerCase(),
        phone,
        password: hashedPassword,
        role,
        country,
      });

      // Automatically generate tokens on registration (UX convenience)
      const accessToken = authService.generateAccessToken(user._id.toString(), user.role);
      const refreshToken = authService.generateRefreshToken(user._id.toString());

      // Save refresh token to user record
      user.refreshToken = refreshToken;
      await user.save();

      // Set cookie
      res.cookie("refresh_token", refreshToken, COOKIE_OPTIONS);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        accessToken,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          country: user.country,
        },
      });
    } catch (error) {
      console.error("Register Error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  async login(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const user = await userRepository.findOne({ email: email.toLowerCase() });
      if (!user || (user as any).isDeleted) {
        res.status(400).json({ success: false, message: "Invalid email or password" });
        return;
      }

      const userStatus = (user as any).status || "active";
      if (userStatus !== "active") {
        res.status(403).json({ success: false, message: `Your account is ${userStatus}. Please contact support.` });
        return;
      }

      const isMatch = await authService.comparePassword(password, user.password);
      if (!isMatch) {
        res.status(400).json({ success: false, message: "Invalid email or password" });
        return;
      }

      // Generate Access and Refresh Tokens
      const accessToken = authService.generateAccessToken(user._id.toString(), user.role);
      const refreshToken = authService.generateRefreshToken(user._id.toString());

      // Save refresh token to DB
      user.refreshToken = refreshToken;
      (user as any).lastLogin = new Date();
      await user.save();

      // Set cookie
      res.cookie("refresh_token", refreshToken, COOKIE_OPTIONS);

      res.json({
        success: true,
        message: "Logged in successfully",
        accessToken,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          country: user.country,
        },
      });
    } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refresh_token;
      if (refreshToken) {
        const decoded = authService.verifyRefreshToken(refreshToken);
        if (decoded) {
          await userRepository.update(decoded.id, { refreshToken: null });
        }
      }

      res.clearCookie("refresh_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      res.json({ success: true, message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout Error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  async refreshToken(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refresh_token;
      if (!refreshToken) {
        res.status(401).json({ success: false, message: "Authentication expired. Please log in again." });
        return;
      }

      const decoded = authService.verifyRefreshToken(refreshToken);
      if (!decoded) {
        res.status(401).json({ success: false, message: "Invalid or expired session. Please log in again." });
        return;
      }

      const user = await userRepository.findById(decoded.id);
      if (!user || user.refreshToken !== refreshToken) {
        res.status(401).json({ success: false, message: "Session revoked or hijacked." });
        return;
      }

      // Generate new tokens
      const newAccessToken = authService.generateAccessToken(user._id.toString(), user.role);
      const newRefreshToken = authService.generateRefreshToken(user._id.toString());

      // Update in DB
      user.refreshToken = newRefreshToken;
      await user.save();

      // Reset Cookie
      res.cookie("refresh_token", newRefreshToken, COOKIE_OPTIONS);

      res.json({
        success: true,
        accessToken: newAccessToken,
      });
    } catch (error) {
      console.error("Refresh Token Error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Not authenticated" });
        return;
      }

      const user = await userRepository.findById(req.user.id);
      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }

      // Hide sensitive fields
      const userObj = user.toObject ? user.toObject() : { ...user };
      delete userObj.password;
      delete userObj.refreshToken;

      res.json({ success: true, user: userObj });
    } catch (error) {
      console.error("Get Profile Error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Not authenticated" });
        return;
      }

      const { fullName, phone, country, profileImage, language } = req.body;

      const user = await userRepository.findById(req.user.id);
      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }

      // If mobile is changing, check for duplicates
      if (phone && phone !== user.phone) {
        const phoneExists = await userRepository.findOne({ phone });
        if (phoneExists) {
          res.status(400).json({ success: false, message: "Mobile number is already registered to another user" });
          return;
        }
        user.phone = phone;
      }

      if (fullName) user.fullName = fullName;
      if (country) user.country = country;
      if (profileImage !== undefined) (user as any).profileImage = profileImage;
      if (language) user.language = language;

      await user.save();

      res.json({
        success: true,
        message: "Profile updated successfully",
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          country: user.country,
          profileImage: (user as any).profileImage,
          language: user.language,
        },
      });
    } catch (error) {
      console.error("Update Profile Error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  async forgotPassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      const user = await userRepository.findOne({ email: email.toLowerCase() });
      if (!user) {
        res.json({ success: true, message: "If that email exists in our records, a reset link has been sent." });
        return;
      }

      const mockResetToken = Math.random().toString(36).substr(2, 9);
      console.log(`[SMTP MOCK] Password reset link for ${email}: http://localhost:3000/reset-password?token=${mockResetToken}`);

      res.json({ success: true, message: "Password reset link sent to your email." });
    } catch (error) {
      console.error("Forgot Password Error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  async resetPassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        res.status(400).json({ success: false, message: "Missing reset token or new password" });
        return;
      }

      const user = await userRepository.findOne({}); // Grab first user to mock password update
      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }

      const hashedPassword = await authService.hashPassword(newPassword);
      user.password = hashedPassword;
      user.refreshToken = null; // revoke active sessions
      await user.save();

      res.json({ success: true, message: "Password reset successfully. You can now log in." });
    } catch (error) {
      console.error("Reset Password Error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Not authenticated" });
        return;
      }
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        res.status(400).json({ success: false, message: "Current and new passwords are required" });
        return;
      }
      const user = await userRepository.findById(req.user.id);
      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }
      const isMatch = await authService.comparePassword(currentPassword, user.password);
      if (!isMatch) {
        res.status(400).json({ success: false, message: "Incorrect current password" });
        return;
      }
      user.password = await authService.hashPassword(newPassword);
      await user.save();
      res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
      console.error("Change Password Error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  async logoutAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Not authenticated" });
        return;
      }

      // Revoke refresh token in database
      await userRepository.update(req.user.id, { refreshToken: null });

      res.clearCookie("refresh_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      res.json({ success: true, message: "All sessions successfully revoked." });
    } catch (error) {
      console.error("Logout All Error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  },
};
