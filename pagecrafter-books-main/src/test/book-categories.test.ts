import { describe, expect, it } from "vitest";
import { BOOKS, CATEGORIES } from "@/data/books";
import { getBooks, searchBooks } from "@/api/books";
import { Route } from "@/routes/index";

describe("Requested book categories", () => {
  for (const category of ["Love Stories", "CSE", "CSE AI/ML", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Comics"] as const) {
    it(`includes books and accepts filtering for ${category}`, async () => {
      expect(CATEGORIES).toContain(category);
      expect(BOOKS.some((book) => book.category === category)).toBe(true);
      expect((await getBooks()).some((book) => book.category === category)).toBe(true);
      const validator = Route.options.validateSearch;
      if (!validator || typeof validator !== "object" || !("parse" in validator)) throw new Error("Missing category validator");
      expect(validator.parse({ genre: category })).toEqual({ genre: category });
    });
  }

  it("finds new study books through title search", async () => {
    expect((await searchBooks("Machine Learning")).map((book) => book.id)).toContain("aiml-machine-learning-python");
  });
});