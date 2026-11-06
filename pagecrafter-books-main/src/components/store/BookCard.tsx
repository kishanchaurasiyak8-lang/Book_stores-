import { Link } from "@tanstack/react-router";
import type { Book } from "@/data/books";
import { usePrice } from "@/store/cart";
import { BookCover } from "./BookCover";
import { Stars } from "./Stars";
import { AddToCartButton } from "./AddToCartButton";

export function BookCard({ book }: { book: Book }) {
  const price = usePrice();
  return (
    <Link
      to="/books/$id"
      params={{ id: book.id }}
      className="group flex flex-col rounded-lg border border-border bg-card p-3 transition-all hover:-translate-y-1 hover:shadow-book"
    >
      <div className="relative bg-gradient-to-br from-slate-700 to-slate-900 px-3 py-5 sm:px-6 rounded-md overflow-hidden">
        <BookCover book={book} className="transition-transform duration-300 group-hover:scale-[1.03]" />
        <span className="absolute left-2 top-2 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
          {book.format}
        </span>
        {!book.inStock && (
          <span className="absolute right-2 top-2 rounded-full bg-destructive px-2 py-0.5 text-[10px] font-semibold text-destructive-foreground">
            Sold out
          </span>
        )}
      </div>
      <div className="mt-3 flex flex-1 flex-col">
        <h3 className="line-clamp-1 text-lg font-semibold">{book.title}</h3>
        <p className="text-sm text-muted-foreground">{book.author}</p>
        <div className="mt-1 flex items-center gap-1.5">
          <Stars rating={book.rating} />
          <span className="text-xs text-muted-foreground">({book.ratingCount.toLocaleString()})</span>
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
          <span className="text-lg font-bold">{price(book.price)}</span>
          <AddToCartButton book={book} size="sm" />
        </div>
      </div>
    </Link>
  );
}
