"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/store/authStore";
import { authApi, restaurantApi } from "@/lib/api";

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, logout, setRestaurant } = useAuthStore();

  // Server-side token verification — if this 401s, the API interceptor
  // clears localStorage and redirects to /login automatically.
  const { data: me, isError: meError, isLoading: meLoading } = useQuery({
    queryKey: ["me-verify"],
    queryFn: () => authApi.me().then((r) => r.data.data),
    enabled: isAuthenticated,
    retry: false,
    staleTime: 5 * 60 * 1000, // re-verify every 5 min
  });

  // Fetch this user's restaurant (scoped to them)
  const { data: restaurant } = useQuery({
    queryKey: ["my-restaurant", me?.id],
    queryFn: async () => {
      const res = await restaurantApi.mine();
      const r = res.data.data;
      useAuthStore.getState().setRestaurant(r.id, r.name);
      return r;
    },
    enabled: !!me && (me.roles || []).includes("restaurant"),
    retry: false,
  });

  useEffect(() => {
    // Not authenticated locally → go to login
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    // Token verified but user doesn't have the restaurant role
    if (me && !(me.roles || []).includes("restaurant") && me.role !== "admin") {
      logout();
      router.replace("/login");
    }
  }, [isAuthenticated, me]);

  useEffect(() => {
    // Server rejected the token (not caught by interceptor in some edge cases)
    if (meError) {
      logout();
      router.replace("/login");
    }
  }, [meError]);

  // Still verifying — show a minimal loading screen instead of flashing dashboard
  if (isAuthenticated && meLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0D0B08", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: 40, height: 40, border: "3px solid rgba(245,166,35,0.2)", borderTopColor: "#F5A623", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <p style={{ fontFamily: "monospace", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#9E8E78" }}>Verifying session…</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout restaurant={restaurant}>
      {children}
    </DashboardLayout>
  );
}
