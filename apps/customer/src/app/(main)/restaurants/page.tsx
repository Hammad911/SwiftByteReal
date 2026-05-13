"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Star, Clock, Bike, Search, SlidersHorizontal, X, Flame, Loader2 } from "lucide-react";
import { restaurantApi } from "@/lib/api";
import { fallbackBannerUrl } from "@/lib/foodImages";

type RestaurantListing = {
  id: string;
  name: string;
  description?: string;
  rating?: number;
  prepTime?: number;
  deliveryFee?: number;
  minOrder?: number;
  banner?: string;
  isOpen?: boolean;
  cuisineTypes?: string[];
};

const SORT_OPTIONS = [
  { value: "rating",   label: "Top Rated" },
  { value: "delivery", label: "Fastest Delivery" },
  { value: "fee",      label: "Lowest Fee" },
];

// Normalise an API restaurant to the shape the card expects
function normalise(r: any) {
  const cuisines: string[] = r.cuisineTypes ?? [];
  return {
    id:          r.id,
    name:        r.name,
    cuisine:     cuisines.map((c: string) => c.charAt(0).toUpperCase() + c.slice(1)).join(", ") || "Various",
    description: r.description || "",
    rating:      r.rating ?? 0,
    prepTime:    r.prepTime ? `${r.prepTime}–${r.prepTime + 10} min` : "20–30 min",
    deliveryFee: r.deliveryFee ?? 0,
    minOrder:    r.minOrder ?? 0,
    banner:      r.banner || fallbackBannerUrl(r.id),
    isOpen:      r.isOpen ?? true,
    cuisines,
  };
}

