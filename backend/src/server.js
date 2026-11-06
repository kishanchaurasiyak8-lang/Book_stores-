import app from "./app.js";
import { config } from "./config/env.js";
import { initializeDatabase, get } from "./db/index.js";
import { seedDatabase } from "./db/seed.js";

async function startServer() {
  try {
    // 1. Initialize Database Schema
    await initializeDatabase();

    // 2. Auto-seed if database is brand new and has no books
    const bookCount = await get("SELECT COUNT(*) as count FROM books");
    if (!bookCount || bookCount.count === 0) {
      console.log("Database is empty. Running initial seeding...");
      await seedDatabase();
    }

    // 3. Start Express Server on 0.0.0.0
    const server = app.listen(config.port, "0.0.0.0", () => {
      console.log(`
======================================================
  📚 PageCrafter Bookstore REST API is running!
======================================================
  Mode:       ${config.nodeEnv}
  Port:       ${config.port}
  Local:      http://localhost:${config.port}
  IPv4 Loop:  http://127.0.0.1:${config.port}
  Health:     http://localhost:${config.port}/health
  Books API:  http://localhost:${config.port}/api/books
  Orders:     http://localhost:${config.port}/api/orders
======================================================
      `);
    });

    // 4. Graceful Shutdown
    const shutdown = (signal) => {
      console.log(`\nReceived ${signal}. Gracefully shutting down...`);
      server.close(() => {
        console.log("HTTP server closed.");
        process.exit(0);
      });

      // Force close after 10s if hanging
      setTimeout(() => {
        console.error("Could not close connections in time, forcefully shutting down");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (err) {
    console.error("Fatal error during server startup:", err);
    process.exit(1);
  }
}

startServer();

