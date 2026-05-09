"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

const RIDER_URL = process.env.NEXT_PUBLIC_RIDER_URL || "http://localhost:3002";

/**
 * Active role "rider" belongs on the rider app. Full page navigation avoids broken router.push(http...).
 * Restaurant/admin users may still use the storefront (e.g. multi-role with customer), so we only redirect riders.
 */
export default function PortalRedirect() {
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.user?.role);

  useEffect(() => {
    if (!isAuthenticated || role !== "rider") return;
    if (pathname?.startsWith("/auth")) return;
    window.location.href = RIDER_URL;
  }, [isAuthenticated, role, pathname]);

  return null;
}
