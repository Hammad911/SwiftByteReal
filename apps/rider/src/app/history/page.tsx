"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { orderApi } from "@/lib/api";
import { ChevronLeft, Clock, ChevronRight, Package, Zap } from "lucide-react";
import { formatDate } from "@swiftbyte/shared";

export default function RiderHistoryPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const hasRider =
    (user?.roles || []).includes("rider") || user?.role === "rider";

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["rider-history"],
    queryFn: () =>
      orderApi.list({ status: "delivered", limit: 50 }).then((r) => r.data.data),
    enabled: isAuthenticated && hasRider,
  });

  if (!isAuthenticated || !hasRider) return null;

  const orders = ordersData?.data || [];

  return (
    <div className="min-h-screen" style={{ background: "#0D0B08" }}>
      <div
        style={{
          background: "#161410",
          borderBottom: "1px solid rgba(245,166,35,0.12)",
        }}
      >
        <div className="px-5 pt-10 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: "#1F1C18", border: "1px solid rgba(245,166,35,0.15)" }}
            >
              <ChevronLeft className="h-5 w-5" style={{ color: "#F5ECD7" }} />
            </Link>
            <div className="flex-1">
              <p
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  fontSize: "10px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#9E8E78",
                }}
              >
                Log
              </p>
              <h1
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontStyle: "italic",
                  fontSize: "1.35rem",
                  color: "#F5ECD7",
                }}
              >
                Delivery history
              </h1>
            </div>
            <Zap className="h-5 w-5" style={{ color: "#4A4035" }} />
          </div>
          <p style={{ fontSize: "12px", color: "#9E8E78", paddingLeft: "52px" }}>
            {orders.length} completed {orders.length === 1 ? "drop" : "drops"}
          </p>
        </div>
      </div>

      <div className="px-5 py-5 space-y-3">
        {isLoading && (
          <div className="flex justify-center py-16">
            <div
              style={{
                width: 36,
                height: 36,
                border: "3px solid rgba(245,166,35,0.2)",
                borderTopColor: "#F5A623",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
          </div>
        )}
        {!isLoading && orders.length === 0 && (
          <div
            className="rounded-2xl py-16 px-4 text-center"
            style={{
              background: "#161410",
              border: "1px solid rgba(245,166,35,0.08)",
            }}
          >
            <Package className="h-10 w-10 mx-auto mb-3" style={{ color: "#4A4035" }} />
            <p style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic", color: "#9E8E78" }}>
              No completed deliveries yet
            </p>
            <p style={{ fontSize: "12px", color: "#4A4035", marginTop: "6px" }}>
              Finish your first run — it will appear here.
            </p>
          </div>
        )}
        {orders.map((o: any) => (
          <div
            key={o.id}
            className="rounded-2xl p-4 flex items-center justify-between gap-3"
            style={{
              background: "#161410",
              border: "1px solid rgba(245,166,35,0.08)",
            }}
          >
            <div className="flex items-start gap-3 min-w-0">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl flex-shrink-0"
                style={{ background: "rgba(245,166,35,0.12)" }}
              >
                <Clock className="h-5 w-5" style={{ color: "#F5A623" }} />
              </div>
              <div className="min-w-0">
                <p
                  className="font-semibold truncate"
                  style={{ color: "#F5ECD7", fontSize: "15px" }}
                >
                  {o.restaurant?.name || "Restaurant"}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-dm-mono)",
                    fontSize: "10px",
                    letterSpacing: "0.08em",
                    color: "#9E8E78",
                    marginTop: "4px",
                  }}
                >
                  #{o.id.slice(-6).toUpperCase()} ·{" "}
                  {o.updatedAt ? formatDate(o.updatedAt) : ""}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end flex-shrink-0">
              <span
                style={{
                  fontFamily: "var(--font-bebas)",
                  fontSize: "1.25rem",
                  color: "#F5A623",
                }}
              >
                ${o.total?.toFixed(2) ?? "—"}
              </span>
              <ChevronRight className="h-4 w-4 mt-1" style={{ color: "#4A4035" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
