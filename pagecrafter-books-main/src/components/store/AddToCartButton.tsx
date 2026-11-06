import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { Book } from "@/data/books";
import { useCart } from "@/store/cart";
import { cn } from "@/lib/utils";

export function AddToCartButton({ book, className, size = "default" }: { book: Book; className?: string; size?: "default" | "sm" | "lg" }) {
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);
  return (
    <Button
      size={size}
      disabled={!book.inStock}
      className={cn("transition-all active:scale-95", added && "bg-forest text-forest-foreground hover:bg-forest", className)}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        add(book);
        setAdded(true);
        toast.success(`Added “${book.title}” to your cart`);
        setTimeout(() => setAdded(false), 1400);
      }}
    >
      {added ? <Check className="animate-in zoom-in" /> : <ShoppingBag />}
      {!book.inStock ? "Out of stock" : added ? "Added" : "Add to Cart"}
    </Button>
  );
}
