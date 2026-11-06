import bcrypt from "bcryptjs";
import { initializeDatabase, run, get, exec, transaction } from "./index.js";
import { SEED_BOOKS } from "./seedData.js";

export async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  // Ensure tables and schema exist
  await initializeDatabase();

  await transaction(async () => {
    // 1. Seed Users
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash("Admin@123456", salt);
    const customerPasswordHash = await bcrypt.hash("Customer@123456", salt);

    // Admin user
    const existingAdmin = await get("SELECT id FROM users WHERE email = ?", ["admin@pagecrafter.com"]);
    let adminId = existingAdmin?.id;
    if (!existingAdmin) {
      const res = await run(
        `INSERT INTO users (name, email, password_hash, role, created_at)
         VALUES (?, ?, ?, ?, datetime('now'))`,
        ["PageCrafter Admin", "admin@pagecrafter.com", adminPasswordHash, "admin"]
      );
      adminId = res.lastInsertRowid;
    }

    // Customer user
    const existingCustomer = await get("SELECT id FROM users WHERE email = ?", ["customer@pagecrafter.com"]);
    let customerId = existingCustomer?.id;
    if (!existingCustomer) {
      const res = await run(
        `INSERT INTO users (name, email, password_hash, role, created_at)
         VALUES (?, ?, ?, ?, datetime('now'))`,
        ["Jane Doe", "customer@pagecrafter.com", customerPasswordHash, "customer"]
      );
      customerId = res.lastInsertRowid;
    }

    console.log(`✅ Users seeded: admin (${adminId || "existing"}), customer (${customerId || "existing"})`);

    // 2. Clear old books to ensure clean catalog matching current seed specifications
    await run("DELETE FROM order_items;");
    await run("DELETE FROM reviews;");
    await run("DELETE FROM books;");

    // 3. Seed Books and Reviews
    let booksCount = 0;
    let reviewsCount = 0;

    for (const b of SEED_BOOKS) {
      // Upsert book
      await run(
        `INSERT INTO books (
          id, title, author, description, synopsis, price, stock, isbn, category, grade_level,
          cover_image_url, format, rating, rating_count, popularity, pages,
          language, publisher, published_at, author_bio, sample, cover_from, cover_to, cover_ink, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          author = excluded.author,
          description = excluded.description,
          synopsis = excluded.synopsis,
          price = excluded.price,
          stock = excluded.stock,
          isbn = excluded.isbn,
          category = excluded.category,
          grade_level = excluded.grade_level,
          cover_image_url = excluded.cover_image_url,
          format = excluded.format,
          rating = excluded.rating,
          rating_count = excluded.rating_count,
          popularity = excluded.popularity,
          pages = excluded.pages,
          language = excluded.language,
          publisher = excluded.publisher,
          published_at = excluded.published_at,
          author_bio = excluded.author_bio,
          sample = excluded.sample,
          cover_from = excluded.cover_from,
          cover_to = excluded.cover_to,
          cover_ink = excluded.cover_ink`,
        [
          b.id,
          b.title,
          b.author,
          b.description || "",
          b.synopsis || b.description || "",
          Number(b.price || 0),
          Number(b.stock || 0),
          b.isbn || "",
          b.category,
          b.grade_level || "General",
          b.cover_image_url || "",
          (b.format || "paperback").toLowerCase(),
          Number(b.rating || 4.5),
          Number(b.rating_count || 0),
          Number(b.popularity || 80),
          Number(b.pages || 0),
          b.language || "English",
          b.publisher || "NCERT",
          b.published_at || "2024-03-01",
          b.author_bio || "",
          b.sample || "",
          b.cover_from || null,
          b.cover_to || null,
          b.cover_ink || null,
        ]
      );
      booksCount++;

      // Seed reviews for this book
      if (b.reviews && b.reviews.length > 0) {
        for (const rev of b.reviews) {
          const existingReview = await get(
            "SELECT id FROM reviews WHERE book_id = ? AND name = ?",
            [b.id, rev.name]
          );
          if (!existingReview) {
            await run(
              `INSERT INTO reviews (book_id, user_id, name, rating, text, created_at)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [b.id, customerId || null, rev.name, rev.rating, rev.text, rev.date || new Date().toISOString()]
            );
            reviewsCount++;
          }
        }
      }
    }

    console.log(`✅ Seeded ${booksCount} books across diverse categories.`);
    console.log(`✅ Seeded ${reviewsCount} book reviews.`);

    // 3. Seed an initial demo order if none exist
    const orderCount = await get("SELECT COUNT(*) as count FROM orders");
    if (orderCount && orderCount.count === 0) {
      const demoOrderId = "PC-DEMO-9912";
      const demoItems = [
        {
          bookId: "the-hobbit",
          title: "The Hobbit",
          quantity: 1,
          price: 14.50,
        },
        {
          bookId: "class-10-complete-mathematics",
          title: "Class 10: Complete Mathematics",
          quantity: 1,
          price: 13.99,
        },
      ];
      const demoShipping = {
        fullName: "Jane Doe",
        email: "customer@pagecrafter.com",
        address: "742 Evergreen Terrace",
        city: "Springfield",
        postalCode: "97477",
        country: "United States",
      };

      await run(
        `INSERT INTO orders (
          id, user_id, items, total_amount, currency, shipping_address,
          payment_status, payment_method, order_status, promo_code, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [
          demoOrderId,
          customerId || 1,
          JSON.stringify(demoItems),
          36.98,
          "USD",
          JSON.stringify(demoShipping),
          "paid",
          "stripe",
          "confirmed",
          "WELCOME10",
        ]
      );

      for (const item of demoItems) {
        await run(
          `INSERT INTO order_items (order_id, book_id, quantity, price, title)
           VALUES (?, ?, ?, ?, ?)`,
          [demoOrderId, item.bookId, item.quantity, item.price, item.title]
        );
      }
      console.log(`✅ Demo order ${demoOrderId} created.`);
    }
  });

  console.log("🎉 Database seeding completed successfully!");
}

// Allow direct execution via `node seed.js` or `npm run seed`
if (process.argv[1]?.endsWith("seed.js")) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Seeding failed:", err);
      process.exit(1);
    });
}

