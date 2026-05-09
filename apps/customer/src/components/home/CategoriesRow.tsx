"use client";

import { useRef, useState } from "react";
import Image from "next/image";

const CATEGORIES = [
  { slug: "burgers",  name: "Burgers",  count: 48, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop" },
  { slug: "biryani",  name: "Biryani",  count: 32, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop" },
  { slug: "sushi",    name: "Sushi",    count: 21, image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop" },
  { slug: "pizza",    name: "Pizza",    count: 56, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop" },
  { slug: "bbq",      name: "BBQ",      count: 27, image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop" },
  { slug: "ramen",    name: "Ramen",    count: 19, image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop" },
  { slug: "desserts", name: "Desserts", count: 41, image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=300&fit=crop" },
  { slug: "wraps",    name: "Wraps",    count: 24, image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=300&fit=crop" },
];

export default function CategoriesRow() {
  const [active, setActive] = useState("burgers");
  const trackRef = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const startScroll = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!trackRef.current) return;
    isDown.current = true;
    startX.current = e.pageX;
    startScroll.current = trackRef.current.scrollLeft;
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current || !trackRef.current) return;
    e.preventDefault();
    trackRef.current.scrollLeft = startScroll.current - (e.pageX - startX.current);
  };
  const onMouseUp = () => { isDown.current = false; };

  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        {/* Header */}
        <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
          <div>
            <span className="eyebrow">— Explore</span>
            <h2 className="h-display text-5xl sm:text-6xl lg:text-[64px] mt-3">
              What are you <span className="text-gold">feeling?</span>
            </h2>
          </div>
          <p className="font-mono text-xs tracking-widest text-ink-secondary uppercase max-w-xs">
            Drag to explore · 8 cuisines
          </p>
        </div>

        {/* Cards row */}
        <div
          ref={trackRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          className="flex gap-5 overflow-x-auto no-scrollbar pb-4 cursor-grab active:cursor-grabbing select-none"
        >
          {CATEGORIES.map((cat, idx) => {
            const isActive = active === cat.slug;
            return (
              <button
                key={cat.slug}
                onClick={() => setActive(cat.slug)}
                style={{ animationDelay: `${idx * 60}ms` }}
                className={`group relative flex-shrink-0 w-[200px] h-[280px] rounded-3xl overflow-hidden border opacity-0 animate-fade-up hover:-translate-y-2 transition-all duration-300 ${
                  isActive
                    ? "bg-gold border-gold shadow-amber-glow"
                    : "bg-elevated border-gold/15 hover:border-gold/60"
                }`}
              >
                {/* Image fills top 60% */}
                <div className="relative h-[60%] overflow-hidden">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="200px"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${
                      isActive
                        ? "from-gold via-gold/30 to-transparent"
                        : "from-elevated via-elevated/40 to-transparent"
                    }`}
                  />
                </div>

                {/* Text content */}
                <div className="relative p-5 -mt-8">
                  <p
                    className={`font-playfair italic text-2xl leading-tight ${
                      isActive ? "text-night" : "text-cream"
                    }`}
                  >
                    {cat.name}
                  </p>
                  <p
                    className={`font-mono text-[10px] uppercase tracking-widest mt-2 ${
                      isActive ? "text-night/70" : "text-gold/70"
                    }`}
                  >
                    {cat.count} dishes
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
