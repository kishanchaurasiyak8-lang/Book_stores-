import { Router } from "express";
import authRoutes from "./auth.js";
import bookRoutes from "./books.js";
import orderRoutes from "./orders.js";
import checkoutRoutes from "./checkout.js";
import { get } from "../db/index.js";

const router = Router();

/**
 * Health check endpoint
 * @route GET /health
 */
router.get("/health", async (req, res) => {
  let dbStatus = "connected";
  try {
    await get("SELECT 1");
  } catch (err) {
    dbStatus = `error: ${err.message}`;
  }

  const isHealthy = dbStatus === "connected";
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "ok" : "degraded",
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    database: dbStatus,
    version: "1.0.0",
  });
});

// Mount modular sub-routers
router.use("/auth", authRoutes);
router.use("/books", bookRoutes);
router.use("/orders", orderRoutes);
router.use("/checkout", checkoutRoutes);

export default router;

