"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed, BarChart3,
  LogOut, Menu, Zap, Power, Bell, ChevronUp, User, Star,
} from "lucide-react";

const NAV = [
  { href: "/dashboard",            icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/orders",     icon: ShoppingBag,     label: "Orders" },
  { href: "/dashboard/menu",       icon: UtensilsCrossed, label: "Menu" },
  { href: "/dashboard/reviews",    icon: Star,            label: "Feedback" },
  { href: "/dashboard/analytics",  icon: BarChart3,       label: "Analytics" },
];

export default function DashboardLayout({
  children,
  restaurant,
}: {
  children: React.ReactNode;
  restaurant?: any;
}) {
  const pathname  = usePathname();
  const router    = useRouter();
  const { logout, user, setRestaurant } = useAuthStore();
  const [open, setOpen]           = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleStore = async () => {
    try {
      const { restaurantApi } = await import("@/lib/api");
      const { restaurantId } = useAuthStore.getState();
      if (!restaurantId) return;
      const isOpen = restaurant?.isOpen ?? false;
      await restaurantApi.update(restaurantId, { isOpen: !isOpen });
    } catch {}
  };

  const SidebarContent = () => (
    <div
      className="flex h-full flex-col border-r"
      style={{ background: "#0D0B08", borderColor: "rgba(245,166,35,0.12)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: "1px solid rgba(245,166,35,0.12)" }}>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "#F5A623", boxShadow: "0 0 20px rgba(245,166,35,0.3)" }}>
          <Zap className="h-5 w-5" style={{ color: "#0D0B08" }} />
        </div>
        <div>
          <p style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic", color: "#F5ECD7", fontSize: "1.1rem", lineHeight: 1 }}>SwiftByte</p>
          <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#9E8E78" }}>Restaurant</p>
        </div>
      </div>

      {/* Restaurant info */}
      {restaurant && (
        <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(245,166,35,0.08)" }}>
          <p style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic", color: "#F5ECD7", fontSize: "0.85rem" }} className="truncate">{restaurant.name}</p>
          <button
            onClick={handleToggleStore}
            className="mt-1.5 flex items-center gap-1.5 rounded-full px-3 py-1 transition-all"
            style={{
              background: restaurant?.isOpen ? "rgba(34,197,94,0.12)" : "rgba(232,55,42,0.12)",
              border: `1px solid ${restaurant?.isOpen ? "rgba(34,197,94,0.3)" : "rgba(232,55,42,0.3)"}`,
            }}
          >
            <Power className="h-3 w-3" style={{ color: restaurant?.isOpen ? "#4ade80" : "#f87171" }} />
            <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: restaurant?.isOpen ? "#4ade80" : "#f87171" }}>
              {restaurant?.isOpen ? "Open" : "Closed"}
            </span>
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all"
              style={{
                background: active ? "rgba(245,166,35,0.15)" : "transparent",
                borderLeft: active ? "2px solid #F5A623" : "2px solid transparent",
              }}
            >
              <Icon className="h-4 w-4 flex-shrink-0" style={{ color: active ? "#F5A623" : "#9E8E78" }} />
              <span style={{
                fontFamily: "var(--font-dm-mono)", fontSize: "11px", letterSpacing: "0.1em",
                textTransform: "uppercase", color: active ? "#F5ECD7" : "#9E8E78", fontWeight: active ? 600 : 400,
              }}>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer — user dropdown */}
      <div className="px-4 py-4 relative" style={{ borderTop: "1px solid rgba(245,166,35,0.12)" }} ref={userMenuRef}>
        {/* Dropdown panel — opens upward */}
        {userMenuOpen && (
          <div
            className="absolute left-3 right-3 bottom-full mb-2 rounded-2xl overflow-hidden"
            style={{ background: "#1F1C18", border: "1px solid rgba(245,166,35,0.2)", boxShadow: "0 -8px 30px rgba(0,0,0,0.5)" }}
          >
            {/* User info header */}
            <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(245,166,35,0.1)" }}>
              <p className="text-xs font-semibold truncate" style={{ color: "#F5ECD7" }}>{user?.name}</p>
              <p className="text-xs truncate mt-0.5" style={{ color: "#9E8E78", fontFamily: "var(--font-dm-mono)", fontSize: "9px", letterSpacing: "0.08em" }}>{user?.email}</p>
            </div>
            {/* Sign out */}
            <button
              onClick={() => { setUserMenuOpen(false); logout(); router.push("/login"); }}
              className="flex w-full items-center gap-2.5 px-4 py-3 transition-colors"
              style={{ color: "#f87171" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(248,113,113,0.08)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <LogOut className="h-3.5 w-3.5" />
              <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase" }}>Sign Out</span>
            </button>
          </div>
        )}

        {/* Trigger button */}
        <button
          onClick={() => setUserMenuOpen(v => !v)}
          className="flex w-full items-center gap-3 rounded-xl px-2 py-2 transition-all"
          style={{ background: userMenuOpen ? "rgba(245,166,35,0.08)" : "transparent" }}
          onMouseEnter={e => { if (!userMenuOpen) e.currentTarget.style.background = "rgba(245,166,35,0.05)"; }}
          onMouseLeave={e => { if (!userMenuOpen) e.currentTarget.style.background = "transparent"; }}
        >
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ background: "rgba(245,166,35,0.15)", color: "#F5A623" }}>
            {user?.name?.[0]?.toUpperCase() ?? <User size={14} />}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="truncate text-xs font-semibold" style={{ color: "#F5ECD7" }}>{user?.name}</p>
            <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9E8E78" }}>Owner</p>
          </div>
          <ChevronUp className="h-3.5 w-3.5 flex-shrink-0 transition-transform" style={{ color: "#9E8E78", transform: userMenuOpen ? "rotate(0deg)" : "rotate(180deg)" }} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0D0B08" }}>
      {/* Desktop sidebar */}
      <div className="hidden lg:block w-56 flex-shrink-0"><SidebarContent /></div>

      {/* Mobile overlay */}
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="fixed left-0 top-0 z-50 h-full w-56"><SidebarContent /></div>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header
          className="flex h-14 flex-shrink-0 items-center justify-between px-5"
          style={{ background: "#0D0B08", borderBottom: "1px solid rgba(245,166,35,0.12)" }}
        >
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="lg:hidden p-1.5 rounded-lg" style={{ color: "#9E8E78" }}>
              <Menu className="h-5 w-5" />
            </button>
            <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9E8E78" }}>
              {NAV.find(n => n.href === pathname || (n.href !== "/dashboard" && pathname.startsWith(n.href)))?.label ?? "Dashboard"}
            </p>
          </div>
          <Bell className="h-4 w-4" style={{ color: "#9E8E78" }} />
        </header>

        <main className="flex-1 overflow-y-auto p-5 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
