import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag, Tag } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { computeTotals, FREE_SHIPPING_OVER, useCart, usePrice } from "@/store/cart";
import { BookCover } from "./BookCover";

export function CartSummary() {
  const { items, promo, applyPromo, clearPromo } = useCart();
  const price = usePrice();
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const t = computeTotals(items, promo);
  return (
    <div className="space-y-3 text-sm">
      {promo ? (
        <div className="flex items-center justify-between rounded-md bg-forest/10 px-3 py-2 text-forest">
          <span className="flex items-center gap-2 font-medium"><Tag className="size-4" />{promo} applied</span>
          <button className="text-xs underline" onClick={clearPromo}>Remove</button>
        </div>
      ) : (
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!applyPromo(code)) setErr("That code isn't valid. Try READMORE10.");
            else { setErr(""); setCode(""); }
          }}
        >
          <Input placeholder="Promo code" value={code} onChange={(e) => setCode(e.target.value)} />
          <Button type="submit" variant="outline">Apply</Button>
        </form>
      )}
      {err && <p className="text-xs text-destructive">{err}</p>}
      <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{price(t.subtotal)}</span></div>
      {t.discount > 0 && <div className="flex justify-between text-forest"><span>Discount</span><span>−{price(t.discount)}</span></div>}
      <div className="flex justify-between">
        <span className="text-muted-foreground">Estimated shipping</span>
        <span>{t.shipping === 0 ? "Free" : price(t.shipping)}</span>
      </div>
      {t.shipping > 0 && (
        <p className="text-xs text-muted-foreground">Add {price(FREE_SHIPPING_OVER - (t.subtotal - t.discount))} more for free shipping.</p>
      )}
      <div className="flex justify-between border-t border-border pt-3 text-base font-bold"><span>Total</span><span>{price(t.total)}</span></div>
    </div>
  );
}

export function CartDrawer() {
  const { items, open, setOpen, setQty, remove } = useCart();
  const price = usePrice();
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader className="border-b border-border">
          <SheetTitle className="font-serif text-2xl">Your cart</SheetTitle>
        </SheetHeader>
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <ShoppingBag className="size-10 text-muted-foreground" />
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Button variant="outline" onClick={() => setOpen(false)}>Keep browsing</Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border overflow-y-auto px-4">
              {items.map((i) => (
                <li key={i.id} className="flex gap-3 py-4">
                  <BookCover book={i} size="sm" className="w-14 shrink-0" />
                  <div className="flex flex-1 flex-col">
                    <p className="font-semibold leading-tight">{i.title}</p>
                    <p className="text-xs text-muted-foreground">{i.author} · {i.format}</p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-md border border-border">
                        <button aria-label="Decrease" className="p-1.5 hover:bg-muted" onClick={() => setQty(i.id, i.quantity - 1)}><Minus className="size-3.5" /></button>
                        <span className="w-8 text-center text-sm tabular-nums">{i.quantity}</span>
                        <button aria-label="Increase" className="p-1.5 hover:bg-muted" onClick={() => setQty(i.id, i.quantity + 1)}><Plus className="size-3.5" /></button>
                      </div>
                      <span className="font-semibold">{price(i.price * i.quantity)}</span>
                    </div>
                  </div>
                  <button aria-label="Remove" className="self-start text-muted-foreground hover:text-destructive" onClick={() => remove(i.id)}>
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="space-y-4 border-t border-border p-4">
              <CartSummary />
              <Button asChild size="lg" className="w-full" onClick={() => setOpen(false)}>
                <Link to="/checkout">Checkout</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
