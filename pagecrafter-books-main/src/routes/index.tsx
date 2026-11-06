import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SlidersHorizontal, Sparkles, X } from "lucide-react";
import { z } from "zod";
import { getBookOfTheWeek, getBooks } from "@/api/books";
import { CATEGORIES } from "@/data/books";
import { BookCard } from "@/components/store/BookCard";
import { BookCover } from "@/components/store/BookCover";
import { Stars } from "@/components/store/Stars";
import { AddToCartButton } from "@/components/store/AddToCartButton";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePrice } from "@/store/cart";

const searchSchema = z.object({ genre: z.enum(CATEGORIES).optional() });

export const Route = createFileRoute("/")({
  validateSearch: searchSchema,
  loader: async () => ({ books: await getBooks(), featured: await getBookOfTheWeek() }),
  head: () => ({
    meta: [
      { title: "PageCrafter — Thoughtfully curated books online" },
      { name: "description", content: "Browse fiction, non-fiction, tech, academic and classic books at PageCrafter. Fast shipping, fair prices." },
      { property: "og:title", content: "PageCrafter — Thoughtfully curated books online" },
      { property: "og:description", content: "Browse fiction, non-fiction, tech, academic and classic books at PageCrafter." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Sort = "popularity" | "newest" | "price-asc" | "price-desc";

function Index() {
  const { books } = Route.useLoaderData();
  const { genre } = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const price = usePrice();
  const maxPrice = Math.ceil(Math.max(...books.map((b) => b.price)));
  const [range, setRange] = useState<[number, number]>([0, maxPrice]);
  const [minRating, setMinRating] = useState(0);
  const [author, setAuthor] = useState("all");
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState<Sort>("popularity");
  const [showFilters, setShowFilters] = useState(false);
  const authors = useMemo(() => [...new Set(books.map((b) => b.author))].sort(), [books]);

  const list = useMemo(() => {
    const f = books.filter(
      (b) =>
        (!genre || b.category === genre) &&
        b.price >= range[0] && b.price <= range[1] &&
        b.rating >= minRating &&
        (author === "all" || b.author === author) &&
        (!inStock || b.inStock),
    );
    return f.sort((a, b) =>
      sort === "price-asc" ? a.price - b.price : sort === "price-desc" ? b.price - a.price : sort === "newest" ? b.publishedAt.localeCompare(a.publishedAt) : b.popularity - a.popularity,
    );
  }, [books, genre, range, minRating, author, inStock, sort]);

  const reset = () => { setRange([0, maxPrice]); setMinRating(0); setAuthor("all"); setInStock(false); navigate({ search: {} }); };

  const filters = (
    <div className="space-y-6">
      <div>
        <h4 className="mb-2 font-sans text-xs font-bold uppercase tracking-widest text-muted-foreground">Genre</h4>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => navigate({ search: {} })} className={`rounded-full border px-3 py-1 text-sm ${!genre ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"}`}>All</button>
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => navigate({ search: { genre: c } })} className={`rounded-full border px-3 py-1 text-sm ${genre === c ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"}`}>{c}</button>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-3 font-sans text-xs font-bold uppercase tracking-widest text-muted-foreground">Price</h4>
        <Slider min={0} max={maxPrice} step={1} value={range} onValueChange={(v) => setRange([v[0] ?? 0, v[1] ?? maxPrice])} />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>{price(range[0])}</span><span>{price(range[1])}</span></div>
      </div>
      <div>
        <h4 className="mb-2 font-sans text-xs font-bold uppercase tracking-widest text-muted-foreground">Rating</h4>
        <div className="flex gap-2">
          {[0, 4, 4.5].map((r) => (
            <button key={r} onClick={() => setMinRating(r)} className={`rounded-md border px-3 py-1 text-sm ${minRating === r ? "border-accent bg-accent text-accent-foreground" : "border-border hover:bg-muted"}`}>{r === 0 ? "Any" : `${r}+ ★`}</button>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-2 font-sans text-xs font-bold uppercase tracking-widest text-muted-foreground">Author</h4>
        <Select value={author} onValueChange={setAuthor}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All authors</SelectItem>
            {authors.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="stock" checked={inStock} onCheckedChange={(v) => setInStock(v === true)} />
        <Label htmlFor="stock">In stock only</Label>
      </div>
      <Button variant="ghost" size="sm" onClick={reset}>Reset filters</Button>
    </div>
  );

  return (
    <main>
      <section id="browse" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-3xl font-semibold">{genre ?? "All books"}</h2>
            <p className="text-sm text-muted-foreground">{list.length} titles</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="lg:hidden" onClick={() => setShowFilters((s) => !s)}>
              {showFilters ? <X /> : <SlidersHorizontal />} Filters
            </Button>
            <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
              <SelectTrigger className="w-[180px]" aria-label="Sort"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">Most popular</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-asc">Price: low to high</SelectItem>
                <SelectItem value="price-desc">Price: high to low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className={`${showFilters ? "block" : "hidden"} rounded-lg border border-border bg-card p-4 lg:block lg:self-start lg:sticky lg:top-24`}>{filters}</aside>
          {list.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
              No books match these filters. <button className="underline" onClick={reset}>Reset</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {list.map((b) => <BookCard key={b.id} book={b} />)}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