export default function RestaurantsPage() {
  const [search, setSearch]           = useState("");
  const [activeCuisine, setActiveCuisine] = useState("All");
  const [sortBy, setSortBy]           = useState("rating");

  const { data, isLoading, isError } = useQuery<RestaurantListing[]>({
    queryKey: ["restaurants-listing"],
    queryFn: () => restaurantApi.list({ limit: 50 }).then((r) => r.data.data.data ?? []),
    staleTime: 30_000,
  });

  const restaurants = useMemo(() => (data ?? []).map(normalise), [data]);

  // Build cuisine filter pills dynamically from real data
  const cuisinePills = useMemo(() => {
    const set = new Set<string>();
    restaurants.forEach((r) => r.cuisines.forEach((c: string) => set.add(c.charAt(0).toUpperCase() + c.slice(1))));
    return ["All", ...Array.from(set).sort()];
  }, [restaurants]);

  const filtered = useMemo(() => {
    let list = [...restaurants];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.name.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
    }
    if (activeCuisine !== "All") {
      list = list.filter((r) => r.cuisines.some((c: string) => c.toLowerCase() === activeCuisine.toLowerCase()));
    }
    if (sortBy === "rating")   list.sort((a, b) => b.rating - a.rating);
    else if (sortBy === "delivery") list.sort((a, b) => parseInt(a.prepTime) - parseInt(b.prepTime));
    else if (sortBy === "fee") list.sort((a, b) => a.deliveryFee - b.deliveryFee);
    return list;
  }, [restaurants, search, activeCuisine, sortBy]);

  return (
    <div className="min-h-screen bg-night pt-24 pb-20">

      {/* ─── Header ─── */}
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 pt-10 pb-12">
        <span className="eyebrow animate-fade-up">
          — {isLoading ? "Loading…" : `${filtered.length} Restaurant${filtered.length !== 1 ? "s" : ""}`}
        </span>
        <h1 className="h-display text-6xl sm:text-7xl lg:text-[90px] mt-3 max-w-3xl opacity-0 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          Find your <span className="text-gold">next meal.</span>
        </h1>
      </div>

      {/* ─── Sticky search + filters bar ─── */}
      <div className="sticky top-[64px] z-30 bg-night/95 backdrop-blur-xl border-y border-gold/15">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-3 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-secondary pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search restaurants or cuisines..."
              className="w-full bg-elevated border border-gold/20 rounded-full pl-11 pr-10 py-2.5 text-sm text-cream placeholder:text-ink-secondary outline-none focus:border-gold/50 transition-colors font-lora"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-secondary hover:text-cream">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5 text-ink-secondary flex-shrink-0" />
            <div className="flex gap-1">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  className={`px-4 py-1.5 rounded-full font-mono text-[10px] tracking-widest uppercase transition-all ${
                    sortBy === opt.value ? "bg-gold text-night" : "text-cream/60 hover:text-cream hover:bg-gold/10"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cuisine pills — built from live data */}
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
          {cuisinePills.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCuisine(c)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full font-mono text-[10px] tracking-widest uppercase transition-all border ${
                activeCuisine === c
                  ? "bg-gold border-gold text-night"
                  : "border-gold/15 text-cream/60 hover:border-gold/40 hover:text-cream"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Grid ─── */}
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 mt-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="h-10 w-10 text-gold animate-spin" />
            <p className="font-lora text-ink-secondary">Loading restaurants…</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <p className="font-playfair italic text-4xl text-cream mb-3">Couldn't load restaurants</p>
            <p className="font-lora text-ink-secondary">Make sure the API is running on port 4000.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <p className="font-playfair italic text-4xl text-cream mb-3">Nothing found</p>
            <p className="font-lora text-ink-secondary">Try a different search or cuisine filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((r, idx) => (
              <RestaurantCard key={r.id} r={r} index={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

type CardRestaurant = ReturnType<typeof normalise>;

function RestaurantCard({ r, index }: { r: CardRestaurant; index: number }) {
  const [liked, setLiked] = useState(false);

  return (
    <div
      style={{ animationDelay: `${index * 60}ms` }}
      className="group relative rounded-3xl border border-gold/15 bg-elevated overflow-hidden hover:border-gold/40 hover:-translate-y-1 hover:shadow-amber-glow opacity-0 animate-fade-up transition-all duration-300"
    >
      <Link href={`/restaurants/${r.id}`} className="block absolute inset-0 z-10" aria-label={r.name} />

      {/* Banner image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={r.banner}
          alt={r.name}
          fill
          sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          unoptimized={r.banner.includes("unsplash")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-elevated via-elevated/30 to-transparent" />

        {/* Rating badge */}
        <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1">
          <Star className="h-3 w-3 fill-night text-night" />
          <span className="font-bebas text-sm text-night tracking-wide leading-none">{r.rating.toFixed(1)}</span>
        </div>

        {/* Open/closed badge */}
        {!r.isOpen && (
          <div className="absolute top-3 left-16 inline-flex items-center gap-1 rounded-full bg-night/80 backdrop-blur px-2.5 py-1">
            <span className="font-mono text-[9px] tracking-widest uppercase text-flame">Closed</span>
          </div>
        )}

        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiked(!liked); }}
          className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-night/60 backdrop-blur-sm hover:bg-night/80 transition-colors"
        >
          <Flame className={`h-3.5 w-3.5 transition-all ${liked ? "fill-flame text-flame" : "text-cream/70"}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-playfair italic text-cream text-xl leading-tight">{r.name}</h3>
          <span className="font-mono text-[9px] tracking-widest uppercase text-gold bg-gold/10 border border-gold/20 rounded-full px-2 py-1 flex-shrink-0 mt-0.5 max-w-[120px] truncate">
            {r.cuisine}
          </span>
        </div>

        {r.description && (
          <p className="font-lora text-xs text-ink-secondary leading-relaxed line-clamp-2 mt-1.5 mb-4">
            {r.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-[10px] font-mono tracking-widest uppercase text-ink-secondary">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-gold" />
            {r.prepTime}
          </span>
          <span className="flex items-center gap-1.5">
            <Bike className="h-3 w-3 text-gold" />
            ${r.deliveryFee.toFixed(2)} fee
          </span>
        </div>

        <div className="mt-4 divider-gold" />

        <div className="mt-4 flex items-center justify-between">
          <span className="font-mono text-[9px] tracking-widest uppercase text-ink-secondary">
            Min. ${r.minOrder}
          </span>
          <span className="font-mono text-[9px] tracking-widest uppercase text-gold group-hover:text-gold transition-colors flex items-center gap-1">
            Order Now →
          </span>
        </div>
      </div>
    </div>
  );
}
