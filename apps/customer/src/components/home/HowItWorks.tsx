import { MapPin, UtensilsCrossed, Bike } from "lucide-react";

const STEPS = [
  {
    num: "01",
    icon: MapPin,
    title: "Drop your location",
    desc: "Tell us where you're craving from. We'll find the nearest kitchens cooking right now.",
  },
  {
    num: "02",
    icon: UtensilsCrossed,
    title: "Pick your meal",
    desc: "Browse curated menus from 200+ restaurants. From late-night biryani to morning espresso.",
  },
  {
    num: "03",
    icon: Bike,
    title: "We deliver fast",
    desc: "Our riders move. Real-time tracking from kitchen to your door — average 18 minutes flat.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 lg:py-32 bg-night relative">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">

        <div className="text-center mb-20">
          <span className="eyebrow">— The Process</span>
          <h2 className="h-display text-5xl sm:text-6xl lg:text-[64px] mt-3 mx-auto max-w-3xl">
            3 steps. <span className="text-gold">One great meal.</span>
          </h2>
        </div>

        {/* Steps row */}
        <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-6">
          {/* Dashed connector — desktop only */}
          <svg
            className="hidden lg:block absolute top-12 left-0 right-0 mx-auto pointer-events-none"
            viewBox="0 0 1000 40"
            preserveAspectRatio="none"
            style={{ height: "40px", width: "calc(100% - 200px)", marginLeft: "100px" }}
          >
            <path
              d="M 0 20 Q 250 -10 500 20 T 1000 20"
              stroke="#F5A623"
              strokeWidth="1.5"
              strokeDasharray="6 8"
              fill="none"
              opacity="0.5"
            />
          </svg>

          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                style={{ animationDelay: `${i * 150}ms` }}
                className="relative text-center opacity-0 animate-fade-up"
              >
                {/* Number badge */}
                <div className="relative mx-auto mb-8 flex items-center justify-center">
                  <span className="font-bebas text-[120px] lg:text-[160px] leading-none text-gold/20 tracking-tight">
                    {step.num}
                  </span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-elevated border border-gold/30">
                      <Icon className="h-7 w-7 text-gold" strokeWidth={1.5} />
                    </div>
                  </div>
                </div>

                <h3 className="font-playfair italic text-2xl lg:text-3xl text-cream mb-3">
                  {step.title}
                </h3>
                <p className="font-lora text-base text-ink-secondary leading-relaxed max-w-xs mx-auto">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
