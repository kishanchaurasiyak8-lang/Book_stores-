import { test, before, after, describe } from "node:test";
import assert from "node:assert/strict";
import app from "../src/app.js";
import { initializeDatabase, run, get } from "../src/db/index.js";
import { seedDatabase } from "../src/db/seed.js";

let server;
let baseUrl;

before(async () => {
  // Ensure database initialized & seeded
  await initializeDatabase();
  const bookCount = await get("SELECT COUNT(*) as count FROM books");
  if (!bookCount || bookCount.count === 0) {
    await seedDatabase();
  }

  // Start server on an ephemeral random port
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

describe("1. Health Check", () => {
  test("GET /health returns 200 with database connected", async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, "ok");
    assert.equal(body.database, "connected");
    assert.ok(typeof body.uptime === "number");
  });

  test("GET /api/health also responds with health status", async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, "ok");
  });
});

describe("2. Books API", () => {
  test("GET /api/books returns paginated book collection", async () => {
    const res = await fetch(`${baseUrl}/api/books`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.total >= 20, `Expected at least 20 books, got ${body.total}`);
    assert.ok(Array.isArray(body.books));
    assert.ok(body.books.length > 0);

    const first = body.books[0];
    assert.ok(first.id);
    assert.ok(first.title);
    assert.ok(first.author);
    assert.ok(typeof first.price === "number");
    assert.ok(first.cover_image_url);
    assert.ok(first.category);
  });

  test("GET /api/books with search query param", async () => {
    const res = await fetch(`${baseUrl}/api/books?search=hobbit`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.books.length >= 1);
    assert.match(body.books[0].title, /hobbit/i);
  });

  test("GET /api/books with category filter", async () => {
    const res = await fetch(`${baseUrl}/api/books?category=Comics`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    for (const book of body.books) {
      assert.equal(book.category, "Comics");
    }
  });

  test("GET /api/books with sorting (price-asc)", async () => {
    const res = await fetch(`${baseUrl}/api/books?sort=price-asc&limit=10`);
    assert.equal(res.status, 200);
    const body = await res.json();
    for (let i = 1; i < body.books.length; i++) {
      assert.ok(body.books[i].price >= body.books[i - 1].price);
    }
  });

  test("GET /api/books pagination (page and limit)", async () => {
    const res = await fetch(`${baseUrl}/api/books?page=1&limit=5`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.limit, 5);
    assert.equal(body.books.length, 5);
    assert.ok(body.totalPages >= 5);
  });

  test("GET /api/books/:id returns detailed book info with reviews", async () => {
    const res = await fetch(`${baseUrl}/api/books/the-hobbit`);
    assert.equal(res.status, 200);
    const book = await res.json();
    assert.equal(book.id, "the-hobbit");
    assert.equal(book.title, "The Hobbit");
    assert.ok(Array.isArray(book.reviews));
    assert.ok(book.reviews.length > 0);
    assert.ok(book.cover);
    assert.ok(book.cover.from);
  });

  test("GET /api/books/:id returns 404 for nonexistent book", async () => {
    const res = await fetch(`${baseUrl}/api/books/non-existent-book-slug-9999`);
    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.success, false);
  });

  test("GET /api/books/featured returns featured book", async () => {
    const res = await fetch(`${baseUrl}/api/books/featured`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.id);
    assert.ok(body.title);
  });

  test("GET /api/books/categories returns category breakdown", async () => {
    const res = await fetch(`${baseUrl}/api/books/categories`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length >= 4);
    assert.ok(body.data.some((c) => c.name === "School Textbooks"));
    assert.ok(body.data.some((c) => c.name === "Comics"));
  });
});

