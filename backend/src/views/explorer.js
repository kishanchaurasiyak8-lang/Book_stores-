export function renderExplorerHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PageCrafter Books — Online Bookstore</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📚</text></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #fcfbf9;
      --surface: #ffffff;
      --border: #e7e2d7;
      --text-main: #1c1917;
      --text-muted: #78716c;
      --accent: #1e3a2b;
      --accent-hover: #14281e;
      --accent-light: #edf3ef;
      --amber: #d97706;
      --amber-light: #fef3c7;
      --red: #dc2626;
      --font-serif: 'Newsreader', Georgia, serif;
      --font-sans: 'Plus Jakarta Sans', -apple-system, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
      --shadow-sm: 0 1px 3px rgba(0,0,0,0.05);
      --shadow-md: 0 4px 12px rgba(0,0,0,0.06);
      --shadow-lg: 0 12px 28px rgba(0,0,0,0.1);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text-main);
      font-family: var(--font-sans);
      line-height: 1.5;
      padding-bottom: 90px;
    }

    /* Top Banner & Header */
    header {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .header-inner {
      max-width: 1320px;
      margin: 0 auto;
      padding: 0.85rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: inherit;
    }
    .brand-logo {
      width: 42px;
      height: 42px;
      background: var(--accent);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      font-size: 1.35rem;
    }
    .brand-title {
      font-family: var(--font-serif);
      font-size: 1.6rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      line-height: 1.1;
    }
    .search-container {
      flex: 1;
      max-width: 480px;
      position: relative;
    }
    .search-input {
      width: 100%;
      padding: 0.65rem 1rem 0.65rem 2.5rem;
      border: 1px solid var(--border);
      border-radius: 9999px;
      background: #f7f5f0;
      font-size: 0.9rem;
      outline: none;
      font-family: inherit;
      transition: all 0.2s;
    }
    .search-input:focus {
      background: #ffffff;
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(30, 58, 43, 0.1);
    }
    .search-icon {
      position: absolute;
      left: 0.9rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .cart-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1.1rem;
      background: var(--accent);
      color: white;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.9rem;
      border: none;
      cursor: pointer;
      transition: background 0.2s;
    }
    .cart-btn:hover { background: var(--accent-hover); }
    .cart-count {
      background: #ffffff;
      color: var(--accent);
      padding: 0.1rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
    }

    /* Container */
    .container {
      max-width: 1320px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }

    /* Controls Bar: Main Categories & Grade Pills */
    .controls-section {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 1.5rem;
      margin-top: 1.75rem;
      margin-bottom: 2rem;
      box-shadow: var(--shadow-sm);
    }
    .main-category-tabs {
      display: flex;
      gap: 0.65rem;
      flex-wrap: wrap;
      margin-bottom: 1.25rem;
    }
    .tab-btn {
      padding: 0.6rem 1.25rem;
      background: #f4efe6;
      border: 1px solid transparent;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 600;
      color: #44403c;
      cursor: pointer;
      transition: all 0.2s;
    }
    .tab-btn:hover { background: #e8e0d2; }
    .tab-btn.active {
      background: var(--accent);
      color: white;
      box-shadow: 0 3px 8px rgba(30, 58, 43, 0.2);
    }

    /* Grade Level Pills (Shown for School Textbooks) */
    .grade-pills-row {
      display: flex;
      gap: 0.45rem;
      flex-wrap: wrap;
      padding: 1rem;
      background: #faf8f5;
      border: 1px solid #ebd9c0;
      border-radius: 10px;
      margin-bottom: 1.25rem;
      animation: fadeIn 0.25s ease-in-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .grade-pill {
      padding: 0.35rem 0.85rem;
      background: #ffffff;
      border: 1px solid #dcd5c7;
      border-radius: 9999px;
      font-size: 0.825rem;
      font-weight: 600;
      color: #57534e;
      cursor: pointer;
      transition: all 0.15s;
    }
    .grade-pill:hover {
      background: #f0ebe1;
      border-color: #beb29d;
    }
    .grade-pill.active {
      background: var(--amber);
      color: #ffffff;
      border-color: var(--amber);
    }

    .filter-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
      padding-top: 1rem;
      border-top: 1px solid #f2ede4;
    }
    .filter-stats {
      font-size: 0.95rem;
      color: var(--text-muted);
      font-weight: 500;
    }
    .filter-actions {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .sort-select {
      padding: 0.5rem 0.85rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: #ffffff;
      font-size: 0.85rem;
      font-family: inherit;
      color: var(--text-main);
      cursor: pointer;
    }

    /* Books Grid */
    .books-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.75rem;
    }
    .book-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 14px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-sm);
      transition: transform 0.2s, box-shadow 0.2s;
      position: relative;
    }
    .book-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
    }
    .book-cover-wrap {
      width: 100%;
      height: 320px;
      background: linear-gradient(135deg, #334155 0%, #0f172a 100%);
      overflow: hidden;
      position: relative;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .cover-fallback {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      text-align: center;
      color: #ffffff;
      z-index: 1;
      pointer-events: none;
      box-sizing: border-box;
    }
    .cover-fallback-title {
      font-family: var(--font-serif);
      font-size: 1.25rem;
      font-weight: 600;
      line-height: 1.3;
      margin-bottom: 0.5rem;
      color: #ffffff;
      text-shadow: 0 1px 4px rgba(0,0,0,0.6);
    }
    .cover-fallback-author {
      font-size: 0.85rem;
      color: #cbd5e1;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 500;
    }
    .book-cover-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
      z-index: 2;
    }
    .book-card:hover .book-cover-img { transform: scale(1.04); }
    .badge-grade {
      position: absolute;
      top: 12px;
      left: 12px;
      background: rgba(28, 25, 23, 0.85);
      color: white;
      padding: 0.25rem 0.65rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      backdrop-filter: blur(4px);
    }
    .badge-stock {
      position: absolute;
      top: 12px;
      right: 12px;
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .badge-stock.out {
      background: #fef2f2;
      color: #991b1b;
      border-color: #fecaca;
    }
    .book-details {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }
    .book-genre {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--amber);
      font-weight: 700;
      margin-bottom: 0.25rem;
    }
    .book-title {
      font-family: var(--font-serif);
      font-size: 1.3rem;
      font-weight: 600;
      line-height: 1.25;
      color: #1a1a1a;
      margin-bottom: 0.35rem;
      cursor: pointer;
    }
    .book-author {
      font-size: 0.9rem;
      color: var(--text-muted);
      margin-bottom: 0.75rem;
    }
    .book-rating-row {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: #d97706;
      margin-bottom: 1rem;
    }
    .book-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: auto;
      padding-top: 1rem;
      border-top: 1px solid #f2ede4;
    }
    .book-price {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--accent);
    }
    .add-cart-btn {
      padding: 0.5rem 1rem;
      background: var(--accent-light);
      color: var(--accent);
      border: 1px solid rgba(30, 58, 43, 0.2);
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .add-cart-btn:hover {
      background: var(--accent);
      color: white;
    }

    /* Modal / Drawer */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      z-index: 200;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .modal-content {
      background: white;
      border-radius: 16px;
      max-width: 780px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      padding: 2rem;
      position: relative;
      box-shadow: var(--shadow-lg);
    }
    .modal-close {
      position: absolute;
      top: 1.25rem;
      right: 1.25rem;
      background: #f4efe6;
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1.2rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Cart Slide-out Drawer */
    .cart-drawer-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      z-index: 250;
      display: none;
    }
    .cart-drawer {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      max-width: 440px;
      background: white;
      box-shadow: -10px 0 30px rgba(0,0,0,0.15);
      z-index: 260;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    }
    .cart-drawer.open { transform: translateX(0); }
    .cart-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .cart-items-list {
      flex: 1;
      overflow-y: auto;
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .cart-item {
      display: flex;
      gap: 1rem;
      align-items: center;
      padding-bottom: 1rem;
      border-bottom: 1px solid #f2ede4;
    }
    .cart-item-img {
      width: 55px;
      height: 75px;
      border-radius: 6px;
      object-fit: cover;
    }
    .cart-item-info { flex: 1; }
    .cart-item-title {
      font-weight: 600;
      font-size: 0.95rem;
      line-height: 1.3;
    }
    .cart-item-price {
      font-size: 0.85rem;
      color: var(--accent);
      font-weight: 600;
    }
    .cart-qty-btns {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.35rem;
    }
    .qty-btn {
      width: 24px;
      height: 24px;
      background: #f4efe6;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 700;
    }
    .cart-footer {
      padding: 1.5rem;
      border-top: 1px solid var(--border);
      background: #faf8f5;
    }
    .cart-total-row {
      display: flex;
      justify-content: space-between;
      font-size: 1.15rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }
    .checkout-btn {
      width: 100%;
      padding: 0.85rem;
      background: var(--accent);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.2s;
    }
    .checkout-btn:hover { background: var(--accent-hover); }

    /* Customer-Facing Store Footer */
    .store-footer {
      margin-top: 4.5rem;
      padding-top: 2rem;
      border-top: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      flex-wrap: wrap;
      color: var(--text-muted);
      font-size: 0.875rem;
    }
    .footer-brand {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }
    .footer-brand strong {
      color: var(--text-main);
      font-family: var(--font-serif);
      font-size: 1.05rem;
    }

    /* Checkout Modal */
    .checkout-modal-inner {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .form-group label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-main);
    }
    .form-control {
      padding: 0.65rem 0.85rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      font-size: 0.9rem;
      font-family: inherit;
      outline: none;
    }
    .form-control:focus {
      border-color: var(--accent);
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
  </style>
</head>
<body>

  <!-- Top Navigation Header -->
  <header>
    <div class="header-inner">
      <a href="/" class="brand">
        <div class="brand-logo">📚</div>
        <div>
          <div class="brand-title">PageCrafter</div>
          <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; letter-spacing: 0.04em;">ONLINE BOOKSTORE</div>
        </div>
      </a>

      <div class="search-container">
        <span class="search-icon">🔍</span>
        <input type="text" id="searchInput" class="search-input" placeholder="Search by title, author, class, or keyword...">
      </div>

      <div class="header-actions">
        <button id="openCartBtn" class="cart-btn">
          🛒 Cart <span id="cartBadge" class="cart-count">0</span>
        </button>
      </div>
    </div>
  </header>

  <main class="container">

    <!-- Genre & Controls Section -->
    <section class="controls-section">
      <!-- 5 Main Category Tabs -->
      <div class="main-category-tabs" id="mainCategoryTabs">
        <button class="tab-btn active" data-category="All Books">All Books</button>
        <button class="tab-btn" data-category="School Textbooks">School Textbooks</button>
        <button class="tab-btn" data-category="Comics">Comics</button>
        <button class="tab-btn" data-category="Story Books">Story Books</button>
        <button class="tab-btn" data-category="History Books">History Books</button>
      </div>

      <!-- Grade Level Pills (Shown exclusively when "School Textbooks" is active) -->
      <div class="grade-pills-row" id="gradePillsRow" style="display: none;">
        <span style="font-size: 0.85rem; font-weight: 700; color: #78350f; display: flex; align-items: center; margin-right: 0.5rem;">Grade / Class:</span>
        <button class="grade-pill active" data-grade="All">All Grades</button>
        <button class="grade-pill" data-grade="Class 1">Class 1</button>
        <button class="grade-pill" data-grade="Class 2">Class 2</button>
        <button class="grade-pill" data-grade="Class 3">Class 3</button>
        <button class="grade-pill" data-grade="Class 4">Class 4</button>
        <button class="grade-pill" data-grade="Class 5">Class 5</button>
        <button class="grade-pill" data-grade="Class 6">Class 6</button>
        <button class="grade-pill" data-grade="Class 7">Class 7</button>
        <button class="grade-pill" data-grade="Class 8">Class 8</button>
        <button class="grade-pill" data-grade="Class 9">Class 9</button>
        <button class="grade-pill" data-grade="Class 10">Class 10</button>
        <button class="grade-pill" data-grade="Class 11">Class 11</button>
        <button class="grade-pill" data-grade="Class 12">Class 12</button>
      </div>

      <div class="filter-row">
        <div class="filter-stats" id="filterStats">
          Loading catalog...
        </div>
        <div class="filter-actions">
          <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; font-weight: 500; cursor: pointer;">
            <input type="checkbox" id="inStockCheckbox"> In Stock Only
          </label>
          <select id="sortSelect" class="sort-select">
            <option value="popularity">Sort by: Popularity</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest Releases</option>
            <option value="rating">Highest Rated</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>
      </div>
    </section>

    <!-- Book Grid Section -->
    <section>
      <div class="books-grid" id="booksGrid">
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--text-muted);">
          Loading books from database...
        </div>
      </div>
    </section>

    <!-- Customer-Facing Store Footer -->
    <footer class="store-footer">
      <div class="footer-brand">
        <span style="font-size: 1.25rem;">📚</span>
        <strong>PageCrafter Books</strong>
        <span>&copy; 2026. All rights reserved.</span>
      </div>
      <div class="footer-tagline">
        <span>Curated school textbooks, comics, classics &amp; stories</span>
      </div>
    </footer>

  </main>

  <!-- Book Detail Modal -->
  <div class="modal-overlay" id="bookModal">
    <div class="modal-content">
      <button class="modal-close" id="closeBookModal">&times;</button>
      <div id="modalBody" style="display: grid; grid-template-columns: 220px 1fr; gap: 2rem;">
        <!-- Filled dynamically -->
      </div>
    </div>
  </div>

  <!-- Cart Slide-out Drawer -->
  <div class="cart-drawer-overlay" id="cartOverlay"></div>
  <aside class="cart-drawer" id="cartDrawer">
    <div class="cart-header">
      <h3 style="font-family: var(--font-serif); font-size: 1.35rem;">Your Cart (<span id="cartDrawerCount">0</span>)</h3>
      <button class="modal-close" id="closeCartDrawer" style="position: static;">&times;</button>
    </div>
    <div class="cart-items-list" id="cartItemsList">
      <!-- Cart items rendered here -->
    </div>
    <div class="cart-footer">
      <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
        <input type="text" id="promoInput" placeholder="Promo code (e.g. WELCOME10)" class="form-control" style="flex: 1;">
        <button id="applyPromoBtn" class="btn btn-secondary" style="padding: 0.5rem 0.85rem; font-size: 0.85rem; cursor: pointer;">Apply</button>
      </div>
      <div id="discountNotice" style="font-size: 0.85rem; color: #15803d; margin-bottom: 0.5rem; display: none;"></div>
      <div class="cart-total-row">
        <span>Estimated Total</span>
        <span id="cartTotalDisplay">$0.00</span>
      </div>
      <button class="checkout-btn" id="startCheckoutBtn">Proceed to Checkout</button>
    </div>
  </aside>

  <!-- Checkout Modal -->
  <div class="modal-overlay" id="checkoutModal">
    <div class="modal-content" style="max-width: 580px;">
      <button class="modal-close" id="closeCheckoutModal">&times;</button>
      <div class="checkout-modal-inner">
        <h2 style="font-family: var(--font-serif); font-size: 1.75rem;">Complete Your Order</h2>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">Enter your shipping details. Stock will be validated atomically against the SQLite database.</p>

        <form id="checkoutForm" style="display: flex; flex-direction: column; gap: 0.85rem;">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" class="form-control" id="shipName" required value="Jane Reader">
          </div>
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" class="form-control" id="shipEmail" required value="customer@pagecrafter.com">
          </div>
          <div class="form-group">
            <label>Street Address</label>
            <input type="text" class="form-control" id="shipAddress" required value="742 Evergreen Terrace">
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label>City</label>
              <input type="text" class="form-control" id="shipCity" required value="Springfield">
            </div>
            <div class="form-group">
              <label>Postal Code</label>
              <input type="text" class="form-control" id="shipZip" required value="97477">
            </div>
          </div>
          <div class="form-group">
            <label>Country</label>
            <input type="text" class="form-control" id="shipCountry" required value="United States">
          </div>
          <div class="form-group">
            <label>Payment Method</label>
            <select class="form-control" id="shipPaymentMethod">
              <option value="stripe">Credit Card (Stripe Session)</option>
              <option value="cod">Cash on Delivery (Mock)</option>
            </select>
          </div>
          <div style="background: #f8fafc; padding: 0.85rem; border-radius: 8px; margin-top: 0.5rem; font-weight: 600; display: flex; justify-content: space-between;">
            <span>Total to Pay:</span>
            <span id="checkoutTotalText">$0.00</span>
          </div>
          <button type="submit" class="checkout-btn" id="submitOrderBtn" style="margin-top: 0.5rem;">
            Place Order &amp; Confirm Stock
          </button>
        </form>
      </div>
    </div>
  </div>

  <!-- Client JavaScript Application -->
  <script>
    (function() {
      // Global fallback cover image URL
      const FALLBACK_COVER = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';

      // Application State
      let books = [];
      let activeCategory = 'All Books';
      let activeGrade = 'All';
      let cart = [];
      let activeDiscount = 0;

      // DOM Elements
      const booksGrid = document.getElementById('booksGrid');
      const searchInput = document.getElementById('searchInput');
      const inStockCheckbox = document.getElementById('inStockCheckbox');
      const sortSelect = document.getElementById('sortSelect');
      const filterStats = document.getElementById('filterStats');
      const mainCategoryTabs = document.getElementById('mainCategoryTabs');
      const gradePillsRow = document.getElementById('gradePillsRow');

      // Cart Elements
      const openCartBtn = document.getElementById('openCartBtn');
      const closeCartDrawer = document.getElementById('closeCartDrawer');
      const cartDrawer = document.getElementById('cartDrawer');
      const cartOverlay = document.getElementById('cartOverlay');
      const cartBadge = document.getElementById('cartBadge');
      const cartDrawerCount = document.getElementById('cartDrawerCount');
      const cartItemsList = document.getElementById('cartItemsList');
      const cartTotalDisplay = document.getElementById('cartTotalDisplay');
      const applyPromoBtn = document.getElementById('applyPromoBtn');
      const promoInput = document.getElementById('promoInput');
      const discountNotice = document.getElementById('discountNotice');

      // Checkout Elements
      const startCheckoutBtn = document.getElementById('startCheckoutBtn');
      const checkoutModal = document.getElementById('checkoutModal');
      const closeCheckoutModal = document.getElementById('closeCheckoutModal');
      const checkoutForm = document.getElementById('checkoutForm');
      const checkoutTotalText = document.getElementById('checkoutTotalText');

      // Book Detail Modal Elements
      const bookModal = document.getElementById('bookModal');
      const closeBookModal = document.getElementById('closeBookModal');
      const modalBody = document.getElementById('modalBody');

      // 1. Fetch initial catalog from /api/books
      async function init() {
        try {
          console.log('[PageCrafter] Requesting catalog from /api/books?limit=100...');
          const res = await fetch('/api/books?limit=100');
          if (!res.ok) {
            throw new Error('API returned HTTP status ' + res.status + ' (' + res.statusText + ')');
          }
          const json = await res.json();
          books = json.data || json.books || [];
          console.log('[PageCrafter] Loaded ' + books.length + ' books successfully.');

          setupCategoryTabs();
          renderCatalog();
        } catch (err) {
          console.error('[PageCrafter] Critical fetch error:', err);
          booksGrid.innerHTML = 
            '<div style="grid-column: 1/-1; text-align: center; color: var(--red); padding: 4rem;">' +
              '<h3 style="font-size: 1.35rem; font-weight: 700; margin-bottom: 0.5rem;">Could not load book catalog</h3>' +
              '<p style="color: var(--text-muted); margin-bottom: 1.5rem;">' + err.message + '</p>' +
              '<button class="cart-btn" onclick="location.reload()">Reload Page</button>' +
            '</div>';
          filterStats.textContent = 'Failed to load books from database.';
        }
      }

      // Setup Category Tabs & Grade Pills
      function setupCategoryTabs() {
        // Tab buttons
        const tabs = mainCategoryTabs.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
          tab.onclick = function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            activeCategory = this.getAttribute('data-category');

            // Show or hide the Grade Pills row based on "School Textbooks"
            if (activeCategory === 'School Textbooks') {
              gradePillsRow.style.display = 'flex';
            } else {
              gradePillsRow.style.display = 'none';
              activeGrade = 'All'; // reset grade when switching to other categories
              resetGradePills();
            }

            renderCatalog();
          };
        });

        // Grade pills
        const gradePills = gradePillsRow.querySelectorAll('.grade-pill');
        gradePills.forEach(pill => {
          pill.onclick = function() {
            gradePills.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            activeGrade = this.getAttribute('data-grade');
            renderCatalog();
          };
        });
      }

      function resetGradePills() {
        const gradePills = gradePillsRow.querySelectorAll('.grade-pill');
        gradePills.forEach(p => {
          if (p.getAttribute('data-grade') === 'All') p.classList.add('active');
          else p.classList.remove('active');
        });
      }

      // Filter & Sort Engine
      function getFilteredBooks() {
        const query = searchInput.value.toLowerCase().trim();
        const inStockOnly = inStockCheckbox.checked;
        const sortMode = sortSelect.value;

        let filtered = books.filter(b => {
          // Category match
          let matchCategory = true;
          if (activeCategory !== 'All Books') {
            matchCategory = (b.category || '').toLowerCase() === activeCategory.toLowerCase();
          }

          // Grade match (for School Textbooks)
          let matchGrade = true;
          if (activeCategory === 'School Textbooks' && activeGrade !== 'All') {
            matchGrade = (b.grade_level || b.gradeLevel || '').toLowerCase() === activeGrade.toLowerCase();
          }

          // Search match
          let matchQuery = true;
          if (query) {
            const titleMatch = (b.title || '').toLowerCase().includes(query);
            const authorMatch = (b.author || '').toLowerCase().includes(query);
            const catMatch = (b.category || '').toLowerCase().includes(query);
            const gradeMatch = (b.grade_level || b.gradeLevel || '').toLowerCase().includes(query);
            const descMatch = (b.description || '').toLowerCase().includes(query);
            matchQuery = titleMatch || authorMatch || catMatch || gradeMatch || descMatch;
          }

          // Stock match
          const matchStock = !inStockOnly || Number(b.stock) > 0;

          return matchCategory && matchGrade && matchQuery && matchStock;
        });

        // Sorting
        filtered.sort((a, b) => {
          if (sortMode === 'price-asc') return Number(a.price) - Number(b.price);
          if (sortMode === 'price-desc') return Number(b.price) - Number(a.price);
          if (sortMode === 'rating') return Number(b.rating) - Number(a.rating);
          if (sortMode === 'title') return (a.title || '').localeCompare(b.title || '');
          if (sortMode === 'newest') return (b.publishedAt || '').localeCompare(a.publishedAt || '');
          return Number(b.popularity || 0) - Number(a.popularity || 0);
        });

        return filtered;
      }

      // Render Books Grid
      function renderCatalog() {
        try {
          const filtered = getFilteredBooks();
          
          let filterDesc = activeCategory;
          if (activeCategory === 'School Textbooks' && activeGrade !== 'All') {
            filterDesc += ' (' + activeGrade + ')';
          }
          filterStats.innerHTML = 'Showing <strong>' + filtered.length + ' books</strong> in ' + filterDesc;

          if (filtered.length === 0) {
            booksGrid.innerHTML = 
              '<div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--text-muted); font-size: 1.1rem;">' +
                'No books match the selected filters. Try choosing "All Books" or clearing the search bar.' +
              '</div>';
            return;
          }

          booksGrid.innerHTML = '';
          filtered.forEach(book => {
            const card = document.createElement('div');
            card.className = 'book-card';
            
            const inStock = Number(book.stock) > 0;
            const stockBadgeHtml = inStock 
              ? '<span class="badge-stock">' + book.stock + ' in stock</span>'
              : '<span class="badge-stock out">Out of stock</span>';

            const tagText = (book.grade_level && book.grade_level !== 'General') 
              ? book.grade_level 
              : (book.format || 'Book');

            const coverSrc = book.cover_image_url || FALLBACK_COVER;

            card.innerHTML = 
              '<div class="book-cover-wrap">' +
                '<div class="cover-fallback">' +
                  '<div class="cover-fallback-title">' + (book.title || 'Untitled') + '</div>' +
                  '<div class="cover-fallback-author">by ' + (book.author || 'NCERT') + '</div>' +
                '</div>' +
                '<span class="badge-grade" style="z-index: 3;">' + tagText + '</span>' +
                '<span style="z-index: 3;">' + stockBadgeHtml + '</span>' +
                '<img class="book-cover-img" src="' + coverSrc + '" alt="' + (book.title || 'Book cover') + '" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display=\\'none\\';">' +
              '</div>' +
              '<div class="book-details">' +
                '<div class="book-genre">' + (book.category || 'Books') + '</div>' +
                '<h3 class="book-title">' + (book.title || 'Untitled') + '</h3>' +
                '<div class="book-author">by ' + (book.author || 'Unknown') + '</div>' +
                '<div class="book-rating-row">' +
                  '<span>★</span> <span>' + (book.rating || '4.5') + '</span>' +
                  '<span style="color: var(--text-muted); font-size: 0.75rem; font-weight: normal;">(' + (book.ratingCount || book.rating_count || 0) + ')</span>' +
                '</div>' +
                '<div class="book-footer">' +
                  '<span class="book-price">$' + Number(book.price || 0).toFixed(2) + '</span>' +
                  '<button class="add-cart-btn" ' + (!inStock ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : '') + '>Add to Cart</button>' +
                '</div>' +
              '</div>';

            // Event bindings
            card.querySelector('.book-cover-wrap').addEventListener('click', () => openBookModal(book.id));
            card.querySelector('.book-title').addEventListener('click', () => openBookModal(book.id));
            
            const btn = card.querySelector('.add-cart-btn');
            if (inStock) {
              btn.addEventListener('click', (e) => {
                e.stopPropagation();
                addToCart(book.id);
              });
            }

            booksGrid.appendChild(card);
          });
        } catch (err) {
          console.error('[PageCrafter] Catalog render error:', err);
          booksGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: red; padding: 3rem;">Rendering error: ' + err.message + '</div>';
        }
      }

      // Open Book Details Modal
      async function openBookModal(bookId) {
        modalBody.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem;">Loading details...</div>';
        bookModal.style.display = 'flex';

        try {
          const res = await fetch('/api/books/' + encodeURIComponent(bookId));
          const book = await res.json();
          const coverSrc = book.cover_image_url || FALLBACK_COVER;

          modalBody.innerHTML = 
            '<div>' +
              '<div style="position: relative; width: 100%; height: 320px; border-radius: 10px; overflow: hidden; background: linear-gradient(135deg, #334155, #0f172a); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 1.5rem; box-shadow: var(--shadow-md); box-sizing: border-box;">' +
                '<div style="color: white; font-family: var(--font-serif); font-size: 1.35rem; font-weight: 600; margin-bottom: 0.5rem; text-shadow: 0 1px 4px rgba(0,0,0,0.6);">' + (book.title || '') + '</div>' +
                '<div style="color: #cbd5e1; font-size: 0.85rem; text-transform: uppercase;">by ' + (book.author || '') + '</div>' +
                '<img src="' + coverSrc + '" alt="' + (book.title || '') + '" referrerpolicy="no-referrer" onerror="this.style.display=\\'none\\';" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;">' +
              '</div>' +
              '<div style="margin-top: 1rem; font-size: 0.85rem; color: var(--text-muted); line-height: 1.6;">' +
                '<div><strong>Format:</strong> ' + (book.format || 'Paperback') + '</div>' +
                '<div><strong>ISBN:</strong> ' + (book.isbn || 'N/A') + '</div>' +
                '<div><strong>Pages:</strong> ' + (book.pages || 'N/A') + '</div>' +
                '<div><strong>Grade Level:</strong> ' + (book.grade_level || book.gradeLevel || 'General') + '</div>' +
                '<div><strong>Publisher:</strong> ' + (book.publisher || 'NCERT / PageCrafter') + '</div>' +
              '</div>' +
            '</div>' +
            '<div>' +
              '<div style="font-size: 0.8rem; text-transform: uppercase; color: var(--amber); font-weight: 700;">' + (book.category || 'Books') + '</div>' +
              '<h2 style="font-family: var(--font-serif); font-size: 2rem; line-height: 1.2; margin-bottom: 0.5rem;">' + (book.title || '') + '</h2>' +
              '<div style="font-size: 1.1rem; color: var(--text-muted); margin-bottom: 1rem;">by ' + (book.author || '') + '</div>' +
              '<div style="font-size: 1.5rem; font-weight: 700; color: var(--accent); margin-bottom: 1.25rem;">$' + Number(book.price || 0).toFixed(2) + '</div>' +
              '<p style="font-size: 0.95rem; line-height: 1.6; color: #44403c; margin-bottom: 1.5rem;">' + (book.synopsis || book.description || 'No description available.') + '</p>' +
              '<button id="modalAddToCartBtn" class="checkout-btn" style="margin-bottom: 2rem;">Add to Cart — $' + Number(book.price || 0).toFixed(2) + '</button>' +
              
              '<h4 style="font-family: var(--font-serif); font-size: 1.2rem; border-top: 1px solid var(--border); padding-top: 1.5rem; margin-bottom: 1rem;">Customer Reviews (' + (book.reviews ? book.reviews.length : 0) + ')</h4>' +
              '<div style="display: flex; flex-direction: column; gap: 0.75rem;">' +
                ((book.reviews && book.reviews.length > 0) ? book.reviews.map(r => 
                  '<div style="background: #faf8f5; padding: 0.85rem; border-radius: 8px; font-size: 0.85rem;">' +
                    '<div style="display: flex; justify-content: space-between; font-weight: 600; margin-bottom: 0.25rem;">' +
                      '<span>' + (r.name || 'Anonymous') + '</span>' +
                      '<span style="color: #d97706;">★ ' + (r.rating || 5) + '/5</span>' +
                    '</div>' +
                    '<div style="color: #57534e;">' + (r.text || '') + '</div>' +
                  '</div>'
                ).join('') : '<div style="color: var(--text-muted); font-size: 0.85rem;">No customer reviews yet.</div>') +
              '</div>' +
            '</div>';

          document.getElementById('modalAddToCartBtn').onclick = () => {
            addToCart(book.id);
            bookModal.style.display = 'none';
          };
        } catch (e) {
          console.error('[PageCrafter] Modal load error:', e);
          modalBody.innerHTML = '<div style="grid-column: 1/-1; color: red;">Failed to load book: ' + e.message + '</div>';
        }
      }

      // Cart Operations
      function addToCart(bookId) {
        const book = books.find(b => b.id === bookId);
        if (!book) return;

        const existing = cart.find(item => item.bookId === bookId);
        if (existing) {
          existing.quantity += 1;
        } else {
          cart.push({
            bookId: book.id,
            title: book.title,
            price: Number(book.price || 0),
            cover: book.cover_image_url || FALLBACK_COVER,
            quantity: 1
          });
        }
        updateCartUI();
        openCartDrawer();
      }

      function updateCartUI() {
        const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
        cartBadge.textContent = totalItems;
        cartDrawerCount.textContent = totalItems;

        if (cart.length === 0) {
          cartItemsList.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 3rem;">Your cart is empty.</div>';
          cartTotalDisplay.textContent = '$0.00';
          return;
        }

        let subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        let discountVal = subtotal * activeDiscount;
        let finalTotal = Math.max(0, subtotal - discountVal);

        cartTotalDisplay.textContent = '$' + finalTotal.toFixed(2);
        checkoutTotalText.textContent = '$' + finalTotal.toFixed(2);

        cartItemsList.innerHTML = '';
        cart.forEach(item => {
          const div = document.createElement('div');
          div.className = 'cart-item';
          div.innerHTML = 
            '<div style="width: 55px; height: 75px; border-radius: 6px; overflow: hidden; position: relative; background: linear-gradient(135deg, #334155, #0f172a); display: flex; align-items: center; justify-content: center; text-align: center; flex-shrink: 0;">' +
              '<span style="font-size: 8px; color: #fff; padding: 2px;">' + (item.title || '') + '</span>' +
              '<img class="cart-item-img" src="' + item.cover + '" referrerpolicy="no-referrer" onerror="this.style.display=\\'none\\';" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;">' +
            '</div>' +
            '<div class="cart-item-info">' +
              '<div class="cart-item-title">' + item.title + '</div>' +
              '<div class="cart-item-price">$' + item.price.toFixed(2) + ' each</div>' +
              '<div class="cart-qty-btns">' +
                '<button class="qty-btn dec">-</button>' +
                '<span style="font-size: 0.85rem; font-weight: 600;">' + item.quantity + '</span>' +
                '<button class="qty-btn inc">+</button>' +
              '</div>' +
            '</div>' +
            '<div style="font-weight: 700; color: var(--accent); font-size: 0.95rem;">$' + (item.price * item.quantity).toFixed(2) + '</div>';

          div.querySelector('.dec').onclick = () => {
            item.quantity -= 1;
            if (item.quantity <= 0) {
              cart = cart.filter(i => i.bookId !== item.bookId);
            }
            updateCartUI();
          };
          div.querySelector('.inc').onclick = () => {
            item.quantity += 1;
            updateCartUI();
          };

          cartItemsList.appendChild(div);
        });
      }

      function openCartDrawer() {
        cartDrawer.classList.add('open');
        cartOverlay.style.display = 'block';
      }

      function closeCart() {
        cartDrawer.classList.remove('open');
        cartOverlay.style.display = 'none';
      }

      // Promo code logic
      applyPromoBtn.onclick = function() {
        const code = promoInput.value.trim().toUpperCase();
        if (code === 'WELCOME10') {
          activeDiscount = 0.10;
          discountNotice.textContent = '✓ 10% discount applied (WELCOME10)';
          discountNotice.style.display = 'block';
        } else if (code === 'SAVE20') {
          activeDiscount = 0.20;
          discountNotice.textContent = '✓ 20% discount applied (SAVE20)';
          discountNotice.style.display = 'block';
        } else {
          activeDiscount = 0;
          discountNotice.textContent = 'Invalid promo code. Try WELCOME10 or SAVE20';
          discountNotice.style.color = '#dc2626';
          discountNotice.style.display = 'block';
        }
        updateCartUI();
      };

      // Checkout submit handler (Calling POST /api/orders)
      checkoutForm.onsubmit = async function(e) {
        e.preventDefault();
        const submitBtn = document.getElementById('submitOrderBtn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing & Validating Stock...';

        const orderPayload = {
          items: cart.map(i => ({ bookId: i.bookId, quantity: i.quantity, price: i.price })),
          shipping: {
            fullName: document.getElementById('shipName').value,
            email: document.getElementById('shipEmail').value,
            address: document.getElementById('shipAddress').value,
            city: document.getElementById('shipCity').value,
            postalCode: document.getElementById('shipZip').value,
            country: document.getElementById('shipCountry').value
          },
          paymentMethod: document.getElementById('shipPaymentMethod').value,
          promoCode: promoInput.value.trim() || undefined,
          currency: 'USD'
        };

        try {
          const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderPayload)
          });
          const result = await res.json();

          if (!res.ok) {
            alert('Order Error: ' + (result.message || 'Stock reservation failed'));
            submitBtn.disabled = false;
            submitBtn.textContent = 'Place Order & Confirm Stock';
            return;
          }

          // Success confirmation
          cart = [];
          updateCartUI();
          checkoutModal.style.display = 'none';
          closeCart();

          // Refresh catalog to reflect updated stock in database
          const refRes = await fetch('/api/books?limit=100');
          const refJson = await refRes.json();
          books = refJson.data || refJson.books || [];
          renderCatalog();

          alert('🎉 Thank you! Your order ' + result.id + ' is confirmed! Total: $' + Number(result.total).toFixed(2));
        } catch (err) {
          alert('Network error placing order: ' + err.message);
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Place Order & Confirm Stock';
        }
      };

      // Listeners
      openCartBtn.onclick = openCartDrawer;
      closeCartDrawer.onclick = closeCart;
      cartOverlay.onclick = closeCart;

      closeBookModal.onclick = () => { bookModal.style.display = 'none'; };
      bookModal.onclick = (e) => { if (e.target === bookModal) bookModal.style.display = 'none'; };

      startCheckoutBtn.onclick = () => {
        if (cart.length === 0) {
          alert('Your cart is empty! Add books to your cart first.');
          return;
        }
        checkoutModal.style.display = 'flex';
      };
      closeCheckoutModal.onclick = () => { checkoutModal.style.display = 'none'; };

      searchInput.oninput = renderCatalog;
      inStockCheckbox.onchange = renderCatalog;
      sortSelect.onchange = renderCatalog;

      // Run on page load
      init();
    })();
  </script>
</body>
</html>`;
}
