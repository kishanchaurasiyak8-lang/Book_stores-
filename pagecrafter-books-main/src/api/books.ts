import { BOOKS, BOOK_OF_THE_WEEK_ID, type Book } from "@/data/books";
import { apiFetch, hasBackend } from "./client";

export async function getBooks(): Promise<Book[]> {
  if (hasBackend()) {
    const res = await apiFetch<any>("/books");
    return Array.isArray(res) ? res : (res.data || res.books || []);
  }
  return BOOKS;
}

export async function getBook(id: string): Promise<Book | null> {
  if (hasBackend()) {
    try {
      const res = await apiFetch<any>(`/books/${encodeURIComponent(id)}`);
      return res?.data ?? res ?? null;
    } catch {
      return null;
    }
  }
  return BOOKS.find((b) => b.id === id) ?? null;
}

export async function getBookOfTheWeek(): Promise<Book> {
  if (hasBackend()) {
    try {
      const res = await apiFetch<any>("/books/featured");
      return res?.data ?? res ?? BOOKS.find((b) => b.id === BOOK_OF_THE_WEEK_ID)!;
    } catch {
      return BOOKS.find((b) => b.id === BOOK_OF_THE_WEEK_ID)!;
    }
  }
  return BOOKS.find((b) => b.id === BOOK_OF_THE_WEEK_ID)!;
}

export async function searchBooks(q: string): Promise<Book[]> {
  if (hasBackend()) {
    const res = await apiFetch<any>(`/books?q=${encodeURIComponent(q)}`);
    return Array.isArray(res) ? res : (res.data || res.books || []);
  }
  const s = q.trim().toLowerCase();
  if (!s) return [];
  return BOOKS.filter((b) => b.title.toLowerCase().includes(s) || b.author.toLowerCase().includes(s));
}
