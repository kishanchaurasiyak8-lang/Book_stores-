# PageCrafter Books — Full-Stack Project Documentation

> **Production-grade Online Bookstore Platform**  
> High-performance e-commerce architecture featuring a modern React/TanStack frontend and a resilient Node.js / Express 5 REST API backend powered by SQLite / PostgreSQL.

---

## 📑 Table of Contents

1. [Executive Summary](#-executive-summary)
2. [System Architecture & Data Flow](#-system-architecture--data-flow)
3. [Repository & Directory Structure](#-repository--directory-structure)
4. [Database Architecture & Data Models](#-database-architecture--data-models)
5. [Complete REST API Specification](#-complete-rest-api-specification)
6. [Inventory & Transactional Stock Logic](#-inventory--transactional-stock-logic)
7. [Authentication & Security Architecture](#-authentication--security-architecture)
8. [Checkout & Payment Intent Engine](#-checkout--payment-intent-engine)
9. [Pre-Seeded Catalog & Demo Credentials](#-pre-seeded-catalog--demo-credentials)
10. [Environment Variables Reference](#-environment-variables-reference)
11. [Setup, Execution & Testing Guide](#-setup-execution--testing-guide)
12. [Verification & Test Results](#-verification--test-results)

---

## 📖 Executive Summary

**PageCrafter Books** is an online bookstore platform with an editorial aesthetic, responsive catalog browsing, robust cart and order processing, and a REST API backend.

- **Frontend**: Modern SPA built with React 19, TypeScript, TanStack Router, TanStack Query, Tailwind CSS, and Lucide icons.
- **Backend**: RESTful API service built with Node.js 24, Express 5, native SQLite (`node:sqlite`) with seamless PostgreSQL capability, Zod request validation, Bcrypt password hashing, and JWT authorization.
- **Data Integrity**: Acid-compliant database transactions ensuring atomic stock deductions and zero overselling.
- **Payments**: Mock and Stripe payment intent session generation for web checkout flows.

---

## 🏗️ System Architecture & Data Flow

```mermaid
flowchart TD
    subgraph Client["Frontend Application (React + Vite)"]
        UI["UI Components & Pages\n(Home, Book Details, Checkout, Cart Drawer)"]
        State["Client State\n(Zustand Cart & TanStack Query)"]
        ClientAPI["API Client\n(apiFetch via VITE_BACKEND_URL)"]
        UI --> State
        State --> ClientAPI
    end

    subgraph Gateway["Express 5 REST API Gateway (:5000)"]
        CORS["CORS & Helmet Security Middleware"]
        Router["API Router (/api & direct aliases)"]
        Val["Zod Schema Validator Middleware"]
        AuthMid["JWT Auth & RBAC Middleware"]
        
        ClientAPI --> CORS
        CORS --> Router
        Router --> Val
        Val --> AuthMid
    end

    subgraph Services["Core Application Services"]
        BookSvc["BookService\n(Search, Filters, Pagination)"]
        OrderSvc["OrderService\n(Transactional Stock & Order Placement)"]
        AuthSvc["AuthService\n(Bcrypt Hash, Token Signing)"]
        PaySvc["PaymentService\n(Stripe / Mock Intent Engine)"]

        AuthMid --> BookSvc
        AuthMid --> OrderSvc
        AuthMid --> AuthSvc
        AuthMid --> PaySvc
    end

    subgraph DataLayer["Persistence Layer"]
        DB["SQLite (node:sqlite) / PostgreSQL (pg)\nbookstore.db"]
        BookSvc --> DB
        OrderSvc --> DB
        AuthSvc --> DB
    end
```

---

## 📂 Repository & Directory Structure

```text
pagecrafter-books-main/
├── PROJECT.md                                # Master project documentation
├── package.json                              # Unified workspace run scripts
│
├── backend/                                  # Express 5 REST API Backend
│   ├── .env                                  # Active environment variables
│   ├── .env.example                          # Environment template
│   ├── package.json                          # Dependencies: Express, Zod, JWT, Bcrypt, Helmet, CORS
│   ├── README.md                             # Backend-specific guide & API docs
│   ├── seed.js                               # CLI runner for database seeding
│   ├── src/
│   │   ├── app.js                           # Express application setup & middleware stack
│   │   ├── server.js                        # Server entry point, auto-seeding & shutdown
│   │   ├── config/
│   │   │   └── env.js                       # Environment validation & defaults
│   │   ├── db/
│   │   │   ├── index.js                     # Unified database client (SQLite / PostgreSQL)
│   │   │   ├── schema.sql                   # SQL schema definition & indexes
│   │   │   ├── seed.js                      # Idempotent seed script
│   │   │   └── seedData.js                  # 25 curated books across 10+ genres with reviews
│   │   ├── middleware/
│   │   │   ├── auth.js                      # JWT verification & role validation
│   │   │   ├── errorHandler.js              # Centralized JSON error handling
│   │   │   ├── notFound.js                  # 404 handler
│   │   │   └── validate.js                  # Zod request body & query validation
│   │   ├── routes/
│   │   │   ├── index.js                     # API router aggregation & GET /health
│   │   │   ├── auth.js                      # /api/auth routes
│   │   │   ├── books.js                     # /api/books routes
│   │   │   ├── checkout.js                  # /api/checkout routes
│   │   │   └── orders.js                    # /api/orders routes
│   │   ├── schemas/
│   │   │   ├── auth.schema.js               # Zod auth validation schemas
│   │   │   ├── book.schema.js               # Zod book filter & review schemas
│   │   │   └── order.schema.js              # Zod order creation & checkout schemas
│   │   └── services/
│   │       ├── authService.js               # User registration, login & JWT generation
│   │       ├── bookService.js               # Book discovery, search & review operations
│   │       ├── orderService.js              # Atomic order creation & inventory reservation
│   │       └── paymentService.js            # Stripe / Mock payment intent generator
│   └── test/
│       └── api.test.js                      # 23 automated integration tests (native test runner)
│
└── pagecrafter-books-main/                   # React Frontend Application
    ├── .env                                  # VITE_BACKEND_URL=http://localhost:5000
    ├── .env.example                          # Frontend environment template
    ├── package.json                          # React, Vite, TanStack Router/Query, Tailwind
    ├── src/
    │   ├── api/
    │   │   ├── client.ts                    # REST fetch client with backend detection
    │   │   ├── books.ts                     # Book API service with mock fallback
    │   │   └── orders.ts                    # Order API service with mock fallback
    │   ├── components/
    │   │   ├── store/                       # BookCard, BookCover, CartDrawer, Header, Stars
    │   │   └── ui/                          # Radix UI primitives & styled components
    │   ├── routes/
    │   │   ├── index.tsx                    # Books showcase, filters, search & book of week
    │   │   ├── books.$id.tsx                # Book detail modal/page with reviews & excerpts
    │   │   └── checkout.tsx                 # 3-step checkout with address & payment selector
    │   └── store/
    │       └── cart.ts                      # Zustand/Context cart state & price currency calculations
```

---

## 🗄️ Database Architecture & Data Models

### Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS ||--o{ ORDERS : places
    USERS ||--o{ REVIEWS : writes
    BOOKS ||--o{ REVIEWS : has
    ORDERS ||--|{ ORDER_ITEMS : contains
    BOOKS ||--o{ ORDER_ITEMS : references

    USERS {
        int id PK
        string name
        string email UK
        string password_hash
        string role "customer | admin"
        string created_at
    }

    BOOKS {
        string id PK "slug identifier"
        string title
        string author
        string description
        string synopsis
        float price
        int stock
        string isbn
        string category
        string cover_image_url
        string format "hardcover | paperback | ebook"
        float rating
        int rating_count
        int popularity
        int pages
        string language
        string publisher
        string published_at
        string sample
        string cover_from
        string cover_to
        string cover_ink
        string created_at
    }

    REVIEWS {
        int id PK
        string book_id FK
        int user_id FK "nullable"
        string name
        float rating "1 to 5"
        string text
        string created_at
    }

    ORDERS {
        string id PK "e.g. PC-E84C1B92"
        int user_id FK "nullable"
        string items "JSON snapshot"
        float total_amount
        string currency
        string shipping_address "JSON"
        string payment_status "pending | paid | failed"
        string payment_method "stripe | cod | card"
        string order_status "pending | confirmed | shipped"
        string promo_code
        string created_at
    }

    ORDER_ITEMS {
        int id PK
        string order_id FK
        string book_id FK
        int quantity
        float price
        string title
    }
```

### Table Definitions

| Table | Purpose | Primary Key | Foreign Keys / Indexes |
|---|---|---|---|
| `users` | Customer & Admin user profiles | `id` (INTEGER) | Unique index on `email` |
| `books` | Book catalog records | `id` (TEXT slug) | Indexes on `category`, `author`, `price`, `rating`, `popularity` |
| `reviews` | Customer feedback & ratings | `id` (INTEGER) | Foreign key to `books(id)` (CASCADE), index on `book_id` |
| `orders` | Placed customer orders | `id` (TEXT) | Foreign key to `users(id)`, index on `user_id`, `created_at` |
| `order_items` | Relational order line-items | `id` (INTEGER) | Foreign key to `orders(id)` (CASCADE), index on `order_id` |

---

## 📡 Complete REST API Specification

All endpoints are hosted at `http://localhost:5000` (prefixed with `/api`, with root-level aliases `/books`, `/orders` enabled for maximum frontend flexibility).

### 1. System Health Check
#### `GET /health`
Returns system status, current server uptime, and database connectivity.

- **Auth**: None
- **Response `200 OK`**:
```json
{
  "status": "ok",
  "uptime": 182,
  "timestamp": "2026-11-06T15:45:00.000Z",
  "database": "connected",
  "version": "1.0.0"
}
```

---

### 2. Books API

#### `GET /api/books`
Lists all books with multi-criteria search, category filtering, sorting, price bounding, and pagination.

- **Query Parameters**:
  - `search` / `q` *(string)*: Case-insensitive search on title, author, description, or category.
  - `category` *(string)*: Filter by genre (e.g. `Fiction`, `Tech`, `Classics`, `Academic`, `CSE`).
  - `sort` *(string)*: `popularity` (default), `price-asc`, `price-desc`, `newest`, `rating`, `title`.
  - `page` *(number)*: Page index (default: `1`).
  - `limit` *(number)*: Books per page (default: `12`, max: `100`).
  - `minPrice` / `maxPrice` *(number)*: Price range filter.
  - `minRating` *(number)*: Minimum rating filter (1 to 5).
  - `inStock` *(boolean)*: `true` for available books, `false` for out of stock.
  - `format` *(string)*: Filter by format (`hardcover`, `paperback`, `ebook`).
  - `raw` *(boolean)*: Return a plain JSON array instead of paginated metadata.

- **Response Headers**:
  - `X-Total-Count`: Total number of matching books
  - `X-Page`: Current page
  - `X-Limit`: Items per page
  - `X-Total-Pages`: Total number of pages

- **Response `200 OK`**:
```json
{
  "success": true,
  "count": 1,
  "total": 1,
  "page": 1,
  "limit": 12,
  "totalPages": 1,
  "data": [
    {
      "id": "the-hobbit",
      "title": "The Hobbit",
      "author": "J.R.R. Tolkien",
      "authorBio": "J.R.R. Tolkien was an English philologist, Oxford professor...",
      "description": "An adventurous tale across Middle-earth of Bilbo Baggins...",
      "synopsis": "An adventurous tale across Middle-earth of Bilbo Baggins...",
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
      "publisher": "Hollow Press",
      "publishedAt": "2026-09-12",
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
Retrieves single book by slug or ID with all associated customer reviews.

- **Response `200 OK`**: Detailed book entity containing nested `reviews: [...]`.
- **Response `404 Not Found`**:
```json
{
  "success": false,
  "message": "Book with ID \"unknown-book\" not found"
}
```

#### `GET /api/books/featured`
Returns the curated "Book of the Week" featured banner entity.

#### `GET /api/books/categories`
Returns distinct categories with book count metrics.

#### `POST /api/books/:id/reviews`
Submits a customer rating and review.
- **Request Body**:
```json
{
  "name": "Jane Reader",
  "rating": 5,
  "text": "Stunning prose and brilliant pacing."
}
```

---

### 3. Authentication API

#### `POST /api/auth/register`
Creates a customer or administrator account.

- **Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePassword123!",
  "role": "customer"
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 3,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "customer",
    "createdAt": "2026-11-06T15:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
- **Response `409 Conflict`**: Returned if email already exists.
- **Response `400 Bad Request`**: Returned if input validation fails (e.g. password < 6 chars).

#### `POST /api/auth/login`
Authenticates credentials and returns a signed JWT.

- **Request Body**:
```json
{
  "email": "customer@pagecrafter.com",
  "password": "Customer@123456"
}
```
- **Response `200 OK`**: Contains user info and bearer `token`.
- **Response `401 Unauthorized`**: If password or email is incorrect.

#### `GET /api/auth/me`
Retrieves the logged-in user's profile.
- **Headers**: `Authorization: Bearer <token>`

---

### 4. Orders API

#### `POST /api/orders`
Creates an order with atomic stock validation and deduction.

- **Auth**: Optional (Supports both guest checkout and logged-in customers).
- **Request Body**:
```json
{
  "items": [
    { "bookId": "the-hobbit", "quantity": 1, "price": 14.50 },
    { "bookId": "class-10-complete-mathematics", "quantity": 2, "price": 13.99 }
  ],
  "shipping": {
    "fullName": "Jane Reader",
    "email": "jane@example.com",
    "address": "742 Evergreen Terrace",
    "city": "Springfield",
    "postalCode": "97477",
    "country": "United States"
  },
  "paymentMethod": "stripe",
  "promoCode": "WELCOME10",
  "currency": "USD"
}
```

- **Response `201 Created`**:
```json
{
  "success": true,
  "message": "Order placed successfully",
  "id": "PC-7E3B1A94",
  "userId": 2,
  "items": [
    { "bookId": "the-hobbit", "title": "The Hobbit", "price": 14.50, "quantity": 1 },
    { "bookId": "class-10-complete-mathematics", "title": "Class 10: Complete Mathematics", "price": 13.99, "quantity": 2 }
  ],
  "shipping": {
    "fullName": "Jane Reader",
    "email": "jane@example.com",
    "address": "742 Evergreen Terrace",
    "city": "Springfield",
    "postalCode": "97477",
    "country": "United States"
  },
  "paymentMethod": "stripe",
  "paymentStatus": "paid",
  "orderStatus": "confirmed",
  "subtotal": 42.48,
  "discount": 4.25,
  "total": 38.23,
  "currency": "USD",
  "createdAt": "2026-11-06T15:10:00.000Z"
}
```

- **Response `400 Bad Request` (Insufficient Stock)**:
```json
{
  "success": false,
  "message": "Insufficient stock for \"The Hobbit\". Available stock: 2, requested quantity: 10"
}
```

#### `GET /api/orders`
Retrieves past orders for the authenticated user, or all store orders if the user has `role: admin`.

#### `GET /api/orders/:id`
Retrieves an order confirmation and itemized breakdown by ID.

---

### 5. Checkout & Payments API

#### `POST /api/checkout/create-payment-intent`
Generates a payment session for card checkout.

- **Request Body**:
```json
{
  "amount": 42.27,
  "currency": "usd",
  "metadata": { "orderRef": "cart_session" }
}
```

- **Response `200 OK`**:
```json
{
  "success": true,
  "clientSecret": "pi_mock_4b9a1c8f_secret_99f3...",
  "paymentIntentId": "pi_mock_4b9a1c8f",
  "amount": 42.27,
  "currency": "usd",
  "status": "requires_payment_method",
  "mock": true
}
```

---

## ⚡ Inventory & Transactional Stock Logic

To prevent race conditions and overselling, inventory reservation uses ACID database transactions (`BEGIN IMMEDIATE` / `COMMIT`).

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer / Client
    participant OrderAPI as POST /api/orders
    participant OrderSvc as OrderService
    participant DB as SQLite / Postgres Transaction

    Customer->>OrderAPI: Submit Order (items, shipping, payment)
    OrderAPI->>OrderSvc: createOrder(payload)
    OrderSvc->>DB: BEGIN IMMEDIATE TRANSACTION
    
    loop For each item in cart
        OrderSvc->>DB: SELECT id, title, price, stock FROM books WHERE id = ?
        DB-->>OrderSvc: Return Book Record
        alt Requested Quantity > Available Stock
            OrderSvc->>DB: ROLLBACK
            OrderSvc-->>Customer: 400 Bad Request: "Insufficient stock for [Title]"
        end
    end

    loop For each item in cart
        OrderSvc->>DB: UPDATE books SET stock = stock - ? WHERE id = ?
    end

    OrderSvc->>DB: INSERT INTO orders (id, items, total, shipping, ...)
    OrderSvc->>DB: INSERT INTO order_items (order_id, book_id, quantity, price, ...)
    OrderSvc->>DB: COMMIT TRANSACTION
    OrderSvc-->>Customer: 201 Created: Order Confirmation (ID: PC-XXXX)
```

---

## 🔒 Authentication & Security Architecture

1. **Password Encryption**: Salted passwords hashed using `bcryptjs` with 10 salt rounds. Plaintext credentials are never stored or logged.
2. **Stateless JWT Authorization**: Requests to protected routes supply `Authorization: Bearer <token>`. Tokens carry `id`, `email`, and `role` signed by a secure secret.
3. **Role-Based Access Control (RBAC)**: Protects administrative operations through `requireAdmin` middleware.
4. **CORS Isolation**: Allows authorized frontend origins (`http://localhost:5173`, `http://localhost:3000`, etc.) and permits preflight `OPTIONS` requests.
5. **Helmet Security Headers**: Enables `Cross-Origin-Resource-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and strict XSS protections.
6. **Input Sanitization**: Request bodies and query parameters are parsed through strict Zod schemas, stripping unexpected fields and rejecting invalid types before reaching handlers.
7. **SQL Injection Defense**: 100% of queries use parameterized prepared statements.

---

## 💳 Checkout & Payment Intent Engine

The payment module in [`paymentService.js`](file:///d:/My%20Move/pagecrafter-books-main/backend/src/services/paymentService.js) handles both live transactions and zero-dependency mock testing:

- **Production Stripe Mode**: When `STRIPE_SECRET_KEY` is provided in `.env` (starts with `sk_live_` or `sk_test_`), the backend contacts the official Stripe REST API to construct genuine `PaymentIntent` objects with webhooks.
- **Developer Mock Mode**: When `STRIPE_SECRET_KEY` is empty, it generates a mock payment intent:
  - Generates format-compliant `clientSecret` (`pi_mock_<id>_secret_<token>`)
  - Calculates amounts dynamically if omitted from payload
  - Allows full end-to-end checkout validation without credit cards or third-party network access

---

## 🌱 Pre-Seeded Catalog & Demo Credentials

Running `npm run seed` in the `backend/` directory provisions:

- **Realistic Books** covering diverse categories:
  - **School Textbooks**: *NCERT Class 1 to Class 12 Curriculum Books*, *Concepts of Physics* (Prof. H.C. Verma)
  - **Comics**: *The Amazing Spider-Man: Genesis*, *Tintin in Tibet*, *Batman: Year One*
  - **Story Books**: *The Hobbit*, *Panchatantra: Timeless Fables*, *The Alchemist*
  - **History Books**: *Sapiens: A Brief History of Humankind*, *Ancient Civilizations of the World*
- **Curated Cover Imagery**: High-resolution Unsplash book cover URLs + OKLCH gradient tokens.
- **Customer Reviews**: Realistic reader testimonials and star ratings for each title.

### Demo User Accounts

| Role | Email | Password | Access Privileges |
|---|---|---|---|
| **Administrator** | `admin@pagecrafter.com` | `Admin@123456` | Manage orders, view full store data |
| **Customer** | `customer@pagecrafter.com` | `Customer@123456` | Place orders, view personal order history |

---

## ⚙️ Environment Variables Reference

### Backend ([`backend/.env`](file:///d:/My%20Move/pagecrafter-books-main/backend/.env))

```env
# Server Port
PORT=5000

# Runtime Environment
NODE_ENV=development

# Database Connection
# SQLite: sqlite:./data/bookstore.db or :memory:
# PostgreSQL: postgresql://username:password@localhost:5432/bookstore
DATABASE_URL=sqlite:./data/bookstore.db

# JWT Configuration
JWT_SECRET=super-secret-pagecrafter-jwt-token-key-change-in-production-2026
JWT_EXPIRES_IN=7d

# CORS Allowed Origins (comma-separated or * for development)
CORS_ORIGIN=http://localhost:5173,http://localhost:3000,http://localhost:8080,http://127.0.0.1:5173

# Stripe Payment Gateway (optional, uses mock session when empty)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

### Frontend ([`pagecrafter-books-main/.env`](file:///d:/My%20Move/pagecrafter-books-main/pagecrafter-books-main/.env))

```env
# Backend REST API Base URL
VITE_BACKEND_URL=http://localhost:5000
```

---

## 🚀 Setup, Execution & Testing Guide

### 1. Backend Setup & Startup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Seed the database (books, reviews, demo users)
npm run seed

# Run in development mode (with file-watch auto-reload)
npm run dev

# Or start in standard production mode
npm start
```
The REST API will be running at `http://localhost:5000`.

### 2. Frontend Startup

```bash
# In a separate terminal, navigate to frontend directory
cd pagecrafter-books-main

# Install dependencies (if not already installed)
npm install

# Launch frontend Vite dev server
npm run dev
```
The client will be running at `http://localhost:5173` and connected to the backend.

### 3. Root Workspace Commands

From the root project folder:
```bash
# Start backend
npm run dev:backend

# Seed backend
npm run seed:backend

# Run backend tests
npm run test:backend

# Start frontend
npm run dev:frontend
```

---

## 🧪 Verification & Test Results

The backend contains **23 automated integration tests** in [`backend/test/api.test.js`](file:///d:/My%20Move/pagecrafter-books-main/backend/test/api.test.js) executed via Node's native test runner (`node --test`).

```bash
cd backend
npm test
```

### Test Suite Execution Output

```text
▶ 1. Health Check
  ✔ GET /health returns 200 with database connected (96ms)
  ✔ GET /api/health also responds with health status (10ms)
✔ 1. Health Check (110ms)

▶ 2. Books API
  ✔ GET /api/books returns paginated book collection (12ms)
  ✔ GET /api/books with search query param (5ms)
  ✔ GET /api/books with category filter (5ms)
  ✔ GET /api/books with sorting (price-asc) (7ms)
  ✔ GET /api/books pagination (page and limit) (7ms)
  ✔ GET /api/books/:id returns detailed book info with reviews (5ms)
  ✔ GET /api/books/:id returns 404 for nonexistent book (6ms)
  ✔ GET /api/books/featured returns featured book (5ms)
  ✔ GET /api/books/categories returns category breakdown (3ms)
✔ 2. Books API (59ms)

▶ 3. Authentication API
  ✔ POST /api/auth/register creates user and returns JWT token (105ms)
  ✔ POST /api/auth/register rejects duplicate email with 409 (5ms)
  ✔ POST /api/auth/register rejects invalid email or short password with 400 (3ms)
  ✔ POST /api/auth/login successfully logs in user (72ms)
  ✔ POST /api/auth/login rejects invalid password with 401 (69ms)
  ✔ GET /api/auth/me returns authenticated profile (71ms)
  ✔ GET /api/auth/me rejects unauthorized request with 401 (2ms)
✔ 3. Authentication API (330ms)

▶ 4. Orders & Stock Management API
  ✔ POST /api/orders creates order, validates stock & returns confirmation (7ms)
  ✔ POST /api/orders rejects order if requested quantity exceeds stock (6ms)
  ✔ POST /api/orders rejects order missing shipping address (3ms)
✔ 4. Orders & Stock Management API (17ms)

▶ 5. Checkout & Payment Intent API
  ✔ POST /api/checkout/create-payment-intent creates mock payment session (4ms)
  ✔ POST /api/checkout/create-payment-intent calculates amount from items if omitted (3ms)
✔ 5. Checkout & Payment Intent API (7ms)

ℹ tests 23
ℹ suites 5
ℹ pass 23
ℹ fail 0
ℹ duration_ms 1503
```

---

## 📌 Summary Checklist

- [x] **Database Schema**: Users, Books, Reviews, Orders, OrderItems with relational integrity.
- [x] **Express 5 API**: Query params (search, category, sort, page, limit), detail view, order processing, JWT auth, payment intent.
- [x] **Inventory Safety**: Atomic database transactions verifying stock and preventing overselling.
- [x] **Security**: CORS enabled for localhost development, Helmet headers, Bcrypt password hashing, Zod schema validation.
- [x] **Seed Dataset**: 25 realistic books with working Unsplash covers across diverse genres, reviews, and pre-configured admin/customer accounts.
- [x] **Automated Testing**: 23/23 tests passing with 0 failures.
- [x] **Full Documentation**: Complete documentation in [`PROJECT.md`](file:///d:/My%20Move/pagecrafter-books-main/PROJECT.md).

