import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { BookOpen, ChevronDown, Search, ShoppingBag } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, type Book } from "@/data/books";
import { searchBooks } from "@/api/books";
import { RATES, useCart, usePrice, type Currency } from "@/store/cart";
import { BookCover } from "./BookCover";

function SearchBox() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Book[]>([]);
  const [focus, setFocus] = useState(false);
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const price = usePrice();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let live = true;
    searchBooks(q).then((r) => live && (setResults(r.slice(0, 6)), setActive(0)));
    return () => { live = false; };
  }, [q]);

  const go = (b: Book) => { setQ(""); setFocus(false); navigate({ to: "/books/$id", params: { id: b.id } }); };
  const show = focus && q.trim().length > 0;

  return (
    <div ref={ref} className="relative w-full" onBlur={(e) => !ref.current?.contains(e.relatedTarget as Node) && setFocus(false)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setFocus(true)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
          if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
          if (e.key === "Enter" && results[active]) go(results[active]);
          if (e.key === "Escape") setFocus(false);
        }}
        placeholder="Search titles or authors…"
        aria-label="Search books"
        className="h-10 w-full rounded-full border border-border bg-card pl-9 pr-4 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-ring/30"
      />
      {show && (
        <div className="absolute inset-x-0 top-12 z-50 overflow-hidden rounded-lg border border-border bg-popover shadow-book animate-in fade-in slide-in-from-top-1">
          {results.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No books match “{q}”.</p>
          ) : (
            <ul>
              {results.map((b, i) => (
                <li key={b.id}>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => go(b)}
                    onMouseEnter={() => setActive(i)}
                    className={`flex w-full items-center gap-3 px-3 py-2 text-left ${i === active ? "bg-muted" : ""}`}
                  >
                    <BookCover book={b} size="sm" className="w-8 shrink-0" />
                    <span className="flex-1">
                      <span className="block text-sm font-medium">{b.title}</span>
                      <span className="block text-xs text-muted-foreground">{b.author}</span>
                    </span>
                    <span className="text-sm font-semibold">{price(b.price)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export function Header() {
  const { items, setOpen, currency, setCurrency } = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const count = mounted ? items.reduce((n, i) => n + i.quantity, 0) : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 md:flex-nowrap md:gap-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground"><BookOpen className="size-5" /></span>
          <span className="font-serif text-xl font-semibold tracking-tight">PageCrafter</span>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger className="hidden items-center gap-1 text-sm font-medium hover:text-accent-foreground md:flex">
            Categories <ChevronDown className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem asChild><Link to="/" search={{}}>All books</Link></DropdownMenuItem>
            {CATEGORIES.map((c) => (
              <DropdownMenuItem key={c} asChild>
                <Link to="/" search={{ genre: c }} hash="browse">{c}</Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="order-last w-full md:order-none md:flex-1"><SearchBox /></div>

        <div className="ml-auto flex items-center gap-2">
          <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
            <SelectTrigger className="h-9 w-[84px]" aria-label="Currency"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.keys(RATES) as Currency[]).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <button
            onClick={() => setOpen(true)}
            aria-label={`Open cart, ${count} items`}
            className="relative grid size-10 place-items-center rounded-full border border-border bg-card transition hover:bg-muted"
          >
            <ShoppingBag className="size-5" />
            {count > 0 && (
              <span key={count} className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-accent-foreground animate-in zoom-in">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
      <nav className="flex gap-4 overflow-x-auto px-4 pb-2 text-sm md:hidden">
        {CATEGORIES.map((c) => <Link key={c} to="/" search={{ genre: c }} hash="browse" className="whitespace-nowrap text-muted-foreground">{c}</Link>)}
      </nav>
    </header>
  );
}
