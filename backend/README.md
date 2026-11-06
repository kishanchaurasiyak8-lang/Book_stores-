# PageCrafter Bookstore — Production-Ready REST API Backend

Production-ready REST API backend for the **PageCrafter** online bookstore web application, engineered with **Node.js, Express 5, and SQLite** (with seamless PostgreSQL support).

---

## 🌟 Highlights & Features

- **Robust Database Layer**: Built on Node 24 native high-performance SQLite (`node:sqlite`) with zero external native compilation dependencies. Also supports PostgreSQL via `DATABASE_URL=postgresql://...`.
- **Strict Input Validation**: All incoming requests (auth, orders, query parameters, reviews) are validated using **Zod** schemas with descriptive error reporting.
- **Stock & Inventory Protection**: Atomically validates stock availability and decrements inventory inside transactional database execution to prevent race conditions and overselling.
- **JWT Authentication & RBAC**: Secure registration and login with `bcryptjs` password hashing and role-based access control (`customer` and `admin`).
- **Flexible Search & Filtering**: Multi-field full-text search (`search`, `q`), category filtering, price range, stock status, star ratings, and multiple sort modes (`popularity`, `price-asc`, `price-desc`, `newest`, `rating`, `title`).
- **Payments Ready**: `POST /api/checkout/create-payment-intent` supports both mock checkout sessions for development/testing and real Stripe PaymentIntents via `STRIPE_SECRET_KEY`.
- **CORS & Security**: Configured for cross-origin frontend communication with configurable allowed origins, `helmet` security headers, and safe error masking in production.
- **Pre-seeded with 25+ Realistic Books**: Covers diverse genres (Fiction, Non-Fiction, Tech, Academic, Classics, Love Stories, Computer Science, AI/ML, Grade school, Comics) with working Unsplash cover URLs and customer reviews.
- **Automated Test Suite**: 23 automated integration tests covering 100% of the API surface.

---

## 🏗️ Project Structure

```text
backend/
├── .env                              # Active environment variables
├── .env.example                      # Template environment variables
├── package.json                      # Project dependencies & scripts
├── README.md                         # Detailed documentation
├── seed.js                           # Direct seed entry point
├── src/
│   ├── app.js                       # Express app configuration & middleware pipeline
│   ├── server.js                    # Server entry, auto-migration & startup
│   ├── config/
│   │   └── env.js                   # Environment config & validation
│   ├── db/
│   │   ├── index.js                 # Database abstraction (SQLite & PostgreSQL)
│   │   ├── schema.sql               # Database schema & indexes DDL
│   │   ├── seed.js                  # Database seed runner
│   │   └── seedData.js              # 25+ realistic books, reviews & sample data
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification & RBAC middleware
│   │   ├── errorHandler.js          # Centralized error handler
│   │   ├── notFound.js              # 404 response handler
│   │   └── validate.js              # Zod validation middleware (body, query)
│   ├── routes/
│   │   ├── auth.js                  # /api/auth (register, login, me)
│   │   ├── books.js                 # /api/books (search, filter, pagination, reviews)
│   │   ├── checkout.js              # /api/checkout (payment intents)
│   │   ├── index.js                 # API route aggregator & /health
│   │   └── orders.js                # /api/orders (stock validation & checkout)
│   ├── schemas/
│   │   ├── auth.schema.js           # Zod schemas for auth
│   │   ├── book.schema.js           # Zod schemas for book queries & reviews
│   │   └── order.schema.js          # Zod schemas for order creation
│   └── services/
│       ├── authService.js           # Auth business logic & token generation
│       ├── bookService.js           # Book discovery, pagination & reviews
│       ├── orderService.js          # Transactional order processing & stock logic
│       └── paymentService.js        # Stripe & mock payment intent creation
└── test/
    └── api.test.js                  # 23 automated integration tests
```

---

## 🗄️ Database Schema & Models

