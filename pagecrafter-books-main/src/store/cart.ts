import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Book } from "@/data/books";

export type Currency = "USD" | "EUR" | "GBP" | "INR";
export const RATES: Record<Currency, number> = { USD: 1, EUR: 0.92, GBP: 0.79, INR: 83 };
export const PROMOS: Record<string, number> = { READMORE10: 0.1, PAGE20: 0.2 };
export const FREE_SHIPPING_OVER = 50;
export const SHIPPING_FEE = 4.99;

export interface CartItem {
  id: string;
  title: string;
  author: string;
  price: number;
  format: Book["format"];
  cover: Book["cover"];
  quantity: number;
}

interface CartState {
  items: CartItem[];
  open: boolean;
  currency: Currency;
  promo: string | null;
  add: (b: Book, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  setOpen: (o: boolean) => void;
  setCurrency: (c: Currency) => void;
  applyPromo: (code: string) => boolean;
  clearPromo: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      open: false,
      currency: "USD",
      promo: null,
      add: (b, qty = 1) =>
        set((s) => {
          const ex = s.items.find((i) => i.id === b.id);
          if (ex) return { items: s.items.map((i) => (i.id === b.id ? { ...i, quantity: i.quantity + qty } : i)) };
          return {
            items: [...s.items, { id: b.id, title: b.title, author: b.author, price: b.price, format: b.format, cover: b.cover, quantity: qty }],
          };
        }),
      setQty: (id, qty) =>
        set((s) => ({ items: qty <= 0 ? s.items.filter((i) => i.id !== id) : s.items.map((i) => (i.id === id ? { ...i, quantity: qty } : i)) })),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [], promo: null }),
      setOpen: (open) => set({ open }),
      setCurrency: (currency) => set({ currency }),
      applyPromo: (code) => {
        const c = code.trim().toUpperCase();
        if (!(c in PROMOS)) return false;
        set({ promo: c });
        return true;
      },
      clearPromo: () => set({ promo: null }),
    }),
    { name: "pagecrafter-cart", partialize: (s) => ({ items: s.items, currency: s.currency, promo: s.promo }) },
  ),
);

export function computeTotals(items: CartItem[], promo: string | null) {
  const subtotal = items.reduce((n, i) => n + i.price * i.quantity, 0);
  const discount = promo ? subtotal * (PROMOS[promo] ?? 0) : 0;
  const shipping = subtotal === 0 || subtotal - discount >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE;
  return { subtotal, discount, shipping, total: subtotal - discount + shipping };
}

export function formatPrice(usd: number, currency: Currency) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(usd * RATES[currency]);
}

export function usePrice() {
  const currency = useCart((s) => s.currency);
  return (usd: number) => formatPrice(usd, currency);
}
