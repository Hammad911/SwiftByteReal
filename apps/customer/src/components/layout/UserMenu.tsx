"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Package, User } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api";

export default function UserMenu() {
  const router = useRouter();
  const { user, logout, refreshToken } = useAuthStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    try {
      await authApi.logout(refreshToken ?? undefined);
    } catch {
      /* ignore */
    }
    logout();
    router.push("/");
    router.refresh();
  };

  const label = user?.name?.split(" ")[0] ?? "Account";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="hidden sm:inline-flex btn-outline items-center gap-1.5"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <User className="h-3.5 w-3.5 opacity-70" />
        <span className="max-w-[120px] truncate uppercase tracking-widest">{label}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-52 rounded-2xl border border-gold/15 bg-surface py-2 shadow-amber-glow"
          role="menu"
        >
          <p className="truncate px-4 py-2 font-playfair text-sm italic text-cream border-b border-gold/10">
            {user?.name}
          </p>
          <p className="truncate px-4 pb-2 font-mono text-[10px] text-ink-secondary">{user?.email}</p>
          <Link
            href="/orders"
            className="flex items-center gap-2 px-4 py-2.5 font-mono text-[10px] tracking-widest uppercase text-ink-secondary transition-colors hover:bg-elevated hover:text-cream"
            onClick={() => setOpen(false)}
          >
            <Package className="h-3.5 w-3.5" /> My orders
          </Link>
          <Link
            href="/checkout"
            className="flex items-center gap-2 px-4 py-2.5 font-mono text-[10px] tracking-widest uppercase text-ink-secondary transition-colors hover:bg-elevated hover:text-cream"
            onClick={() => setOpen(false)}
          >
            Checkout
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 border-t border-gold/10 px-4 py-2.5 font-mono text-[10px] tracking-widest uppercase text-flame/90 transition-colors hover:bg-flame/5"
            role="menuitem"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
