import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export default function FeaturedBanners() {
  return (
    <section className="px-6 lg:px-10 py-12">
      <div className="mx-auto max-w-[1400px]">
        <div className="relative overflow-hidden rounded-[2rem] bg-gold-gradient px-8 sm:px-12 lg:px-16 py-12 lg:py-16 animate-fade-up">
          {/* Halftone overlay */}
          <div className="absolute inset-0 halftone opacity-60" />

          {/* Decorative arcs */}
          <svg
            className="absolute top-0 right-0 w-72 h-72 text-night/10 pointer-events-none"
            viewBox="0 0 200 200"
            fill="none"
          >
            <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="2" />
            <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 5" />
            <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="1" />
          </svg>

          <div className="relative grid lg:grid-cols-2 gap-8 items-center">
            {/* Left content */}
            <div>
              <span className="font-mono text-xs tracking-widest uppercase text-night/60">
                ✦ Limited Time
              </span>

              <h3 className="font-bebas text-7xl sm:text-8xl lg:text-[140px] text-night leading-[0.85] tracking-tight mt-3">
                20% OFF
              </h3>

              <p className="font-lora italic text-xl sm:text-2xl text-night/85 mt-4 max-w-md">
                your first order. No strings.
              </p>

              <div className="mt-7 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-night px-5 py-2.5 font-mono text-xs tracking-widest text-cream uppercase">
                  Use Code: <span className="text-gold font-bold">SWIFT20</span>
                </div>

                <button className="inline-flex items-center gap-2 rounded-full bg-night hover:bg-elevated active:scale-95 px-7 py-3 font-mono text-xs tracking-widest font-bold text-cream uppercase transition-all duration-300">
                  Claim Offer <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Right — overflowing food image */}
            <div className="relative h-64 lg:h-auto">
              <div
                className="absolute -top-24 -right-12 w-[460px] h-[460px] hidden lg:block"
                style={{ transform: "rotate(-6deg)" }}
              >
                <Image
                  src="https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=900&q=85"
                  alt="Crispy fried offer"
                  fill
                  sizes="460px"
                  className="object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.4)]"
                />
              </div>

              {/* Mobile food image */}
              <div className="lg:hidden relative w-full h-full flex items-center justify-end">
                <Image
                  src="https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=600&q=80"
                  alt="Offer"
                  width={260}
                  height={260}
                  className="object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
