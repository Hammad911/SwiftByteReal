"use client";

import { useCartStore, selectCartSubtotal, selectCartItemCount } from "@/store/cartStore";
import { useRouter } from "next/navigation";
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  Trash2,
  ArrowUpRight,
} from "lucide-react";
import Image from "next/image";

export default function CartDrawer() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const subtotal = useCartStore(selectCartSubtotal);
  const itemCount = useCartStore(selectCartItemCount);
  const restaurantName = useCartStore((s) => s.restaurantName);

  if (!isOpen) return null;

  const deliveryFee = 2.99;
  const total = subtotal + deliveryFee;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-night/70 backdrop-blur-sm animate-fade-in"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-surface border-l border-gold/15 shadow-2xl flex flex-col animate-slide-down">
        {/* Decorative top glow */}
        <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-40 w-72 bg-gold/15 blur-3xl rounded-full" />

        {/* Header */}
        <div className="relative flex items-center justify-between border-b border-gold/15 px-6 py-5">
          <div>
            <span className="eyebrow">— Your Order</span>
            <h2 className="font-playfair italic text-2xl text-cream mt-1">
              {restaurantName ?? "Cart"}
            </h2>
          </div>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="flex h-9 w-9 items-center justify-center rounded-full text-cream/70 hover:text-gold hover:bg-gold/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Items */}
        <div className="relative flex-1 overflow-y-auto px-6 py-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-elevated border border-gold/15">
                <ShoppingBag className="h-7 w-7 text-gold/60" />
              </div>
              <div>
                <p className="font-playfair italic text-2xl text-cream">
                  Your cart is empty
                </p>
                <p className="font-lora text-sm text-ink-secondary mt-2 max-w-xs">
                  Add something delicious from a restaurant to get started.
                </p>
              </div>
              <button onClick={closeCart} className="btn-gold mt-2">
                Browse Restaurants
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-4 rounded-2xl border border-gold/10 bg-elevated/50 p-3 hover:border-gold/25 transition-colors"
                >
                  {item.photo && (
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl">
                      <Image
                        src={item.photo}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 flex flex-col">
                    <p className="font-playfair italic text-base text-cream truncate leading-tight">
                      {item.name}
                    </p>
                    {item.customisations.length > 0 && (
                      <p className="font-mono text-[10px] tracking-widest uppercase text-ink-secondary mt-1 truncate">
                        {item.customisations.map((c) => c.optionName).join(" · ")}
                      </p>
                    )}
                    <p className="font-bebas text-lg text-gold tracking-wide mt-auto">
                      ${item.itemTotal.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end justify-between gap-2">
                    <button
                      onClick={() => removeItem(item.id)}
                      aria-label="Remove item"
                      className="text-ink-secondary hover:text-flame transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <div className="flex items-center gap-1.5 rounded-full border border-gold/25 bg-night/40 px-1.5 py-1">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        aria-label="Decrease"
                        className="flex h-6 w-6 items-center justify-center rounded-full text-cream/70 hover:text-gold hover:bg-gold/10 transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="font-bebas text-sm text-cream tracking-wide w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        aria-label="Increase"
                        className="flex h-6 w-6 items-center justify-center rounded-full text-cream/70 hover:text-gold hover:bg-gold/10 transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="relative border-t border-gold/15 px-6 py-5 bg-surface">
            {/* Totals */}
            <div className="space-y-2.5 mb-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-widest uppercase text-ink-secondary">
                  Subtotal · {itemCount} {itemCount === 1 ? "item" : "items"}
                </span>
                <span className="font-lora text-sm text-cream">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-widest uppercase text-ink-secondary">
                  Delivery
                </span>
                <span className="font-lora text-sm text-cream">
                  ${deliveryFee.toFixed(2)}
                </span>
              </div>
              <div className="divider-gold my-3" />
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[10px] tracking-widest uppercase text-gold">
                  Total
                </span>
                <span className="font-bebas text-3xl text-cream tracking-wide leading-none">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                closeCart();
                router.push("/checkout");
              }}
              className="btn-gold w-full"
            >
              Checkout <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
