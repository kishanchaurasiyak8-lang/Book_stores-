import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config/env.js";
import apiRouter from "./routes/index.js";
import authRoutes from "./routes/auth.js";
import bookRoutes from "./routes/books.js";
import orderRoutes from "./routes/orders.js";
import checkoutRoutes from "./routes/checkout.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { get } from "./db/index.js";

import { renderExplorerHtml } from "./views/explorer.js";

const app = express();

// 1. Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        scriptSrcAttr: ["'unsafe-inline'"],
        styleSrc: ["'self'", "https:", "'unsafe-inline'"],
        fontSrc: ["'self'", "https:", "data:"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'"],
        upgradeInsecureRequests: null,
      },
    },
  })
);

// 2. CORS Configuration
const allowedOrigins = config.corsOrigin === "*"
  ? "*"
  : config.corsOrigin.split(",").map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, tests)
      if (!origin || allowedOrigins === "*" || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Allow any localhost origin in non-production
      if (!config.isProduction && /^http:\/\/localhost(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      callback(new Error(`Origin "${origin}" not allowed by CORS`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Format"],
  })
);

// 3. Request Logging
if (process.env.NODE_ENV !== "test") {
  app.use(morgan(config.isProduction ? "combined" : "dev"));
}

// 4. Body Parsers
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// 5. Root Info & Explorer Endpoint
app.get("/favicon.ico", (req, res) => res.status(204).end());

app.get("/", (req, res) => {
  // If request is from browser expecting HTML, serve interactive visual explorer
  if (req.accepts("html") && !req.headers["x-requested-with"] && !req.query.format) {
    return res.type("html").send(renderExplorerHtml());
  }

  res.json({
    name: "PageCrafter Bookstore REST API",
    version: "1.0.0",
    status: "online",
    endpoints: {
      health: "/health",
      books: "/api/books",
      bookById: "/api/books/:id",
      featuredBook: "/api/books/featured",
      categories: "/api/books/categories",
      orders: "/api/orders",
      authRegister: "/api/auth/register",
      authLogin: "/api/auth/login",
      authMe: "/api/auth/me",
      createPaymentIntent: "/api/checkout/create-payment-intent",
    },
  });
});

// 6. Direct /health endpoint (matches GET /health requirement)
app.get("/health", async (req, res) => {
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

// 7. Mount Primary API Router under /api
app.use("/api", apiRouter);

// 8. Direct root aliases for frontend flexibility
app.use("/books", bookRoutes);
app.use("/orders", orderRoutes);
app.use("/checkout", checkoutRoutes);
app.use("/auth", authRoutes);

// 9. 404 Handler
app.use(notFound);

// 10. Centralized Error Handler
app.use(errorHandler);

export default app;
