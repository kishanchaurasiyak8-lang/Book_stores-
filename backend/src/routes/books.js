import { Router } from "express";
import { validateQuery, validateBody } from "../middleware/validate.js";
import { bookQuerySchema, createReviewSchema } from "../schemas/book.schema.js";
import {
  getBooks,
  getBookById,
  getFeaturedBook,
  getCategories,
  addReview,
} from "../services/bookService.js";
import { optionalAuthenticate } from "../middleware/auth.js";

const router = Router();

/**
 * @route   GET /api/books
 * @desc    Get all books with search, filter, sort & pagination
 * @access  Public
 */
router.get("/", validateQuery(bookQuerySchema), async (req, res, next) => {
  try {
    const result = await getBooks(req.validatedQuery || req.query);

    // Set standard pagination response headers
    res.setHeader("X-Total-Count", result.total);
    res.setHeader("X-Page", result.page);
    res.setHeader("X-Limit", result.limit);
    res.setHeader("X-Total-Pages", result.totalPages);

    // If consumer requested raw array format (e.g. ?raw=true)
    if (req.query.raw === "true" || req.headers["x-format"] === "raw") {
      return res.status(200).json(result.books);
    }

    res.status(200).json({
      success: true,
      count: result.books.length,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      data: result.books,
      books: result.books,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/books/featured
 * @desc    Get Book of the Week
 * @access  Public
 */
router.get("/featured", async (req, res, next) => {
  try {
    const featured = await getFeaturedBook();
    if (!featured) {
      return res.status(404).json({ success: false, message: "No featured book found" });
    }
    // Return book directly or wrapped
    if (req.query.raw === "true") {
      return res.status(200).json(featured);
    }
    res.status(200).json({
      success: true,
      data: featured,
      ...featured, // spreads fields so both res.data.title and res.title work!
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/books/categories
 * @desc    Get all available categories and count
 * @access  Public
 */
router.get("/categories", async (req, res, next) => {
  try {
    const categories = await getCategories();
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/books/:id
 * @desc    Get detailed book info with reviews
 * @access  Public
 */
router.get("/:id", async (req, res, next) => {
  try {
    const book = await getBookById(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: `Book with ID "${req.params.id}" not found`,
      });
    }

    if (req.query.raw === "true") {
      return res.status(200).json(book);
    }

    res.status(200).json({
      success: true,
      data: book,
      ...book, // spreads fields so both res.data.title and res.title work!
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/books/:id/reviews
 * @desc    Add a review to a book
 * @access  Public / Optional Auth
 */
router.post(
  "/:id/reviews",
  optionalAuthenticate,
  validateBody(createReviewSchema),
  async (req, res, next) => {
    try {
      const review = await addReview(req.params.id, {
        name: req.user?.name || req.body.name,
        rating: req.body.rating,
        text: req.body.text,
        userId: req.user?.id || null,
      });

      res.status(201).json({
        success: true,
        message: "Review submitted successfully",
        data: review,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
