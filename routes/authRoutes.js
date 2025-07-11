import { Router } from "express";
import authController from "../controllers/authController.js";
const { registerUser, loginUser, getUserProfile } = authController;
import authMiddleware from "../middlewares/authMiddleware.js";
const { authenticateUser } = authMiddleware;

const router = Router();

// User registration route
router.post("/register", registerUser);

// User login route
router.post("/login", loginUser);

// Get user profile (protected route)
router.get("/profile", authenticateUser, getUserProfile);


export default router;
