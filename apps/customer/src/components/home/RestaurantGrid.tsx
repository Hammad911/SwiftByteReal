"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Heart, Star, ArrowUpRight, Loader2 } from "lucide-react";
import { restaurantApi } from "@/lib/api";

function normalise(r: any, index: number) {
  const cuisines: string[] = r.cuisineTypes ?? [];
  return {
    id:       r.id,
    name:     r.name,
    cuisine:  cuisines.map((c: string) => c.charAt(0).toUpperCase() + c.slice(1)).join(", ") || "Various",
    time:     r.prepTime ? `${r.prepTime} min` : "25 min",
    rating:   r.rating ?? 4.5,
    image:    r.banner || `https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop`,
    featured: index === 0,
  };
}

function RestaurantCard({ r, large, index }: { r: ReturnType<typeof normalise>; large?: boolean; index: number }) {
  const [liked, setLiked] = useState(false);

  return (
    <div
      style={{ animationDelay: `${index * 80}ms` }}
      className={`group relative overflow-hidden rounded-3xl border border-gold/15 bg-elevated opacity-0 animate-fade-up ${
        large ? "row-span-2 min-h-[600px]" : "min-h-[290px]"
      }`}
    >
      <Link href={`/restaurants/${r.id}`} className="absolute inset-0 z-10" aria-label={r.name} />

      {/* Image */}
      <Image
        src={r.image}
        alt={r.name}
        fill
        sizes={large ? "50vw" : "25vw"}
        className="object-cover transition-transform duration-700 group-hover:scale-[1.08]"
        unoptimized={r.image.includes("unsplash")}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-night via-night/30 to-transparent" />

      {/* Heart */}
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiked(!liked); }}
        className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-night/60 backdrop-blur-sm transition-all hover:bg-night/80"
      >
        <Heart className={`h-4 w-4 transition-all ${liked ? "fill-flame text-flame scale-110" : "text-cream/70"}`} />
      </button>

      {/* Bottom overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
        {/* Rating */}
        <span className="inline-flex items-center gap-1 rounded-full bg-gold px-3 py-0.5 mb-3">
          <Star className="h-3 w-3 fill-night text-night" />
          <span className="font-bebas text-sm text-night leading-none tracking-wide">{r.rating.toFixed(1)}</span>
        </span>

        <h3 className={`font-playfair font-bold text-cream leading-tight ${large ? "text-4xl" : "text-2xl"}`}>
          {r.name}
        </h3>
        <p className="font-mono text-[10px] tracking-widest uppercase text-cream/60 mt-1">
          {r.cuisine} · {r.time}
        </p>

        {/* Hover CTA */}
        <div className="mt-3 flex items-center gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <span className="font-mono text-xs tracking-widest uppercase text-gold">Order Now</span>
          <ArrowUpRight className="h-4 w-4 text-gold" />
        </div>
      </div>
    </div>
  );
}

export default function RestaurantGrid() {
  const { data, isLoading } = useQuery({
    queryKey: ["home-top-restaurants"],
    queryFn: () =>
      restaurantApi
        .list({ limit: 4 })
        .then((r) => {
          const list: any[] = r.data.data.data ?? [];
          return list
            .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
            .slice(0, 4)
            .map(normalise);
        }),
    staleTime: 60_000,
  });

  const restaurants = data ?? [];

  return (
    <section className="bg-night py-24 px-6 lg:px-20">
      {/* Eyebrow */}
      <div className="mb-12">
        <span className="eyebrow">— Tonight's Picks</span>
        <h2 className="h-display text-5xl sm:text-6xl lg:text-[72px] mt-3 max-w-2xl">
          Restaurants worth <span className="text-gold italic">the wait.</span>
        </h2>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24 gap-3 text-ink-secondary">
          <Loader2 className="h-6 w-6 animate-spin text-gold" />
          <span className="font-lora">Loading tonight's picks…</span>
        </div>
      ) : restaurants.length === 0 ? (
        <div className="text-center py-24">
          <p className="font-playfair italic text-3xl text-cream">No restaurants yet</p>
          <p className="font-lora text-ink-secondary mt-2">Check back soon — new spots are being added.</p>
        </div>
      ) : (
        /* Asymmetric bento grid */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[300px]">
          {restaurants.map((r, i) => (
            <div key={r.id} className={i === 0 ? "md:col-span-2 md:row-span-2" : ""}>
              <RestaurantCard r={r} large={i === 0} index={i} />
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 text-center">
        <Link
          href="/restaurants"
          className="inline-flex items-center gap-2 rounded-full border border-gold/30 px-8 py-3 font-mono text-xs tracking-widest uppercase text-cream hover:border-gold hover:text-gold transition-all"
        >
          View All Restaurants <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}
