"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { LayoutDashboard, UtensilsCrossed, Bike, ShoppingBag, Tag, LogOut, Menu, Zap, Shield, FileText, ChevronUp } from "lucide-react";

const NAV = [
  { href: "/dashboard",                    icon: LayoutDashboard, label: "Overview"     },
  { href: "/dashboard/applications",       icon: FileText,        label: "Applications" },
  { href: "/dashboard/restaurants",        icon: UtensilsCrossed, label: "Restaurants"  },
  { href: "/dashboard/riders",             icon: Bike,            label: "Riders"       },
  { href: "/dashboard/orders",             icon: ShoppingBag,     label: "Orders"       },
  { href: "/dashboard/vouchers",           icon: Tag,             label: "Vouchers"     },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { isAuthenticated, logout, user } = useAuthStore();
  const [open, setOpen] = useState(false);
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

  const { isError: tokenInvalid } = useQuery({
    queryKey: ["admin-me-verify"],
    queryFn: () => api.get("/auth/me").then(r => r.data.data),
    enabled: isAuthenticated,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!isAuthenticated) { router.replace("/login"); return; }
  }, [isAuthenticated]);

  useEffect(() => {
    if (tokenInvalid) { logout(); router.replace("/login"); }
  }, [tokenInvalid]);

  const SidebarContent = () => (
    <div className="flex h-full flex-col" style={{ background: "#0D0B08", borderRight: "1px solid rgba(245,166,35,0.12)" }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: "1px solid rgba(245,166,35,0.12)" }}>
        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "#F5A623", boxShadow: "0 0 20px rgba(245,166,35,0.3)" }}>
          <Zap className="h-5 w-5" style={{ color: "#0D0B08" }} />
          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full" style={{ background: "#0D0B08", border: "1px solid rgba(245,166,35,0.3)" }}>
            <Shield className="h-3 w-3" style={{ color: "#F5A623" }} />
          </div>
        </div>
        <div>
          <p style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic", fontSize: "1.05rem", color: "#F5ECD7", lineHeight: 1 }}>SwiftByte</p>
          <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#9E8E78" }}>Admin</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all"
              style={{ background: active ? "rgba(245,166,35,0.1)" : "transparent", borderLeft: `2px solid ${active ? "#F5A623" : "transparent"}` }}
            >
              <Icon className="h-4 w-4 flex-shrink-0" style={{ color: active ? "#F5A623" : "#9E8E78" }} />
              <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: active ? "#F5ECD7" : "#9E8E78", fontWeight: active ? 600 : 400 }}>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer — user dropdown */}
      <div className="px-4 py-4 relative" style={{ borderTop: "1px solid rgba(245,166,35,0.12)" }} ref={userMenuRef}>
        {userMenuOpen && (
          <div className="absolute left-3 right-3 bottom-full mb-2 rounded-2xl overflow-hidden"
            style={{ background: "#1F1C18", border: "1px solid rgba(245,166,35,0.2)", boxShadow: "0 -8px 30px rgba(0,0,0,0.5)" }}>
            <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(245,166,35,0.1)" }}>
              <p className="text-xs font-semibold truncate" style={{ color: "#F5ECD7" }}>{user?.name}</p>
              <p className="text-xs truncate mt-0.5" style={{ color: "#9E8E78", fontFamily: "var(--font-dm-mono)", fontSize: "9px", letterSpacing: "0.08em" }}>{user?.email}</p>
            </div>
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
        <button
          onClick={() => setUserMenuOpen(v => !v)}
          className="flex w-full items-center gap-3 rounded-xl px-2 py-2 transition-all"
          style={{ background: userMenuOpen ? "rgba(245,166,35,0.08)" : "transparent" }}
          onMouseEnter={e => { if (!userMenuOpen) e.currentTarget.style.background = "rgba(245,166,35,0.05)"; }}
          onMouseLeave={e => { if (!userMenuOpen) e.currentTarget.style.background = "transparent"; }}
        >
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ background: "rgba(245,166,35,0.15)", color: "#F5A623" }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="truncate text-xs font-semibold" style={{ color: "#F5ECD7" }}>{user?.name}</p>
            <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9E8E78" }}>Admin</p>
          </div>
          <ChevronUp className="h-3.5 w-3.5 flex-shrink-0 transition-transform" style={{ color: "#9E8E78", transform: userMenuOpen ? "rotate(0deg)" : "rotate(180deg)" }} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0D0B08" }}>
      <div className="hidden lg:block w-56 flex-shrink-0"><SidebarContent /></div>
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="fixed left-0 top-0 z-50 h-full w-56"><SidebarContent /></div>
        </>
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex h-14 flex-shrink-0 items-center gap-3 px-5" style={{ background: "#0D0B08", borderBottom: "1px solid rgba(245,166,35,0.12)" }}>
          <button onClick={() => setOpen(true)} className="lg:hidden p-1.5 rounded-lg" style={{ color: "#9E8E78" }}>
            <Menu className="h-5 w-5" />
          </button>
          <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9E8E78" }}>
            {NAV.find(n => n.href === pathname || (n.href !== "/dashboard" && pathname.startsWith(n.href)))?.label ?? "Dashboard"}
          </p>
        </header>
        <main className="flex-1 overflow-y-auto p-5 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
