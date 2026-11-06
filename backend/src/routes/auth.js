import { Router } from "express";
import { validateBody } from "../middleware/validate.js";
import { registerSchema, loginSchema } from "../schemas/auth.schema.js";
import { registerUser, loginUser, getUserById } from "../services/authService.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new customer or admin user
 * @access  Public
 */
router.post("/register", validateBody(registerSchema), async (req, res, next) => {
  try {
    const { user, token } = await registerUser(req.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
      token,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get JWT token
 * @access  Public
 */
router.post("/login", validateBody(loginSchema), async (req, res, next) => {
  try {
    const { user, token } = await loginUser(req.body);
    res.status(200).json({
      success: true,
      message: "Login successful",
      user,
      token,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user profile
 * @access  Private (JWT required)
 */
router.get("/me", authenticate, async (req, res, next) => {
  try {
    const user = await getUserById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
});

export default router;

