"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { MapPin, ArrowUpRight, Zap, Star } from "lucide-react";

const AVATARS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&crop=face",
];

export default function HeroSection() {
  const [location, setLocation] = useState("");
  const imgWrapRef = useRef<HTMLDivElement>(null);

  // Lightweight vanilla parallax on the food image
  useEffect(() => {
    const el = imgWrapRef.current;
    if (!el) return;
    const parent = el.parentElement;
    if (!parent) return;

    const onMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1; // -1..1
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      el.style.transform = `perspective(1000px) rotateY(${x * 3}deg) rotateX(${-y * 3}deg) translateY(${y * 6}px)`;
    };
    const onLeave = () => {
      el.style.transform = "perspective(1000px) rotateY(0deg) rotateX(0deg) translateY(0px)";
    };

    parent.addEventListener("mousemove", onMove);
    parent.addEventListener("mouseleave", onLeave);
    return () => {
      parent.removeEventListener("mousemove", onMove);
      parent.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <section className="relative min-h-screen pt-32 pb-20 overflow-hidden glow-amber">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-gold/15 blur-3xl" />
        <div className="absolute top-1/2 -left-40 h-[400px] w-[400px] rounded-full bg-flame/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="grid lg:grid-cols-[55%_45%] gap-10 lg:gap-6 items-center min-h-[80vh]">

          {/* ── LEFT ── */}
          <div className="relative z-10">
            {/* Live eyebrow */}
            <div
              className="inline-flex items-center gap-2 mb-8 opacity-0 animate-fade-up"
              style={{ animationDelay: "0.1s" }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-flame animate-pulse-ring" />
                <span className="relative h-2 w-2 rounded-full bg-flame" />
              </span>
              <span className="font-mono text-[11px] tracking-widest uppercase text-flame">
                Live Delivery
              </span>
              <span className="h-px w-10 bg-gold/30" />
              <span className="font-mono text-[10px] tracking-widest text-ink-secondary">
                Islamabad · Now
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-playfair text-[56px] sm:text-7xl lg:text-[96px] leading-[0.95] tracking-tight text-cream">
              <span
                className="block opacity-0 animate-fade-up"
                style={{ animationDelay: "0.25s" }}
              >
                Food that
              </span>
              <span
                className="block italic text-gold opacity-0 animate-fade-up"
                style={{ animationDelay: "0.4s" }}
              >
                moves you<span className="text-cream not-italic">.</span>
              </span>
            </h1>

            {/* Body */}
            <p
              className="mt-7 max-w-md font-lora text-base sm:text-lg text-ink-secondary leading-relaxed opacity-0 animate-fade-up"
              style={{ animationDelay: "0.55s" }}
            >
              From the city's finest kitchens to your doorstep.{" "}
              <span className="text-cream/90 italic">Real ingredients. Real fast.</span>
            </p>

            {/* Search */}
            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-9 flex items-center gap-2 rounded-full glass pl-5 pr-1.5 py-1.5 max-w-lg group focus-within:border-gold/50 transition-colors relative overflow-hidden opacity-0 animate-fade-up"
              style={{ animationDelay: "0.7s" }}
            >
              <span className="pointer-events-none absolute inset-0 shimmer-bg opacity-0 group-focus-within:opacity-100 group-focus-within:animate-shimmer" />
              <MapPin className="h-4 w-4 text-gold flex-shrink-0 relative" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Drop your pin..."
                className="flex-1 bg-transparent outline-none text-sm text-cream placeholder:text-ink-secondary font-lora min-w-0 relative"
              />
              <button
                type="submit"
                className="relative flex-shrink-0 inline-flex items-center gap-1.5 rounded-full bg-gold hover:bg-gold-300 hover:shadow-amber-glow transition-all duration-300 px-5 py-2.5 font-mono text-[11px] tracking-widest font-bold text-night uppercase"
              >
                Find Food <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </form>

            {/* Social proof */}
            <div
              className="mt-10 flex items-center gap-4 opacity-0 animate-fade-up"
              style={{ animationDelay: "0.9s" }}
            >
              <div className="flex -space-x-2.5">
                {AVATARS.map((src, i) => (
                  <div
                    key={i}
                    className="relative h-9 w-9 rounded-full ring-2 ring-night overflow-hidden"
                  >
                    <Image src={src} alt="" fill sizes="36px" className="object-cover" />
                  </div>
                ))}
              </div>
              <div>
                <p className="font-bebas text-2xl text-cream tracking-wide leading-none">
                  12,400<span className="text-gold">+</span>
                </p>
                <p className="font-mono text-[10px] tracking-widest text-ink-secondary uppercase mt-0.5">
                  fed this week
                </p>
              </div>
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div className="relative h-[500px] lg:h-[640px] flex items-center justify-center">
            {/* Amber radial glow */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-[480px] w-[480px] rounded-full bg-amber-glow" />
            </div>

            {/* Dashed arrow path */}
            <svg
              className="hidden lg:block absolute -left-32 top-32 w-48 h-32 text-gold/40 pointer-events-none"
              viewBox="0 0 200 100"
              fill="none"
            >
              <path
                d="M 0 80 Q 60 -10 180 50"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="4 6"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 170 40 L 182 50 L 175 62"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>

            {/* Floating stat: top-left */}
            <div
              className="absolute top-8 -left-2 sm:left-8 lg:left-2 z-20 glass rounded-2xl px-4 py-3 flex items-center gap-3 shadow-warm-card opacity-0 animate-spring-in"
              style={{ animationDelay: "1s" }}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/20">
                <Zap className="h-4 w-4 text-gold fill-gold" />
              </div>
              <div>
                <p className="font-bebas text-xl text-cream leading-none tracking-wide">18 min</p>
                <p className="font-mono text-[9px] uppercase tracking-widest text-ink-secondary mt-0.5">
                  avg delivery
                </p>
              </div>
            </div>

            {/* Floating stat: bottom-right */}
            <div
              className="absolute bottom-12 -right-2 sm:right-4 lg:-right-4 z-20 glass rounded-2xl px-5 py-3.5 opacity-0 animate-spring-in"
              style={{ animationDelay: "1.15s" }}
            >
              <div className="flex items-baseline gap-1.5">
                <Star className="h-4 w-4 fill-gold text-gold self-center" />
                <span className="font-bebas text-4xl text-gold leading-none tracking-wider">4.9</span>
              </div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-ink-secondary mt-1">
                Avg rating
              </p>
            </div>

            {/* Hero food image with vanilla parallax */}
            <div
              ref={imgWrapRef}
              className="relative w-[340px] h-[340px] sm:w-[440px] sm:h-[440px] lg:w-[520px] lg:h-[520px] z-10 transition-transform duration-300 ease-out"
              style={{ willChange: "transform" }}
            >
              <Image
                src="https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=900&q=85"
                alt="Signature ramen bowl"
                fill
                priority
                sizes="(min-width: 1024px) 520px, (min-width: 640px) 440px, 340px"
                className="object-contain drop-shadow-[0_30px_60px_rgba(245,166,35,0.3)]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
