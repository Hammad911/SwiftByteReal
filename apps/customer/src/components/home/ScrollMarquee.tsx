const PHRASES = [
  "Fast Delivery",
  "Fresh Ingredients",
  "200+ Restaurants",
  "Real-Time Tracking",
  "Exclusive Deals",
  "Order in 60 Seconds",
];

export default function ScrollMarquee() {
  // Repeat array twice for seamless loop
  const items = [...PHRASES, ...PHRASES];

  return (
    <div className="relative overflow-hidden border-y border-gold/15 bg-surface py-6 select-none">
      <div className="flex animate-marquee whitespace-nowrap will-change-transform">
        {[0, 1].map((dup) => (
          <div key={dup} className="flex items-center gap-12 pr-12 flex-shrink-0">
            {items.map((phrase, i) => (
              <span key={`${dup}-${i}`} className="flex items-center gap-12 flex-shrink-0">
                <span className="font-playfair italic text-3xl sm:text-5xl text-gold tracking-tight">
                  {phrase}
                </span>
                <span className="text-gold/40 text-2xl">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