### 1. `users`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique user identifier |
| `name` | TEXT | NOT NULL | User's full name |
| `email` | TEXT | UNIQUE, NOT NULL | User email address |
| `password_hash`| TEXT | NOT NULL | Bcrypt hashed password |
| `role` | TEXT | DEFAULT 'customer' | `'customer'` or `'admin'` |
| `created_at` | TEXT | NOT NULL | ISO 8601 creation timestamp |

### 2. `books`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | URL-safe slug or ID (e.g. `the-quiet-orchard`) |
| `title` | TEXT | NOT NULL | Book title |
| `author` | TEXT | NOT NULL | Author name |
| `description` | TEXT | | Full book synopsis / description |
| `price` | REAL | NOT NULL, >= 0 | Price in USD |
| `stock` | INTEGER | NOT NULL, >= 0 | Available inventory |
| `isbn` | TEXT | | ISBN-10 / ISBN-13 |
| `category` | TEXT | NOT NULL | Genre / Category |
| `cover_image_url`| TEXT | | Direct image URL |
| `format` | TEXT | DEFAULT 'paperback' | `hardcover`, `paperback`, or `ebook` |
| `rating` | REAL | DEFAULT 0 (0-5) | Average user rating |
| `rating_count` | INTEGER | DEFAULT 0 | Total number of reviews |
| `popularity` | INTEGER | DEFAULT 0 | Popularity index (0-100) |
| `pages` | INTEGER | DEFAULT 0 | Page count |
| `language` | TEXT | DEFAULT 'English' | Language of publication |
| `publisher` | TEXT | | Publishing house |
| `published_at` | TEXT | | Publication date |
| `sample` | TEXT | | Excerpt / first chapter sample |
| `created_at` | TEXT | NOT NULL | Record creation timestamp |

### 3. `reviews`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Review ID |
| `book_id` | TEXT | FOREIGN KEY -> `books(id)` | Cascading delete on book removal |
| `user_id` | INTEGER | FOREIGN KEY -> `users(id)` | Optional linked user ID |
| `name` | TEXT | NOT NULL | Reviewer display name |
| `rating` | REAL | CHECK (1 <= rating <= 5) | Star rating |
| `text` | TEXT | NOT NULL | Review text content |
| `created_at` | TEXT | NOT NULL | Timestamp |

### 4. `orders`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | Order ID (e.g. `PC-E84C1B92`) |
| `user_id` | INTEGER | FOREIGN KEY -> `users(id)` | Optional for registered users |
| `items` | TEXT | NOT NULL (JSON) | Array of purchased items snapshot |
| `total_amount` | REAL | NOT NULL, >= 0 | Final order total |
| `currency` | TEXT | DEFAULT 'USD' | Currency code |
| `shipping_address`| TEXT | NOT NULL (JSON) | Recipient, address, city, zip, country |
| `payment_status` | TEXT | DEFAULT 'pending' | `'pending'`, `'paid'`, `'failed'` |
| `payment_method` | TEXT | DEFAULT 'stripe' | `'stripe'`, `'cod'`, `'card'` |
| `order_status` | TEXT | DEFAULT 'confirmed' | `'pending'`, `'confirmed'`, `'shipped'`, etc. |
| `promo_code` | TEXT | | Applied promotional code |
| `created_at` | TEXT | NOT NULL | Order timestamp |

### 5. `order_items`
Relational table storing individual line items for analytics, inventory reporting, and relational joins.

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 20.0.0 (Node 24 recommended)
- npm >= 10.0.0

### Installation & Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

4. **Seed Database**:
   Seeds the database with 25 books across 10+ genres, customer reviews, and demo admin/customer accounts:
   ```bash
   npm run seed
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Or production start:
   ```bash
   npm start
   ```

   The server will run on `http://localhost:5000`.

---

## 🧪 Demo User Accounts

