"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { riderApi } from "@/lib/api";
import {
  ChevronLeft,
  Star,
  Zap,
  Target,
  TrendingUp,
  Award,
  Bike,
} from "lucide-react";

export default function RiderPerformancePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const hasRider =
    (user?.roles || []).includes("rider") || user?.role === "rider";

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["rider-profile"],
    queryFn: () => riderApi.getProfile().then((r) => r.data.data),
    enabled: isAuthenticated && hasRider,
  });

  if (!isAuthenticated || !hasRider) return null;

  const stats = [
    {
      label: "Avg rating",
      value: profile?.rating != null ? profile.rating.toFixed(2) : "5.00",
      sub: `${profile?.totalRatings ?? 0} reviews`,
      icon: Star,
      color: "#F5A623",
    },
    {
      label: "Completed",
      value: String(profile?.totalDeliveries ?? 0),
      sub: "lifetime deliveries",
      icon: Award,
      color: "#4ade80",
    },
    {
      label: "Acceptance",
      value: `${profile?.acceptanceRate ?? 100}%`,
      sub: "last 30 days est.",
      icon: Target,
      color: "#60a5fa",
    },
    {
      label: "On-time",
      value: `${profile?.onTimeRate ?? 100}%`,
      sub: "delivery punctuality",
      icon: TrendingUp,
      color: "#c084fc",
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#0D0B08" }}>
      <div
        style={{
          background: "#161410",
          borderBottom: "1px solid rgba(245,166,35,0.12)",
        }}
      >
        <div className="px-5 pt-10 pb-8">
          <div className="flex items-center gap-3 mb-6">
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
                Insights
              </p>
              <h1
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontStyle: "italic",
                  fontSize: "1.35rem",
                  color: "#F5ECD7",
                }}
              >
                Performance
              </h1>
            </div>
            <Zap className="h-5 w-5" style={{ color: "#4A4035" }} />
          </div>

          <div className="flex items-center gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold"
              style={{
                background: "rgba(245,166,35,0.15)",
                color: "#F5A623",
                fontFamily: "var(--font-bebas)",
              }}
            >
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p style={{ fontFamily: "var(--font-playfair)", fontSize: "1.1rem", color: "#F5ECD7" }}>
                {user?.name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Bike className="h-3.5 w-3.5" style={{ color: "#9E8E78" }} />
                <span
                  style={{
                    fontFamily: "var(--font-dm-mono)",
                    fontSize: "10px",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#9E8E78",
                  }}
                >
                  {profile?.vehicleType || "Rider"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 space-y-4">
        {isLoading && (
          <div className="flex justify-center py-20">
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
        {!isLoading && (
          <>
            <div className="grid grid-cols-2 gap-3">
              {stats.map(({ label, value, sub, icon: Icon, color }) => (
                <div
                  key={label}
                  className="rounded-2xl p-4"
                  style={{
                    background: "#161410",
                    border: "1px solid rgba(245,166,35,0.08)",
                  }}
                >
                  <Icon className="h-5 w-5 mb-3" style={{ color }} />
                  <p
                    style={{
                      fontFamily: "var(--font-bebas)",
                      fontSize: "1.75rem",
                      color: "#F5ECD7",
                      lineHeight: 1,
                    }}
                  >
                    {value}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-dm-mono)",
                      fontSize: "9px",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#9E8E78",
                      marginTop: "6px",
                    }}
                  >
                    {label}
                  </p>
                  <p style={{ fontSize: "11px", color: "#4A4035", marginTop: "4px" }}>{sub}</p>
                </div>
              ))}
            </div>

            <div
              className="rounded-2xl p-5"
              style={{
                background: "#161410",
                border: "1px solid rgba(245,166,35,0.1)",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  fontSize: "10px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#F5A623",
                  marginBottom: "10px",
                }}
              >
                Tips
              </p>
              <ul style={{ color: "#9E8E78", fontSize: "13px", lineHeight: 1.6, paddingLeft: "1.1rem" }}>
                <li>Go online during peak times to improve assignment rate.</li>
                <li className="mt-2">Keep location permission on so dispatch can match you accurately.</li>
                <li className="mt-2">Mark picked up only after you have the order in hand.</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
