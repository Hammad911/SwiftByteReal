"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api";
import { ChevronDown, ChefHat, ShoppingBag, Bike, Shield, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const ROLE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; redirect: string }> = {
  customer:   { label: "Customer",   icon: <ShoppingBag size={13} />, color: "#F5A623", redirect: "/" },
  restaurant: { label: "Restaurant", icon: <ChefHat size={13} />,     color: "#4ade80", redirect: "http://localhost:3001/dashboard" },
  rider:      { label: "Rider",      icon: <Bike size={13} />,        color: "#60a5fa", redirect: "http://localhost:3002" },
  admin:      { label: "Admin",      icon: <Shield size={13} />,      color: "#c084fc", redirect: "http://localhost:3003/dashboard" },
};

export default function RoleSwitcher() {
  const { user, setActiveRole, setTokens } = useAuthStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);

  if (!user || !user.roles || user.roles.length <= 1) return null;

  const activeConfig = ROLE_CONFIG[user.role] ?? ROLE_CONFIG.customer;

  const handleSwitch = async (role: string) => {
    if (role === user.role) { setOpen(false); return; }
    setSwitching(role);
    try {
      const res = await authApi.switchRole(role);
      const { accessToken, refreshToken } = res.data.data;
      setTokens(accessToken, refreshToken ?? localStorage.getItem("refreshToken") ?? "");
      setActiveRole(role, accessToken);
      toast.success(`Switched to ${ROLE_CONFIG[role]?.label ?? role}`);
      setOpen(false);
      const dest = ROLE_CONFIG[role]?.redirect ?? "/";
      if (dest.startsWith("http")) window.location.href = dest;
      else router.push(dest);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to switch role");
    } finally {
      setSwitching(null);
    }
  };

  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <button
        onClick={() => setOpen(!open)}
        style={{ border: `1px solid ${activeConfig.color}40`, color: activeConfig.color }}
        className="flex items-center gap-1.5 rounded-full bg-elevated px-3 py-1.5 text-xs font-mono tracking-widest uppercase transition-all hover:bg-elevated/80"
      >
        {activeConfig.icon}
        <span className="hidden sm:inline">{activeConfig.label}</span>
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-gold/15 bg-surface shadow-amber-glow z-50 overflow-hidden">
          <p className="px-4 py-2.5 font-mono text-[9px] tracking-widest uppercase text-ink-secondary border-b border-gold/10">
            Switch Role
          </p>
          {user.roles.map((role) => {
            const cfg = ROLE_CONFIG[role];
            if (!cfg) return null;
            const isActive = role === user.role;
            return (
              <button
                key={role}
                onClick={() => handleSwitch(role)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-elevated transition-colors"
                style={{ color: isActive ? cfg.color : "#9E8E78" }}
              >
                {switching === role ? <Loader2 size={13} className="animate-spin" /> : cfg.icon}
                <span className="font-mono text-xs tracking-widest uppercase">{cfg.label}</span>
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
