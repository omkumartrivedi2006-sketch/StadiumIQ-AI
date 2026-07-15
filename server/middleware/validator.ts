import { body, param, query, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({
        field: err.type === "field" ? err.path : "",
        message: err.msg,
      })),
    });
    return;
  }
  next();
};

export const validateRegister = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full Name is required")
    .isLength({ min: 2 })
    .withMessage("Full name must be at least 2 characters long"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email address"),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Mobile phone number is required")
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage("Please enter a valid international mobile number"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/\d/)
    .withMessage("Password must contain at least one number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage("Password must contain at least one special character"),
  body("confirmPassword")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password confirmation does not match password");
      }
      return true;
    }),
  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(["fan", "volunteer", "organizer", "admin"])
    .withMessage("Invalid role selection"),
  body("country")
    .trim()
    .notEmpty()
    .withMessage("Country selection is required"),
  body("acceptTerms")
    .isBoolean()
    .custom((val) => {
      if (val !== true) {
        throw new Error("You must accept the terms and conditions");
      }
      return true;
    }),
];

export const validateLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email address"),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

export const validateStadium = [
  body("name").trim().notEmpty().withMessage("Stadium name is required"),
  body("city").trim().notEmpty().withMessage("City is required"),
  body("country").trim().notEmpty().withMessage("Country is required"),
  body("capacity").isInt({ min: 1 }).withMessage("Capacity must be a positive integer"),
];

export const validateMatch = [
  body("stadiumId").isMongoId().withMessage("A valid Stadium ID is required"),
  body("homeTeam").trim().notEmpty().withMessage("Home team name is required"),
  body("awayTeam").trim().notEmpty().withMessage("Away team name is required"),
  body("date").isISO8601().toDate().withMessage("A valid ISO8601 date is required"),
  body("kickoffTime").trim().notEmpty().withMessage("Kickoff time is required"),
  body("seatAvailability").isInt({ min: 0 }).withMessage("Seat availability must be a non-negative integer"),
];

export const validateTicket = [
  body("matchId").isMongoId().withMessage("A valid Match ID is required"),
  body("seatNumber").trim().notEmpty().withMessage("Seat number is required"),
  body("gate").trim().notEmpty().withMessage("Gate is required"),
];

export const validateFoodVendor = [
  body("stadiumId").isMongoId().withMessage("A valid Stadium ID is required"),
  body("vendorName").trim().notEmpty().withMessage("Vendor name is required"),
  body("category").trim().notEmpty().withMessage("Food category is required"),
  body("location").trim().notEmpty().withMessage("Vendor location is required"),
];

export const validateSOS = [
  body("location").trim().notEmpty().withMessage("SOS Location is required"),
  body("emergencyType")
    .isIn(["Medical Help", "Nearest Exit", "Security", "Accessibility", "General Emergency"])
    .withMessage("Invalid emergency type"),
];

export const validateNotification = [
  body("title").trim().notEmpty().withMessage("Notification title is required"),
  body("message").trim().notEmpty().withMessage("Notification message is required"),
  body("type")
    .isIn(["announcement", "alert", "ticket", "sos", "general"])
    .withMessage("Invalid notification type"),
];

export const validateChatMsg = [
  body("prompt").trim().notEmpty().withMessage("Prompt is required"),
  body("response").trim().notEmpty().withMessage("Response is required"),
];

export const validateLostFound = [
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("location").trim().notEmpty().withMessage("Location is required"),
];
