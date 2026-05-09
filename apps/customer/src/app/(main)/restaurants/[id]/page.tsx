"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Star, Clock, Bike, MapPin, Heart, Share2, ChevronLeft,
  Plus, Minus, ShoppingBag, Flame, Leaf, Loader2,
} from "lucide-react";
import { restaurantApi } from "@/lib/api";
import { fallbackBannerUrl, fallbackMenuItemPhotoUrl } from "@/lib/foodImages";
import { useCartStore, selectCartSubtotal, selectCartItemCount } from "@/store/cartStore";

// ── Normalise API data to the shape the UI uses ──────────────────────────────
function normaliseRestaurant(r: any) {
  const cuisines: string[] = r.cuisineTypes ?? [];
  const menu: { id: string; name: string; items: { id: string; name: string; description: string; price: number; photo: string; popular: boolean; tags: string[] }[] }[] = (r.menuCategories ?? []).map((cat: any) => ({
    id:    cat.id,
    name:  cat.name,
    items: (cat.items ?? []).map((item: any) => ({
      id:          item.id,
      name:        item.name,
      description: item.description || "",
      price:       item.price,
      photo:       item.photo || fallbackMenuItemPhotoUrl(item.id),
      popular:     item.isFeatured ?? false,
      tags:        item.dietaryTags ?? [],
    })),
  })).filter((cat: any) => cat.items.length > 0);

  // If no categories yet, show a placeholder
  if (menu.length === 0) {
    menu.push({ id: "menu", name: "Menu", items: [] });
  }

  return {
    id:           r.id,
    name:         r.name,
    cuisine:      cuisines.map((c: string) => c.charAt(0).toUpperCase() + c.slice(1)).join(", ") || "Various",
    description:  r.description || "Delicious food crafted with care.",
    rating:       r.rating ?? 4.5,
    totalRatings: r._count?.ratings ?? 0,
    prepTime:     r.prepTime ? `${r.prepTime}–${r.prepTime + 10} min` : "20–30 min",
    deliveryFee:  r.deliveryFee ?? 0,
    minOrder:     r.minOrder ?? 0,
    address:      r.address || "Islamabad",
    distance:     "—",
    hours:        r.isOpen ? "Open Now" : "Closed",
    banner:       r.banner || fallbackBannerUrl(r.id),
    isOpen:       r.isOpen ?? true,
    menu,
  };
}

