import { z } from "zod";

export const bookQuerySchema = z.object({
  search: z.string().trim().optional(),
  q: z.string().trim().optional(), // alias for search
  category: z.string().trim().optional(),
  grade_level: z.string().trim().optional(),
  gradeLevel: z.string().trim().optional(),
  author: z.string().trim().optional(),
  format: z.enum(["hardcover", "paperback", "ebook", "Hardcover", "Paperback", "eBook"]).optional(),
  sort: z
    .enum(["price-asc", "price-desc", "newest", "popularity", "rating", "title"])
    .default("popularity")
    .optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(12).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  inStock: z
    .string()
    .transform((val) => val === "true" || val === "1")
    .optional(),
});

export const createReviewSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  rating: z.coerce.number().min(1, "Rating must be between 1 and 5").max(5, "Rating must be between 1 and 5"),
  text: z.string().trim().min(4, "Review text must be at least 4 characters").max(2000),
});

