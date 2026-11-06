import { query, get, run, transaction } from "../db/index.js";

function formatBook(row, reviews = []) {
  if (!row) return null;

  // Capitalize format appropriately for UI and API
  let displayFormat = row.format || "Paperback";
  if (displayFormat.toLowerCase() === "hardcover") displayFormat = "Hardcover";
  else if (displayFormat.toLowerCase() === "paperback") displayFormat = "Paperback";
  else if (displayFormat.toLowerCase() === "ebook") displayFormat = "eBook";

  return {
    id: row.id,
    title: row.title,
    author: row.author,
    authorBio: row.author_bio || "",
    description: row.description || row.synopsis || "",
    synopsis: row.synopsis || row.description || "",
    price: Number(row.price),
    stock: Number(row.stock),
    inStock: Number(row.stock) > 0,
    isbn: row.isbn || "",
    category: row.category,
    grade_level: row.grade_level || "General",
    gradeLevel: row.grade_level || "General",
    cover_image_url: row.cover_image_url || "",
    coverImageUrl: row.cover_image_url || "",
    format: displayFormat,
    rating: Number(row.rating),
    ratingCount: Number(row.rating_count || 0),
    rating_count: Number(row.rating_count || 0),
    popularity: Number(row.popularity || 0),
    pages: Number(row.pages || 0),
    language: row.language || "English",
    publisher: row.publisher || "PageCrafter Press",
    publishedAt: row.published_at || "",
    published_at: row.published_at || "",
    sample: row.sample || "",
    cover: {
      from: row.cover_from || "oklch(0.35 0.06 155)",
      to: row.cover_to || "oklch(0.22 0.04 160)",
      ink: row.cover_ink || "oklch(0.92 0.06 85)",
    },
    reviews: reviews.map((r) => ({
      id: r.id,
      name: r.name,
      rating: Number(r.rating),
      text: r.text,
      date: r.created_at || r.date || "",
    })),
  };
}

export async function getBooks(filters = {}) {
  const {
    search,
    q,
    category,
    grade_level,
    gradeLevel,
    author,
    format,
    sort = "popularity",
    page = 1,
    limit = 12,
    minPrice,
    maxPrice,
    minRating,
    inStock,
  } = filters;

  const searchTerm = (search || q || "").trim().toLowerCase();
  const whereClauses = [];
  const params = [];

  if (searchTerm) {
    whereClauses.push(
      "(LOWER(title) LIKE ? OR LOWER(author) LIKE ? OR LOWER(description) LIKE ? OR LOWER(category) LIKE ?)"
    );
    const likePattern = `%${searchTerm}%`;
    params.push(likePattern, likePattern, likePattern, likePattern);
  }

  if (category && category !== "All" && category.toLowerCase() !== "all") {
    whereClauses.push("LOWER(category) = LOWER(?)");
    params.push(category);
  }

  const selectedGrade = grade_level || gradeLevel;
  if (selectedGrade && selectedGrade !== "All" && selectedGrade.toLowerCase() !== "all") {
    whereClauses.push("LOWER(grade_level) = LOWER(?)");
    params.push(selectedGrade);
  }

  if (author && author !== "all" && author.toLowerCase() !== "all") {
    whereClauses.push("LOWER(author) = LOWER(?)");
    params.push(author);
  }

  if (format) {
    whereClauses.push("LOWER(format) = LOWER(?)");
    params.push(format);
  }

  if (minPrice !== undefined && minPrice !== null) {
    whereClauses.push("price >= ?");
    params.push(Number(minPrice));
  }

  if (maxPrice !== undefined && maxPrice !== null) {
    whereClauses.push("price <= ?");
    params.push(Number(maxPrice));
  }

  if (minRating !== undefined && minRating !== null) {
    whereClauses.push("rating >= ?");
    params.push(Number(minRating));
  }

  if (inStock === true) {
    whereClauses.push("stock > 0");
  } else if (inStock === false) {
    whereClauses.push("stock = 0");
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  // Order By
  let orderBy = "popularity DESC";
  switch (sort) {
    case "price-asc":
      orderBy = "price ASC";
      break;
    case "price-desc":
      orderBy = "price DESC";
      break;
    case "newest":
      orderBy = "published_at DESC";
      break;
    case "rating":
      orderBy = "rating DESC, rating_count DESC";
      break;
    case "title":
      orderBy = "title ASC";
      break;
    case "popularity":
    default:
      orderBy = "popularity DESC, rating DESC";
      break;
  }

  // Count total matching records
  const countSql = `SELECT COUNT(*) as count FROM books ${whereSql}`;
  const totalRow = await get(countSql, params);
  const total = totalRow ? Number(totalRow.count) : 0;

  // Pagination
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = limit === 0 || limit === "0" ? total : Math.max(1, parseInt(limit, 10) || 12);
  const offset = (pageNum - 1) * limitNum;
  const totalPages = limitNum > 0 ? Math.ceil(total / limitNum) : 1;

  const dataSql = `
    SELECT * FROM books
    ${whereSql}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `;

  const rows = await query(dataSql, [...params, limitNum, offset]);
  const books = rows.map((r) => formatBook(r));

  return {
    books,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages,
  };
}

export async function getBookById(id) {
  const bookRow = await get("SELECT * FROM books WHERE id = ? OR LOWER(id) = LOWER(?)", [id, id]);
  if (!bookRow) return null;

  const reviews = await query(
    "SELECT id, book_id, user_id, name, rating, text, created_at FROM reviews WHERE book_id = ? ORDER BY created_at DESC",
    [bookRow.id]
  );

  return formatBook(bookRow, reviews);
}

export async function getFeaturedBook() {
  const topRow = await get("SELECT id FROM books ORDER BY popularity DESC, rating DESC LIMIT 1");
  if (topRow) {
    return await getBookById(topRow.id);
  }
  return null;
}

export async function getCategories() {
  const rows = await query(`
    SELECT category, COUNT(*) as count
    FROM books
    GROUP BY category
    ORDER BY category ASC
  `);
  return rows.map((r) => ({
    name: r.category,
    count: Number(r.count),
  }));
}

export async function addReview(bookId, { name, rating, text, userId = null }) {
  const book = await get("SELECT id FROM books WHERE id = ?", [bookId]);
  if (!book) {
    const error = new Error("Book not found");
    error.statusCode = 404;
    throw error;
  }

  return await transaction(async () => {
    const now = new Date().toISOString();
    const insertRes = await run(
      `INSERT INTO reviews (book_id, user_id, name, rating, text, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [bookId, userId, name, rating, text, now]
    );

    // Update book rating and rating count
    const stats = await get(
      `SELECT COUNT(*) as count, AVG(rating) as avg_rating
       FROM reviews WHERE book_id = ?`,
      [bookId]
    );

    const newRating = stats.avg_rating ? Math.round(stats.avg_rating * 10) / 10 : rating;
    const newCount = stats.count || 1;

    await run(
      `UPDATE books SET rating = ?, rating_count = ? WHERE id = ?`,
      [newRating, newCount, bookId]
    );

    return {
      id: insertRes.lastInsertRowid,
      bookId,
      name,
      rating,
      text,
      createdAt: now,
    };
  });
}