export default function RestaurantPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();

  const { data: apiData, isLoading, isError } = useQuery({
    queryKey: ["restaurant-detail", id],
    queryFn: () => restaurantApi.get(id).then((r) => r.data.data),
    enabled: !!id,
    retry: false,
  });

  const restaurant = apiData ? normaliseRestaurant(apiData) : null;

  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const items = useCartStore((s) => s.items);
  const openCart = useCartStore((s) => s.openCart);
  const itemCount = useCartStore(selectCartItemCount);
  const subtotal = useCartStore(selectCartSubtotal);
  const addItem = useCartStore((s) => s.addItem);
  const restaurantId = useCartStore((s) => s.restaurantId);
  const cartHere = restaurantId === id ? items : [];
  const itemQty  = (menuItemId: string) =>
    cartHere.filter((i) => i.menuItemId === menuItemId).reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    if (restaurant && !activeSection) setActiveSection(restaurant.menu[0]?.id ?? null);
  }, [restaurant, activeSection]);

  useEffect(() => {
    if (!restaurant) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id.replace("section-", ""));
        });
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 }
    );
    Object.values(sectionRefs.current).forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [restaurant]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-night">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-gold animate-spin" />
          <p className="font-lora text-ink-secondary">Loading restaurant…</p>
        </div>
      </div>
    );
  }

  // Not found / error
  if (isError || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-night px-6">
        <div className="text-center">
          <p className="font-mono text-xs tracking-widest text-gold uppercase mb-4">✦ 404</p>
          <h1 className="font-playfair italic text-4xl text-cream mb-4">Restaurant not found</h1>
          <p className="font-lora text-ink-secondary mb-8">We couldn't find what you were looking for.</p>
          <Link href="/restaurants" className="btn-gold">Browse Restaurants</Link>
        </div>
      </div>
    );
  }

  const handleAdd = (item: { id: string; name: string; photo: string; price: number }) => {
    if (restaurantId && restaurantId !== id) {
      const ok = confirm("Your cart has items from another restaurant. Clear cart and start fresh?");
      if (!ok) return;
      useCartStore.setState({ items: [], restaurantId: null, restaurantName: null });
    }
    if (!restaurantId) {
      useCartStore.setState({ restaurantId: id, restaurantName: restaurant.name });
    }
    addItem({ menuItemId: item.id, name: item.name, photo: item.photo, price: item.price, quantity: 1, customisations: [] });
  };

  const scrollToSection = (sectionId: string) => {
    const el = sectionRefs.current[sectionId];
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 200, behavior: "smooth" });
  };

  return (
    <div className="bg-night min-h-screen">

      {/* ═══ HERO BANNER ═══ */}
      <section className="relative h-[70vh] min-h-[480px] overflow-hidden">
        <Image
          src={restaurant.banner}
          alt={restaurant.name}
          fill priority sizes="100vw"
          className="object-cover scale-105"
          unoptimized={restaurant.banner.includes("unsplash")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/60 to-night/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-night/40 via-transparent to-transparent" />

        {/* Top bar */}
        <div className="absolute top-24 left-0 right-0 z-10">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-10 flex items-center justify-between">
            <button onClick={() => router.back()} className="flex items-center gap-2 rounded-full glass px-4 py-2 hover:bg-gold/15 transition-colors">
              <ChevronLeft className="h-4 w-4 text-cream" />
              <span className="font-mono text-[10px] tracking-widest text-cream uppercase">Back</span>
            </button>
            <div className="flex items-center gap-2">
              <button onClick={() => setLiked(!liked)} className="flex h-10 w-10 items-center justify-center rounded-full glass hover:bg-gold/15 transition-colors">
                <Heart className={`h-4 w-4 transition-all ${liked ? "fill-flame text-flame scale-110" : "text-cream/80"}`} />
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-full glass hover:bg-gold/15 transition-colors">
                <Share2 className="h-4 w-4 text-cream/80" />
              </button>
            </div>
          </div>
        </div>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 pb-14 lg:pb-20">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
            <div className="opacity-0 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              <span className="font-mono text-[11px] tracking-widest uppercase text-gold">— {restaurant.cuisine}</span>
            </div>
            <h1
              className="font-playfair italic text-cream text-6xl sm:text-7xl lg:text-[110px] leading-[0.95] tracking-tight mt-3 max-w-4xl opacity-0 animate-fade-up"
              style={{ animationDelay: "0.25s" }}
            >
              {restaurant.name}
            </h1>
            <p className="font-lora text-base sm:text-lg text-cream/80 leading-relaxed mt-5 max-w-xl opacity-0 animate-fade-up" style={{ animationDelay: "0.4s" }}>
              {restaurant.description}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 opacity-0 animate-fade-up" style={{ animationDelay: "0.55s" }}>
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-gold text-gold" />
                <span className="font-bebas text-lg text-cream tracking-wide">{restaurant.rating.toFixed(1)}</span>
                {restaurant.totalRatings > 0 && (
                  <span className="font-mono text-[10px] tracking-widest uppercase text-ink-secondary">({restaurant.totalRatings} ratings)</span>
                )}
              </div>
              <span className="h-4 w-px bg-gold/20" />
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-gold" />
                <span className="font-mono text-xs tracking-widest uppercase text-cream/80">{restaurant.prepTime}</span>
              </div>
              <span className="h-4 w-px bg-gold/20" />
              <div className="flex items-center gap-1.5">
                <Bike className="h-3.5 w-3.5 text-gold" />
                <span className="font-mono text-xs tracking-widest uppercase text-cream/80">${restaurant.deliveryFee.toFixed(2)} fee</span>
              </div>
              <span className="h-4 w-px bg-gold/20" />
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-gold" />
                <span className="font-mono text-xs tracking-widest uppercase text-cream/80">{restaurant.address}</span>
              </div>
              {!restaurant.isOpen && (
                <>
                  <span className="h-4 w-px bg-gold/20" />
                  <span className="font-mono text-[10px] tracking-widest uppercase text-flame">● Closed</span>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STICKY SECTION NAV ═══ */}
      <div className="sticky top-[64px] z-30 bg-night/95 backdrop-blur-xl border-y border-gold/15">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <div className="flex gap-1 overflow-x-auto no-scrollbar py-3">
            {restaurant.menu.map((sec) => (
              <button
                key={sec.id}
                onClick={() => scrollToSection(sec.id)}
                className={`flex-shrink-0 px-5 py-2 rounded-full font-mono text-[10px] tracking-widest uppercase transition-all ${
                  activeSection === sec.id ? "bg-gold text-night" : "text-cream/70 hover:text-cream hover:bg-gold/5"
                }`}
              >
                {sec.name}
              </button>
            ))}
            <span className="ml-auto font-mono text-[10px] tracking-widest uppercase text-ink-secondary self-center px-3 hidden sm:block">
              ✦ {restaurant.hours}
            </span>
          </div>
        </div>
      </div>

      {/* ═══ MENU ═══ */}
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-16 lg:py-20 pb-40">
        <div className="space-y-20">
          {restaurant.menu.map((section) => (
            <section
              key={section.id}
              id={`section-${section.id}`}
              ref={(el) => { sectionRefs.current[section.id] = el; }}
              className="scroll-mt-32"
            >
              <div className="mb-10 flex items-end justify-between flex-wrap gap-4">
                <div>
                  <span className="eyebrow">— {section.items.length} items</span>
                  <h2 className="font-playfair italic text-cream text-4xl sm:text-5xl lg:text-6xl mt-2 tracking-tight">{section.name}</h2>
                </div>
                <div className="divider-gold flex-1 mb-3 ml-6 hidden sm:block" />
              </div>

              {section.items.length === 0 ? (
                <p className="font-lora text-ink-secondary text-center py-12">Menu items coming soon.</p>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-7">
                  {section.items.map((item) => {
                    const qty = itemQty(item.id);
                    return (
                      <article
                        key={item.id}
                        className="group relative flex gap-5 rounded-2xl border border-gold/15 bg-elevated/60 p-5 hover:border-gold/40 hover:bg-elevated transition-all duration-300"
                      >
                        {/* Image */}
                        <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex-shrink-0 rounded-xl overflow-hidden">
                          <Image
                            src={item.photo}
                            alt={item.name}
                            fill sizes="144px"
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            unoptimized={item.photo.includes("unsplash")}
                          />
                          {item.popular && (
                            <div className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-gold/95 px-2 py-1">
                              <Flame className="h-2.5 w-2.5 text-night" />
                              <span className="font-mono text-[8px] tracking-widest font-bold text-night uppercase">Popular</span>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 flex flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="font-playfair italic text-cream text-xl sm:text-2xl leading-tight pr-2">{item.name}</h3>
                            <span className="font-bebas text-2xl text-gold tracking-wide flex-shrink-0">${item.price.toFixed(2)}</span>
                          </div>
                          {item.description && (
                            <p className="font-lora text-sm text-ink-secondary leading-relaxed mt-2 line-clamp-2">{item.description}</p>
                          )}

                          <div className="mt-auto pt-4 flex items-center justify-between gap-3">
                            {/* Tags */}
                            <div className="flex flex-wrap gap-1.5">
                              {(item.tags ?? []).map((tag: string) => {
                                const isVegan = ["vegan","vegetarian"].includes(tag.toLowerCase());
                                const isSpicy = tag.toLowerCase() === "spicy";
                                return (
                                  <span key={tag} className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[9px] tracking-widest uppercase ${isSpicy ? "border-flame/40 text-flame" : isVegan ? "border-emerald-500/40 text-emerald-400" : "border-gold/30 text-gold"}`}>
                                    {isVegan && <Leaf className="h-2.5 w-2.5" />}
                                    {isSpicy && <Flame className="h-2.5 w-2.5" />}
                                    {tag}
                                  </span>
                                );
                              })}
                            </div>

                            {/* Add / qty control */}
                            {qty > 0 ? (
                              <div className="flex items-center gap-2 rounded-full bg-gold px-1.5 py-1">
                                <button
                                  onClick={() => {
                                    const ci = cartHere.find((i) => i.menuItemId === item.id);
                                    if (ci) useCartStore.getState().updateQuantity(ci.id, ci.quantity - 1);
                                  }}
                                  className="flex h-7 w-7 items-center justify-center rounded-full bg-night/15 text-night hover:bg-night/30 transition-colors"
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="font-bebas text-lg text-night min-w-[1ch] text-center tracking-wide">{qty}</span>
                                <button
                                  onClick={() => handleAdd(item)}
                                  className="flex h-7 w-7 items-center justify-center rounded-full bg-night/15 text-night hover:bg-night/30 transition-colors"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleAdd(item)}
                                className="flex items-center gap-1.5 rounded-full border border-gold/40 hover:border-gold hover:bg-gold hover:text-night px-4 py-1.5 transition-all duration-200"
                              >
                                <Plus className="h-3.5 w-3.5 text-gold group-hover/btn:text-night" />
                                <span className="font-mono text-[10px] tracking-widest uppercase font-bold text-cream group-hover:text-night">Add</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          ))}
        </div>
      </div>

      {/* ═══ FLOATING CART BAR ═══ */}
      {itemCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-fade-up">
          <button
            onClick={openCart}
            className="flex items-center gap-4 rounded-full bg-gold hover:bg-gold/90 text-night shadow-amber-glow px-6 py-3.5 transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span className="font-bebas text-xl tracking-wide leading-none">{itemCount}</span>
            </div>
            <span className="h-5 w-px bg-night/30" />
            <span className="font-mono text-xs tracking-widest font-bold uppercase">View Cart</span>
            <span className="h-5 w-px bg-night/30" />
            <span className="font-bebas text-lg tracking-wide leading-none">${subtotal.toFixed(2)}</span>
          </button>
        </div>
      )}
    </div>
  );
}