The seed script creates the following pre-configured accounts:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@pagecrafter.com` | `Admin@123456` |
| **Customer** | `customer@pagecrafter.com` | `Customer@123456` |

---

## 📡 API Endpoints Reference

### 1. System Health Check
#### `GET /health`
Returns system status, uptime, and database connectivity.

**Response (200 OK):**
```json
{
  "status": "ok",
  "uptime": 124,
  "timestamp": "2026-11-06T09:00:00.000Z",
  "database": "connected",
  "version": "1.0.0"
}
```

---

### 2. Books API

#### `GET /api/books`
Retrieve books with comprehensive search, filtering, sorting, and pagination.

**Query Parameters:**
- `search` or `q` *(string)*: Case-insensitive search on title, author, description, or category.
- `category` *(string)*: Filter by genre (e.g. `Fiction`, `Non-Fiction`, `Tech`, `Academic`, `Classics`, `Love Stories`, `CSE`, `CSE AI/ML`, `Comics`, `Class 6` to `Class 10`).
- `sort` *(string)*: `popularity` (default), `price-asc`, `price-desc`, `newest`, `rating`, `title`.
- `page` *(number)*: Page number (default: `1`).
- `limit` *(number)*: Records per page (default: `12`, max: `100`).
- `minPrice` / `maxPrice` *(number)*: Price range filter.
- `minRating` *(number)*: Minimum rating filter (1-5).
- `inStock` *(boolean)*: Filter by stock availability (`true` or `false`).
- `format` *(string)*: Filter by format (`hardcover`, `paperback`, `ebook`).

**Example Request:**
```http
GET /api/books?search=orchard&sort=price-asc&page=1&limit=10
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 1,
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1,
  "data": [
    {
      "id": "the-hobbit",
      "title": "The Hobbit",
      "author": "J.R.R. Tolkien",
      "authorBio": "J.R.R. Tolkien was an English philologist, Oxford professor...",
      "description": "An adventurous tale across Middle-earth of Bilbo Baggins...",
      "price": 14.50,
      "stock": 65,
      "inStock": true,
      "isbn": "978-0-5479-2822-7",
      "category": "Story Books",
      "cover_image_url": "https://covers.openlibrary.org/b/isbn/9780547928227-M.jpg",
      "format": "Hardcover",
      "rating": 4.8,
      "ratingCount": 6500,
      "popularity": 98,
      "pages": 310,
      "language": "English",
      "publisher": "Houghton Mifflin Harcourt",
      "publishedAt": "2021-09-18",
      "cover": {
        "from": "oklch(0.35 0.06 155)",
        "to": "oklch(0.22 0.04 160)",
        "ink": "oklch(0.92 0.06 85)"
      }
    }
  ]
}
```

#### `GET /api/books/:id`
Retrieve detailed book information including customer reviews.

**Example Request:**
```http
GET /api/books/the-hobbit
```

**Response (200 OK):**
```json
{
  "success": true,
  "id": "the-hobbit",
  "title": "The Hobbit",
  "author": "J.R.R. Tolkien",
  "price": 14.50,
  "stock": 65,
  "inStock": true,
  "reviews": [
    {
      "id": 1,
      "name": "Priya S.",
      "rating": 5,
      "text": "Couldn't put it down. Beautifully written and paced with deep tenderness.",
      "date": "2026-10-02"
    }
  ]
}
```

#### `GET /api/books/featured`
Returns the curated "Book of the Week" featured banner book.

#### `GET /api/books/categories`
Returns a breakdown of all available categories and book counts.

#### `POST /api/books/:id/reviews`
Submit a customer review for a book.
**Request Body:**
```json
{
  "name": "Alex Mercer",
  "rating": 5,
  "text": "An astonishing read with breathtaking prose."
}
```

---

### 3. Authentication API

#### `POST /api/auth/register`
Register a new customer or admin user.

**Request Body:**
```json
{
  "name": "Jane Reader",
  "email": "jane@example.com",
  "password": "SecurePassword123!",
  "role": "customer"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 3,
    "name": "Jane Reader",
    "email": "jane@example.com",
    "role": "customer",
    "createdAt": "2026-11-06T09:15:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### `POST /api/auth/login`
Authenticate existing user and obtain JWT token.

**Request Body:**
```json
{
  "email": "customer@pagecrafter.com",
  "password": "Customer@123456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 2,
    "name": "Jane Doe",
    "email": "customer@pagecrafter.com",
    "role": "customer"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### `GET /api/auth/me`
Retrieve currently authenticated user profile.
**Header:** `Authorization: Bearer <token>`

---

### 4. Orders API

#### `POST /api/orders`
Place a new order with stock validation and inventory deduction in a database transaction.

**Request Body:**
```json
{
  "items": [
    { "bookId": "the-hobbit", "quantity": 1, "price": 14.50 },
    { "bookId": "class-10-complete-mathematics", "quantity: 2, "price": 13.99 }
  ],
  "shipping": {
    "fullName": "Jane Reader",
    "email": "jane@example.com",
    "address": "456 Market St, Apt 2B",
    "city": "San Francisco",
    "postalCode": "94105",
    "country": "United States"
  },
  "paymentMethod": "stripe",
  "promoCode": "WELCOME10",
  "currency": "USD"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Order placed successfully",
  "id": "PC-59B1F20A",
  "status": "confirmed",
  "paymentStatus": "paid",
  "subtotal": 46.97,
  "discount": 4.70,
  "total": 42.27,
  "currency": "USD",
  "items": [
    { "bookId": "the-hobbit", "title": "The Hobbit", "price": 14.50, "quantity": 1 },
    { "bookId": "class-10-complete-mathematics", "title": "Class 10: Complete Mathematics", "price": 13.99, "quantity": 2 }
  ],
  "createdAt": "2026-11-06T09:20:00.000Z"
}
```

**Error Handling (Insufficient Stock):**
If requested quantity exceeds available inventory:
```json
{
  "success": false,
  "message": "Insufficient stock for \"The Hobbit\". Available stock: 2, requested quantity: 10"
}
```

#### `GET /api/orders/:id`
Retrieve an order by its ID.

#### `GET /api/orders`
Retrieve customer order history (or all orders if authenticated as `admin`).

---

### 5. Checkout & Payments API

#### `POST /api/checkout/create-payment-intent`
Create a Stripe or mock payment session.

**Request Body:**
```json
{
  "amount": 42.27,
  "currency": "usd",
  "metadata": {
    "orderRef": "cart_checkout_session"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "clientSecret": "pi_mock_5a83c2e17bf9_secret_d9124e5f...",
  "paymentIntentId": "pi_mock_5a83c2e17bf9",
  "amount": 42.27,
  "currency": "usd",
  "status": "requires_payment_method",
  "mock": true
}
```

---

## 🔒 Security Best Practices Implemented

1. **Helmet HTTP Headers**: Configures Content-Security-Policy, anti-clickjacking, DNS prefetch control, and HSTS headers.
2. **Password Hashing**: Bcrypt with 10 salt rounds. Plaintext passwords are never stored or logged.
3. **CORS Whitelisting**: Strict origin validation with localhost development support.
4. **Input Sanitization**: Zod validation strips undeclared parameters and rejects invalid types.
5. **SQL Injection Prevention**: 100% prepared statements with parameterized inputs.
6. **Graceful Error Masking**: Database error details and stack traces are hidden from API consumers in production mode.

---

## 🧪 Running Automated Tests

Run the full suite of 23 automated integration tests:

```bash
npm test
```

All tests run via Node's native test runner (`node --test`) without external testing harnesses:
- Health check verification
- Book catalog filtering, search, pagination, and single view with reviews
- User registration, login, token verification, and error scenarios
- Transactional order creation and stock depletion checks
- Stripe / mock checkout intent creation

