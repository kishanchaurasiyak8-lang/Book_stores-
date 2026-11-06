import { describe, expect, it } from "vitest";
import { computeTotals, type CartItem } from "@/store/cart";

const item = (price: number, quantity = 1): CartItem => ({
  id: String(price), title: "t", author: "a", price, quantity, format: "Paperback",
  cover: { from: "", to: "", ink: "" },
});

describe("cart totals", () => {
  it("charges 4.99 shipping under $50", () => {
    expect(computeTotals([item(20)], null).shipping).toBe(4.99);
  });
  it("ships free at $50 or more", () => {
    expect(computeTotals([item(25, 2)], null).shipping).toBe(0);
  });
  it("READMORE10 takes 10% off", () => {
    expect(computeTotals([item(100)], "READMORE10").discount).toBeCloseTo(10);
  });
});
