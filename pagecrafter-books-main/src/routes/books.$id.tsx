import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, BookOpenText, Check, X } from "lucide-react";
import { getBook } from "@/api/books";
import { BookCover } from "@/components/store/BookCover";
import { Stars } from "@/components/store/Stars";
import { AddToCartButton } from "@/components/store/AddToCartButton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePrice } from "@/store/cart";

export const Route = createFileRoute("/books/$id")({
  loader: async ({ params }) => {
    const book = await getBook(params.id);
    if (!book) throw notFound();
    return { book };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.book.title} by ${loaderData.book.author} — PageCrafter` },
          { name: "description", content: loaderData.book.synopsis.slice(0, 155) },
          { property: "og:title", content: `${loaderData.book.title} — PageCrafter` },
          { property: "og:description", content: loaderData.book.synopsis.slice(0, 155) },
          { property: "og:type", content: "book" },
          { name: "twitter:card", content: "summary" },
        ]
      : [{ title: "Book not found — PageCrafter" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-3xl font-semibold">Book not found</h1>
      <Button asChild className="mt-6"><Link to="/">Back to the shelves</Link></Button>
    </div>
  ),
  component: BookPage,
});

function BookPage() {
  const { book } = Route.useLoaderData();
  const price = usePrice();
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> All books</Link>
      <div className="mt-6 grid gap-10 md:grid-cols-[minmax(0,380px)_1fr]">
        <div className="rounded-lg bg-secondary p-10">
          <BookCover book={book} size="lg" className="mx-auto max-w-xs" />
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="mt-6 w-full"><BookOpenText /> Read a sample</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle className="font-serif text-2xl">{book.title} — Sample</DialogTitle></DialogHeader>
              <article className="max-h-[60vh] overflow-y-auto whitespace-pre-line rounded-md bg-secondary p-6 font-serif text-lg leading-relaxed">{book.sample}</article>
            </DialogContent>
          </Dialog>
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-forest">{book.category} · {book.format}</span>
          <h1 className="mt-2 text-4xl font-semibold md:text-5xl">{book.title}</h1>
          <p className="mt-1 text-lg text-muted-foreground">by {book.author}</p>
          <div className="mt-3 flex items-center gap-2">
            <Stars rating={book.rating} size={18} />
            <span className="text-sm text-muted-foreground">{book.rating} ({book.ratingCount.toLocaleString()} ratings)</span>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <span className="text-3xl font-bold">{price(book.price)}</span>
            <AddToCartButton book={book} size="lg" />
            <span className={`flex items-center gap-1 text-sm ${book.inStock ? "text-forest" : "text-destructive"}`}>
              {book.inStock ? <Check className="size-4" /> : <X className="size-4" />}{book.inStock ? "In stock" : "Out of stock"}
            </span>
          </div>
          <Tabs defaultValue="synopsis" className="mt-8">
            <TabsList>
              <TabsTrigger value="synopsis">Synopsis</TabsTrigger>
              <TabsTrigger value="author">Author</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
            <TabsContent value="synopsis" className="pt-3 leading-relaxed">{book.synopsis}</TabsContent>
            <TabsContent value="author" className="pt-3 leading-relaxed">{book.authorBio}</TabsContent>
            <TabsContent value="details" className="pt-3">
              <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                {[["ISBN", book.isbn], ["Pages", book.pages], ["Language", book.language], ["Publisher", book.publisher], ["Published", new Date(book.publishedAt).getFullYear()], ["Format", book.format]].map(([k, v]) => (
                  <div key={String(k)} className="rounded-md border border-border bg-card p-3"><dt className="text-xs text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>
                ))}
              </dl>
            </TabsContent>
          </Tabs>
          <section className="mt-10">
            <h2 className="text-2xl font-semibold">Customer reviews</h2>
            <ul className="mt-4 space-y-4">
              {book.reviews.map((r) => (
                <li key={r.name} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center justify-between"><span className="font-semibold">{r.name}</span><span className="text-xs text-muted-foreground">{r.date}</span></div>
                  <Stars rating={r.rating} className="mt-1" />
                  <p className="mt-2 text-sm">{r.text}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
