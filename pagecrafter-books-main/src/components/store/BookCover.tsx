import type { Book } from "@/data/books";
import { cn } from "@/lib/utils";

export function BookCover({
  book,
  className,
  size = "md",
}: {
  book: Pick<Book, "title" | "author" | "cover"> & { cover_image_url?: string; coverImageUrl?: string };
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const { from, to, ink } = book.cover ?? { from: "oklch(0.35 0.06 155)", to: "oklch(0.22 0.04 160)", ink: "#ffffff" };
  const imageUrl = book.cover_image_url || book.coverImageUrl;

  return (
    <div
      className={cn("relative aspect-[2/3] overflow-hidden rounded-sm shadow-book bg-gradient-to-br from-slate-700 to-slate-900 flex flex-col items-center justify-center text-center", className)}
      style={{ background: `linear-gradient(155deg, ${from}, ${to})`, color: ink }}
      role="img"
      aria-label={`Cover of ${book.title}`}
    >
      <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-foreground/25 to-transparent z-10 pointer-events-none" />
      <div className={cn("flex h-full flex-col justify-between z-0 w-full", size === "sm" ? "p-2" : size === "lg" ? "p-8" : "p-2 sm:p-4")}>
        <div className="h-px w-8 bg-current opacity-60" />
        <div className="text-center my-auto">
          <p className={cn("break-words font-serif font-semibold leading-tight text-white", size === "sm" ? "text-[10px]" : size === "lg" ? "text-4xl" : "text-xs sm:text-lg")}>
            {book.title}
          </p>
          <p className={cn("mt-2 break-words uppercase text-slate-300 opacity-80", size === "sm" ? "text-[6px]" : size === "lg" ? "text-sm" : "text-[7px] sm:text-[9px]")}>
            {book.author}
          </p>
        </div>
      </div>
      {imageUrl && (
        <img
          src={imageUrl}
          alt={book.title}
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
          className="absolute inset-0 size-full object-cover z-20"
        />
      )}
    </div>
  );
}
