import Image from "next/image";
import { Star } from "lucide-react";

const REVIEWS = [
  {
    id: 1,
    text: "The ramen arrived hot, plated like it just left the kitchen. Honestly forgot it was delivered.",
    name: "Sarah O.",
    role: "Foodie · Islamabad",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face",
    rotate: -1.5,
    yOffset: 0,
  },
  {
    id: 2,
    text: "I order biryani three nights a week. SwiftByte's tracking is so accurate I wait at the door. Never disappoints.",
    name: "James K.",
    role: "Loyal Customer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face",
    rotate: 0,
    yOffset: 40,
  },
  {
    id: 3,
    text: "Found three new favorite restaurants in one week. The curation is unreal — feels like a friend with great taste.",
    name: "Bolanle T.",
    role: "Designer",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&h=120&fit=crop&crop=face",
    rotate: 1.5,
    yOffset: 0,
  },
];

export default function TestimonialsSection() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background watermark stars */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center select-none">
        <span className="font-playfair text-[280px] sm:text-[420px] text-gold/[0.04] leading-none whitespace-nowrap">
          ★★★★★
        </span>
      </div>

      <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="mb-20 text-center">
          <span className="eyebrow">— Real Talk</span>
          <h2 className="h-display text-5xl sm:text-6xl lg:text-[64px] mt-3 mx-auto max-w-3xl">
            What our regulars <span className="text-gold">actually</span> say.
          </h2>
        </div>

        {/* Cards row */}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {REVIEWS.map((review, i) => (
            <div
              key={review.id}
              style={{
                animationDelay: `${i * 150}ms`,
                transform: `translateY(${review.yOffset}px) rotate(${review.rotate}deg)`,
              }}
              className="relative glass rounded-3xl p-8 lg:p-10 border-l-4 border-l-gold opacity-0 animate-fade-in"
            >
              {/* Big quote mark */}
              <span className="font-playfair text-[80px] leading-none text-gold absolute -top-2 left-6 select-none">
                "
              </span>

              {/* Review text */}
              <p className="font-lora italic text-lg text-cream/90 leading-relaxed mt-6 relative z-10">
                {review.text}
              </p>

              {/* Reviewer */}
              <div className="mt-7 pt-6 border-t border-gold/15 flex items-center gap-4">
                <div className="relative h-12 w-12 rounded-full overflow-hidden ring-2 ring-gold/30 flex-shrink-0">
                  <Image
                    src={review.avatar}
                    alt={review.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-playfair italic text-lg text-cream leading-tight">
                    {review.name}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-ink-secondary mt-0.5">
                    {review.role}
                  </p>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-3 w-3 fill-gold text-gold" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
