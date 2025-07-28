//routes/authRoutes.js
import { Router } from "express";
import passport from "passport";
import authController from "../controllers/authController.js";
const {
  registerUser,
  loginUser,
  getUserProfile,
  adminLogin,
  forgotPassword,
  resetPassword,
} = authController;
import authMiddleware from "../middlewares/authMiddleware.js";
const { authenticateUser } = authMiddleware;

const router = Router();

// --- User Auth Routes ---
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authenticateUser, getUserProfile);

// --- Admin Login Route ---
router.post("/admin/login", adminLogin);

// Add this BEFORE the /google/callback route
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

// Single working callback route
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/authpage", // or wherever you want
  }),
  (req, res) => {
    const { user, token } = req.user;

    const userData = {
      name: user.name,
      email: user.email,
      id: user._id,
      role: user.role,
    };

    const redirectURL = `http://localhost:5173/google-success?user=${encodeURIComponent(
  JSON.stringify(userData)
)}&token=${token}`;

    res.redirect(redirectURL);
  }
);

// --- Forgot & Reset Password Routes ---
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
