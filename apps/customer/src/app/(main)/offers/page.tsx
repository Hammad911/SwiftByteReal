import Link from "next/link";

export const metadata = { title: "Offers" };

const OFFERS = [
  { code: "SWIFT20", headline: "20% Off", sub: "Your first order", desc: "Minimum order $10. New users only. Valid through end of month.", color: "from-gold to-amber-500" },
  { code: "WEEKDAY15", headline: "15% Off", sub: "Monday to Thursday", desc: "Skip the weekend rush. Valid any weekday, all restaurants.", color: "from-flame to-rose-600" },
  { code: "FREERIDE", headline: "Free Delivery", sub: "Orders over $25", desc: "No delivery fee on any order above $25. No code needed — applied automatically.", color: "from-emerald-500 to-teal-600" },
  { code: "RAMENNIGHT", headline: "Buy 2 Get 1", sub: "Ramen & Japanese", desc: "Order two ramen bowls, get the third free. The Ramen Bar only.", color: "from-violet-500 to-purple-700" },
];

export default function OffersPage() {
  return (
    <div className="min-h-screen bg-night pt-28 pb-20">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <span className="eyebrow">— Exclusive Deals</span>
        <h1 className="h-display text-6xl sm:text-7xl mt-3 mb-12">
          Offers worth <span className="text-gold">your time.</span>
        </h1>

        <div className="grid sm:grid-cols-2 gap-6">
          {OFFERS.map((o) => (
            <div key={o.code} className={`relative rounded-3xl bg-gradient-to-br ${o.color} p-px`}>
              <div className="rounded-[calc(1.5rem-1px)] bg-elevated p-8 h-full">
                <p className="font-bebas text-7xl text-cream leading-none">{o.headline}</p>
                <p className="font-playfair italic text-2xl text-cream/80 mt-1">{o.sub}</p>
                <p className="font-lora text-sm text-ink-secondary mt-4 leading-relaxed">{o.desc}</p>

                <div className="mt-6 flex items-center gap-4">
                  <div className="rounded-full border border-gold/40 bg-gold/10 px-5 py-2">
                    <span className="font-mono text-xs tracking-widest uppercase text-gold">{o.code}</span>
                  </div>
                  <Link
                    href="/restaurants"
                    className="font-mono text-[10px] tracking-widest uppercase text-cream/60 hover:text-cream transition-colors"
                  >
                    Browse restaurants →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
