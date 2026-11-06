import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Banknote, Check, CreditCard, Loader2, PartyPopper } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CartSummary } from "@/components/store/CartDrawer";
import { BookCover } from "@/components/store/BookCover";
import { computeTotals, useCart, usePrice } from "@/store/cart";
import { createOrder, type ShippingAddress } from "@/api/orders";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — PageCrafter" },
      { name: "description", content: "Complete your PageCrafter order in three quick steps." },
      { property: "og:title", content: "Checkout — PageCrafter" },
      { property: "og:description", content: "Complete your PageCrafter order in three quick steps." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Checkout,
});

const shippingSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  address: z.string().trim().min(4, "Enter your street address").max(200),
  city: z.string().trim().min(2, "Enter your city").max(100),
  postalCode: z.string().trim().min(3, "Enter a postal code").max(20),
  country: z.string().trim().min(2, "Enter your country").max(60),
});

const STEPS = ["Shipping", "Payment", "Review"];

function Checkout() {
  const { items, promo, currency, clear } = useCart();
  const price = usePrice();
  const [step, setStep] = useState(0);
  const [ship, setShip] = useState<ShippingAddress>({ fullName: "", email: "", address: "", city: "", postalCode: "", country: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [method, setMethod] = useState<"stripe" | "cod">("stripe");
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  if (orderId) {
    return (
      <main className="mx-auto max-w-lg px-4 py-24 text-center">
        <PartyPopper className="mx-auto size-12 text-accent" />
        <h1 className="mt-4 text-4xl font-semibold">Thank you!</h1>
        <p className="mt-2 text-muted-foreground">Your order <strong className="text-foreground">{orderId}</strong> is confirmed. A receipt is on its way to {ship.email}.</p>
        <Button asChild className="mt-8"><Link to="/">Continue shopping</Link></Button>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-3xl font-semibold">Your cart is empty</h1>
        <Button asChild className="mt-6"><Link to="/">Find your next book</Link></Button>
      </main>
    );
  }

  const nextFromShipping = () => {
    const r = shippingSchema.safeParse(ship);
    if (!r.success) {
      setErrors(Object.fromEntries(r.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    setErrors({});
    setStep(1);
  };

  const place = async () => {
    setPlacing(true);
    try {
      const t = computeTotals(items, promo);
      const order = await createOrder({
        items: items.map((i) => ({ bookId: i.id, quantity: i.quantity, price: i.price })),
        shipping: ship,
        paymentMethod: method,
        promoCode: promo ?? undefined,
        total: t.total,
        currency,
      });
      clear();
      setOrderId(order.id);
    } catch {
      toast.error("We couldn't place your order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  const field = (k: keyof ShippingAddress, label: string, type = "text", span = false) => (
    <div className={span ? "sm:col-span-2" : ""}>
      <Label htmlFor={k}>{label}</Label>
      <Input id={k} type={type} value={ship[k]} onChange={(e) => setShip({ ...ship, [k]: e.target.value })} className="mt-1.5" aria-invalid={!!errors[k]} />
      {errors[k] && <p className="mt-1 text-xs text-destructive">{errors[k]}</p>}
    </div>
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl font-semibold">Checkout</h1>
      <ol className="mt-6 flex items-center gap-2 text-sm">
        {STEPS.map((s, i) => (
          <li key={s} className="flex items-center gap-2">
            <span className={`grid size-7 place-items-center rounded-full text-xs font-bold ${i < step ? "bg-forest text-forest-foreground" : i === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {i < step ? <Check className="size-4" /> : i + 1}
            </span>
            <span className={i === step ? "font-semibold" : "text-muted-foreground"}>{s}</span>
            {i < STEPS.length - 1 && <span className="mx-2 h-px w-8 bg-border" />}
          </li>
        ))}
      </ol>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="rounded-lg border border-border bg-card p-6">
          {step === 0 && (
            <>
              <h2 className="text-2xl font-semibold">Shipping address</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {field("fullName", "Full name", "text", true)}
                {field("email", "Email", "email", true)}
                {field("address", "Street address", "text", true)}
                {field("city", "City")}
                {field("postalCode", "Postal code")}
                {field("country", "Country", "text", true)}
              </div>
              <Button className="mt-6" size="lg" onClick={nextFromShipping}>Continue to payment</Button>
            </>
          )}
          {step === 1 && (
            <>
              <h2 className="text-2xl font-semibold">Payment method</h2>
              <RadioGroup value={method} onValueChange={(v) => setMethod(v as "stripe" | "cod")} className="mt-5 gap-3">
                {[
                  { v: "stripe", icon: CreditCard, t: "Card (Stripe)", d: "Demo mode — no real charge is made." },
                  { v: "cod", icon: Banknote, t: "Cash on Delivery", d: "Pay when your books arrive." },
                ].map(({ v, icon: Icon, t, d }) => (
                  <Label key={v} htmlFor={v} className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 ${method === v ? "border-accent bg-accent/10" : "border-border"}`}>
                    <RadioGroupItem value={v} id={v} />
                    <Icon className="size-5" />
                    <span><span className="block font-semibold">{t}</span><span className="block text-xs font-normal text-muted-foreground">{d}</span></span>
                  </Label>
                ))}
              </RadioGroup>
              {method === "stripe" && (
                <div className="mt-4 grid gap-3 rounded-lg border border-dashed border-border p-4 sm:grid-cols-3">
                  <Input placeholder="4242 4242 4242 4242" className="sm:col-span-3" aria-label="Card number" />
                  <Input placeholder="MM / YY" aria-label="Expiry" />
                  <Input placeholder="CVC" aria-label="CVC" />
                </div>
              )}
              <div className="mt-6 flex gap-3">
                <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
                <Button size="lg" onClick={() => setStep(2)}>Review order</Button>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <h2 className="text-2xl font-semibold">Review your order</h2>
              <ul className="mt-5 divide-y divide-border">
                {items.map((i) => (
                  <li key={i.id} className="flex items-center gap-3 py-3">
                    <BookCover book={i} size="sm" className="w-10 shrink-0" />
                    <span className="flex-1"><span className="block font-medium">{i.title}</span><span className="text-xs text-muted-foreground">Qty {i.quantity} · {i.format}</span></span>
                    <span className="font-semibold">{price(i.price * i.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                <div className="rounded-md bg-muted p-3"><p className="text-xs font-bold uppercase text-muted-foreground">Ship to</p><p>{ship.fullName}<br />{ship.address}, {ship.city} {ship.postalCode}<br />{ship.country}</p></div>
                <div className="rounded-md bg-muted p-3"><p className="text-xs font-bold uppercase text-muted-foreground">Payment</p><p>{method === "stripe" ? "Card (Stripe, demo)" : "Cash on Delivery"}</p></div>
              </div>
              <div className="mt-6 flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button size="lg" onClick={place} disabled={placing}>{placing && <Loader2 className="animate-spin" />}Place order</Button>
              </div>
            </>
          )}
        </section>
        <aside className="self-start rounded-lg border border-border bg-card p-6 lg:sticky lg:top-24">
          <h3 className="mb-4 text-xl font-semibold">Order summary</h3>
          <CartSummary />
        </aside>
      </div>
    </main>
  );
}
