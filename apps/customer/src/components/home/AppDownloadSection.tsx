import { Apple, Star } from "lucide-react";

export default function AppDownloadSection() {
  return (
    <section className="grid lg:grid-cols-2 min-h-[600px]">
      {/* — LEFT: dark with phone mockup — */}
      <div className="relative bg-night flex items-center justify-center py-16 px-6 overflow-hidden border-t border-gold/15 lg:border-r">
        {/* Glow */}
        <div className="pointer-events-none absolute -bottom-20 left-1/2 -translate-x-1/2 h-72 w-72 bg-gold/15 blur-3xl rounded-full" />

        <div
          className="relative w-[280px] h-[560px] animate-fade-in"
          style={{ transform: "rotate(-4deg)" }}
        >
          {/* Phone frame */}
          <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-[#2a2620] to-[#0d0b08] shadow-[0_30px_80px_rgba(245,166,35,0.2)] ring-[6px] ring-[#1a1612]">
            {/* Notch */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-6 rounded-full bg-night z-10" />

            {/* Screen */}
            <div className="absolute inset-2 rounded-[2.5rem] bg-night overflow-hidden flex flex-col">
              {/* Status bar */}
              <div className="px-6 pt-10 pb-4 flex justify-between items-center">
                <span className="font-mono text-[10px] text-cream">9:41</span>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-cream" />
                  <span className="h-1.5 w-1.5 rounded-full bg-cream" />
                  <span className="h-1.5 w-1.5 rounded-full bg-cream/40" />
                </div>
              </div>

              {/* App content preview */}
              <div className="flex-1 px-5 space-y-4 overflow-hidden">
                <div>
                  <p className="font-mono text-[9px] tracking-widest uppercase text-gold">
                    ● Live Order
                  </p>
                  <p className="font-playfair italic text-2xl text-cream mt-1">
                    Arriving soon
                  </p>
                </div>

                {/* Order card */}
                <div className="rounded-2xl bg-elevated border border-gold/15 p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gold/20 flex items-center justify-center text-2xl">
                      🍜
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-playfair italic text-sm text-cream truncate">
                        The Ramen Bar
                      </p>
                      <p className="font-mono text-[8px] text-ink-secondary tracking-widest uppercase mt-0.5">
                        2 items · $24.50
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 h-1 bg-gold/15 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-gold rounded-full" />
                  </div>
                  <p className="font-mono text-[8px] text-gold tracking-widest mt-2 uppercase">
                    Rider 4 min away
                  </p>
                </div>

                {/* Suggested */}
                <div>
                  <p className="font-mono text-[9px] tracking-widest uppercase text-ink-secondary mb-2">
                    Suggested for you
                  </p>
                  <div className="flex gap-2 overflow-hidden">
                    {["🍕", "🍔", "🌮"].map((e, i) => (
                      <div
                        key={i}
                        className="flex-1 h-20 rounded-xl bg-elevated border border-gold/10 flex items-center justify-center text-2xl"
                      >
                        {e}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom nav */}
              <div className="px-5 py-3 border-t border-gold/10 flex justify-around">
                {["●", "○", "○", "○"].map((d, i) => (
                  <span
                    key={i}
                    className={`text-xs ${i === 0 ? "text-gold" : "text-ink-muted"}`}
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Floating rating badge */}
          <div
            className="absolute -top-6 -right-12 glass rounded-2xl px-4 py-2.5 animate-fade-in"
            style={{ animationDelay: "0.5s", transform: "rotate(6deg)" }}
          >
            <div className="flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 fill-gold text-gold" />
              <span className="font-bebas text-2xl text-gold leading-none tracking-wide">4.9</span>
            </div>
            <p className="font-mono text-[8px] uppercase tracking-widest text-cream/70 mt-0.5">
              App Store
            </p>
          </div>
        </div>
      </div>

      {/* — RIGHT: dark surface (matches theme) — */}
      <div className="relative bg-surface flex items-center px-8 sm:px-16 py-16 overflow-hidden">
        {/* Soft amber radial bg */}
        <div className="pointer-events-none absolute -top-20 right-0 h-[420px] w-[420px] rounded-full bg-gold/10 blur-3xl" />
        {/* Halftone tint */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #F5A623 1px, transparent 1.4px)",
            backgroundSize: "16px 16px",
          }}
        />

        <div className="relative max-w-md animate-fade-up">
          <span className="font-mono text-[11px] tracking-widest uppercase text-gold">
            — On The Go
          </span>
          <h2 className="font-playfair italic text-[44px] sm:text-[56px] leading-[0.95] tracking-tight text-cream mt-3">
            Take SwiftByte <br />
            <span className="text-gold">with you.</span>
          </h2>
          <p className="font-lora text-base sm:text-lg text-ink-secondary leading-relaxed mt-6">
            Faster ordering, exclusive in-app deals, and live tracking — wherever the
            craving hits.
          </p>

          {/* Store buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button className="group inline-flex items-center gap-3 rounded-full border border-gold/25 bg-elevated/80 hover:bg-gold hover:border-gold active:scale-95 transition-all duration-300 px-6 py-3.5 text-cream hover:text-night min-w-[180px]">
              <Apple className="h-6 w-6 flex-shrink-0" />
              <div className="text-left">
                <p className="font-mono text-[8px] tracking-widest uppercase text-ink-secondary group-hover:text-night/60 leading-none transition-colors">
                  Download on the
                </p>
                <p className="font-playfair text-base font-bold leading-tight mt-1">
                  App Store
                </p>
              </div>
            </button>

            <button className="group inline-flex items-center gap-3 rounded-full border border-gold/25 bg-elevated/80 hover:bg-gold hover:border-gold active:scale-95 transition-all duration-300 px-6 py-3.5 text-cream hover:text-night min-w-[180px]">
              <svg className="h-6 w-6 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.609 1.814 13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893 2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198 2.412 1.397a1 1 0 0 1 0 1.73l-2.514 1.456L15.298 12l2.4-2.491zM5.864 2.658 16.802 8.99l-2.302 2.302-8.636-8.634z" />
              </svg>
              <div className="text-left">
                <p className="font-mono text-[8px] tracking-widest uppercase text-ink-secondary group-hover:text-night/60 leading-none transition-colors">
                  Get it on
                </p>
                <p className="font-playfair text-base font-bold leading-tight mt-1">
                  Google Play
                </p>
              </div>
            </button>
          </div>

          <p className="font-mono text-[10px] tracking-widest uppercase text-ink-muted mt-8">
            ✦ Scan to download · iOS & Android
          </p>
        </div>
      </div>
    </section>
  );
}