describe("3. Authentication API", () => {
  const testUser = {
    name: "Alice Tester",
    email: `alice_${Date.now()}@example.com`,
    password: "Password123!",
  };

  test("POST /api/auth/register creates user and returns JWT token", async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testUser),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.token);
    assert.equal(body.user.email, testUser.email.toLowerCase());
    assert.equal(body.user.role, "customer");
  });

  test("POST /api/auth/register rejects duplicate email with 409", async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testUser),
    });
    assert.equal(res.status, 409);
    const body = await res.json();
    assert.equal(body.success, false);
  });

  test("POST /api/auth/register rejects invalid email or short password with 400", async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Bob", email: "not-an-email", password: "123" }),
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.ok(Array.isArray(body.errors));
  });

  test("POST /api/auth/login successfully logs in user", async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testUser.email, password: testUser.password }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.token);
    assert.equal(body.user.email, testUser.email.toLowerCase());
  });

  test("POST /api/auth/login rejects invalid password with 401", async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testUser.email, password: "WrongPassword" }),
    });
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
  });

  test("GET /api/auth/me returns authenticated profile", async () => {
    // 1. Login to get token
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testUser.email, password: testUser.password }),
    });
    const { token } = await loginRes.json();

    // 2. Fetch /me
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(meRes.status, 200);
    const meBody = await meRes.json();
    assert.equal(meBody.success, true);
    assert.equal(meBody.user.email, testUser.email.toLowerCase());
  });

  test("GET /api/auth/me rejects unauthorized request with 401", async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`);
    assert.equal(res.status, 401);
  });
});

describe("4. Orders & Stock Management API", () => {
  const sampleOrder = {
    items: [
      { bookId: "the-hobbit", quantity: 2, price: 14.50 },
      { bookId: "class-10-complete-mathematics", quantity: 1, price: 13.99 },
    ],
    shipping: {
      fullName: "Jane Reader",
      email: "jane@reader.com",
      address: "123 Storybook Lane",
      city: "Portland",
      postalCode: "97201",
      country: "United States",
    },
    paymentMethod: "stripe",
    promoCode: "WELCOME10",
    currency: "USD",
  };

  test("POST /api/orders creates order, validates stock & returns confirmation", async () => {
    // Check initial stock
    const bookBefore = await get("SELECT stock FROM books WHERE id = 'the-hobbit'");
    const initialStock = bookBefore.stock;

    const res = await fetch(`${baseUrl}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sampleOrder),
    });

    assert.equal(res.status, 201);
    const order = await res.json();
    assert.equal(order.success, true);
    assert.ok(order.id.startsWith("PC-"));
    assert.equal(order.status, "confirmed");
    assert.equal(order.items.length, 2);
    assert.ok(order.total > 0);

    // Verify stock was deducted
    const bookAfter = await get("SELECT stock FROM books WHERE id = 'the-hobbit'");
    assert.equal(bookAfter.stock, initialStock - 2);
  });

  test("POST /api/orders rejects order if requested quantity exceeds stock", async () => {
    const excessiveOrder = {
      ...sampleOrder,
      items: [{ bookId: "the-hobbit", quantity: 99999, price: 14.50 }],
    };

    const res = await fetch(`${baseUrl}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(excessiveOrder),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.message, /insufficient stock/i);
  });

  test("POST /api/orders rejects order missing shipping address", async () => {
    const invalidOrder = {
      items: [{ bookId: "the-hobbit", quantity: 1 }],
      paymentMethod: "stripe",
    };

    const res = await fetch(`${baseUrl}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidOrder),
    });

    assert.equal(res.status, 400);
  });
});

describe("5. Checkout & Payment Intent API", () => {
  test("POST /api/checkout/create-payment-intent creates mock payment session", async () => {
    const res = await fetch(`${baseUrl}/api/checkout/create-payment-intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: 45.5,
        currency: "usd",
        metadata: { customerName: "Jane Reader" },
      }),
    });

    assert.equal(res.status, 200);
    const intent = await res.json();
    assert.equal(intent.success, true);
    assert.ok(intent.clientSecret);
    assert.ok(intent.paymentIntentId);
    assert.equal(intent.amount, 45.5);
    assert.equal(intent.currency, "usd");
    assert.equal(intent.status, "requires_payment_method");
  });

  test("POST /api/checkout/create-payment-intent calculates amount from items if omitted", async () => {
    const res = await fetch(`${baseUrl}/api/checkout/create-payment-intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ bookId: "the-hobbit", quantity: 1 }],
        currency: "usd",
      }),
    });

    assert.equal(res.status, 200);
    const intent = await res.json();
    assert.equal(intent.success, true);
    assert.equal(intent.amount, 14.50);
  });
});

