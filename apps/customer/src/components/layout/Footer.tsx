import Link from "next/link";
import { Instagram, Twitter, Facebook } from "lucide-react";

const COLUMNS = [
  {
    title: "About",
    links: [
      { label: "Our Story", href: "/about" },
      { label: "Manifesto", href: "/manifesto" },
      { label: "Press", href: "/press" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Cities",
    links: [
      { label: "Islamabad", href: "/cities/islamabad" },
      { label: "Lahore", href: "/cities/lahore" },
      { label: "Karachi", href: "/cities/karachi" },
      { label: "All Cities", href: "/cities" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Partner with us", href: "/partner" },
      { label: "Riders", href: "/riders" },
      { label: "Help Center", href: "/help" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative bg-night border-t border-gold/15 overflow-hidden">
      {/* Massive faded wordmark */}
      <div className="pointer-events-none absolute -bottom-16 left-1/2 -translate-x-1/2 select-none">
        <span className="font-playfair italic text-[20vw] leading-none text-gold/[0.06] whitespace-nowrap">
          SwiftByte.
        </span>
      </div>

      <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10 py-20">
        {/* Top row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand col */}
          <div className="col-span-2 max-w-sm space-y-5">
            <Link href="/" className="inline-flex items-baseline gap-1">
              <span className="font-playfair italic text-3xl font-bold text-cream">
                SwiftByte
              </span>
              <span className="font-mono text-[10px] text-gold align-super">®</span>
            </Link>
            <p className="font-lora text-sm text-ink-secondary leading-relaxed">
              Premium food delivery from the city's finest kitchens. Real ingredients.
              Real fast. Built for the late nights and the early mornings.
            </p>

            {/* Newsletter */}
            <form className="flex items-center gap-2 rounded-full glass pl-5 pr-1.5 py-1.5 max-w-sm">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 bg-transparent outline-none text-sm text-cream placeholder:text-ink-secondary font-lora min-w-0"
              />
              <button className="flex-shrink-0 rounded-full bg-gold hover:bg-gold-300 transition-colors px-4 py-2 font-mono text-[10px] tracking-widest font-bold text-night uppercase">
                Subscribe
              </button>
            </form>
          </div>

          {/* Columns */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="font-mono text-[11px] tracking-widest uppercase text-gold mb-5">
                — {col.title}
              </h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-lora text-sm text-cream/70 hover:text-gold transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="divider-gold my-12" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <p className="font-mono text-[11px] tracking-widest uppercase text-ink-secondary">
            © 2026 SwiftByte. All rights reserved.
          </p>

          <p className="font-lora italic text-sm text-cream/80">
            Made with <span className="text-gold">obsession.</span>
          </p>

          <div className="flex items-center gap-3">
            {[
              { Icon: Instagram, label: "Instagram", href: "#" },
              { Icon: Twitter, label: "Twitter", href: "#" },
              { Icon: Facebook, label: "Facebook", href: "#" },
            ].map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/20 text-cream/60 hover:text-gold hover:border-gold hover:bg-gold/5 transition-all"
              >
                <Icon className="h-3.5 w-3.5" />
              </a>
            ))}
            {/* TikTok */}
            <a
              href="#"
              aria-label="TikTok"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/20 text-cream/60 hover:text-gold hover:border-gold hover:bg-gold/5 transition-all"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.79 1.53V6.77a4.85 4.85 0 0 1-1.02-.08Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
