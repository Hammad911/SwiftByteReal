"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, ShoppingCart, Menu, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useCartStore, selectCartItemCount } from "@/store/cartStore";
import RoleSwitcher from "@/components/auth/RoleSwitcher";
import UserMenu from "@/components/layout/UserMenu";

const NAV_LINKS = [
  { label: "DISCOVER", href: "/" },
  { label: "RESTAURANTS", href: "/restaurants" },
  { label: "CUISINES", href: "/cuisines" },
  { label: "OFFERS", href: "/offers" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const itemCount = useCartStore(selectCartItemCount);
  const openCart = useCartStore((s) => s.openCart);

  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setSearchOpen(false);
      setQuery("");
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b border-gold/15 transition-all duration-300 animate-slide-down ${
        scrolled
          ? "bg-night/85 backdrop-blur-xl py-2"
          : "bg-night/50 backdrop-blur-md py-4"
      }`}
    >
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="flex items-center justify-between gap-6">

          {/* — Wordmark — */}
          <Link href="/" className="flex items-baseline gap-1 flex-shrink-0">
            <span className="font-playfair italic text-2xl lg:text-3xl font-bold text-cream tracking-tight">
              SwiftByte
            </span>
            <span className="font-mono text-[10px] text-gold align-super">®</span>
          </Link>

          {/* — Center nav (desktop) — */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group relative px-5 py-2 font-mono text-[11px] tracking-widest text-cream/80 hover:text-cream transition-colors"
                >
                  {link.label}
                  <span
                    className={`absolute bottom-0 left-5 right-5 h-px bg-gold origin-left transition-transform duration-300 ${
                      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* — Right actions — */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search"
              className="flex h-10 w-10 items-center justify-center rounded-full text-cream/70 hover:text-gold hover:bg-gold/5 transition-colors"
            >
              {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            </button>

            {/* Role Switcher */}
            {isAuthenticated && <RoleSwitcher />}

            {/* Cart */}
            <button
              onClick={openCart}
              aria-label="Cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-cream/70 hover:text-gold hover:bg-gold/5 transition-colors"
            >
              <ShoppingCart className="h-4 w-4" />
              {itemCount > 0 && (
                <>
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-flame animate-pulse-ring" />
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-flame" />
                </>
              )}
            </button>

            {/* Order CTA */}
            {isAuthenticated ? <UserMenu /> : (
              <Link href="/auth/login" className="hidden sm:inline-flex btn-gold">
                Order Now
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
              className="flex h-10 w-10 items-center justify-center rounded-full text-cream lg:hidden"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* — Search drop-down — */}
        {searchOpen && (
          <form
            onSubmit={submitSearch}
            className="mt-3 animate-slide-down overflow-hidden rounded-full border border-gold/30 bg-elevated px-5 py-2.5 flex items-center gap-3"
          >
            <Search className="h-4 w-4 text-gold flex-shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search dishes, restaurants, cuisines..."
              className="flex-1 bg-transparent outline-none text-sm text-cream placeholder:text-ink-secondary font-lora"
            />
            <span className="font-mono text-[10px] tracking-widest text-ink-secondary uppercase hidden sm:block">
              Press Enter
            </span>
          </form>
        )}

        {/* — Mobile drawer — */}
        {mobileOpen && (
          <div className="mt-4 animate-slide-down lg:hidden border-t border-gold/15 pt-4 pb-2 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-xl font-mono text-xs tracking-widest transition-colors ${
                  pathname === link.href
                    ? "bg-gold/10 text-gold"
                    : "text-cream/80 hover:bg-gold/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/auth/login"
              onClick={() => setMobileOpen(false)}
              className="btn-gold mt-3 w-full"
            >
              Order Now
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
