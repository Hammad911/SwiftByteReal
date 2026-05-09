"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { riderApi } from "@/lib/api";
import {
  ChevronLeft,
  Banknote,
  Clock,
  TrendingUp,
  DollarSign,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatDate } from "@swiftbyte/shared";

export default function RiderEarningsPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();
  const hasRider =
    (user?.roles || []).includes("rider") || user?.role === "rider";
  const [withdrawAmount, setWithdrawAmount] = useState("");

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  const { data: profile } = useQuery({
    queryKey: ["rider-profile"],
    queryFn: () => riderApi.getProfile().then((r) => r.data.data),
    enabled: isAuthenticated && hasRider,
  });

  const { data: earningsData } = useQuery({
    queryKey: ["rider-earnings"],
    queryFn: () => riderApi.getEarnings().then((r) => r.data.data),
    enabled: isAuthenticated && hasRider,
  });

  const payoutMutation = useMutation({
    mutationFn: (amount: number) => riderApi.requestPayout(amount),
    onSuccess: () => {
      toast.success("Payout requested — processing in 2–3 business days.");
      setWithdrawAmount("");
      qc.invalidateQueries({ queryKey: ["rider-profile"] });
    },
    onError: () => toast.error("Could not request payout"),
  });

  if (!isAuthenticated || !hasRider) return null;

  const earnings = earningsData || [];
  const todayTotal = profile?.earnings?.today || 0;
  const weekTotal = profile?.earnings?.week || 0;
  const monthTotal = profile?.earnings?.month || 0;

  return (
    <div className="min-h-screen" style={{ background: "#0D0B08" }}>
      <div
        style={{
          background: "#161410",
          borderBottom: "1px solid rgba(245,166,35,0.12)",
        }}
      >
        <div className="px-5 pt-10 pb-6">
          <div className="flex items-center gap-3 mb-6">
            <Link
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: "#1F1C18", border: "1px solid rgba(245,166,35,0.15)" }}
            >
              <ChevronLeft className="h-5 w-5" style={{ color: "#F5ECD7" }} />
            </Link>
            <div>
              <p
                style={{
                  fontFamily: "var(--font-dm-mono)",
                  fontSize: "10px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#9E8E78",
                }}
              >
                Wallet
              </p>
              <h1
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontStyle: "italic",
                  fontSize: "1.35rem",
                  color: "#F5ECD7",
                }}
              >
                Earnings
              </h1>
            </div>
            <Zap className="h-5 w-5 ml-auto" style={{ color: "#4A4035" }} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Today", value: todayTotal, accent: "#F5A623" },
              { label: "Week", value: weekTotal, accent: "#4ade80" },
              { label: "Month", value: monthTotal, accent: "#60a5fa" },
            ].map(({ label, value, accent }) => (
              <div
                key={label}
                className="rounded-xl p-3 text-center"
                style={{ background: "#0D0B08", border: "1px solid rgba(245,166,35,0.08)" }}
              >
                <DollarSign className="h-4 w-4 mx-auto mb-1" style={{ color: accent }} />
                <p
                  style={{
                    fontFamily: "var(--font-bebas)",
                    fontSize: "1.4rem",
                    color: "#F5ECD7",
                    lineHeight: 1,
                  }}
                >
                  ${value.toFixed(2)}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-dm-mono)",
                    fontSize: "9px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#9E8E78",
                    marginTop: "4px",
                  }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 py-5 space-y-4">
        <div
          className="rounded-2xl p-5"
          style={{
            background: "#161410",
            border: "1px solid rgba(245,166,35,0.12)",
          }}
        >
          <h3
            className="text-sm font-semibold mb-4 flex items-center gap-2"
            style={{ color: "#F5ECD7" }}
          >
            <Banknote className="h-4 w-4" style={{ color: "#F5A623" }} />
            Request withdrawal
          </h3>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                style={{ color: "#9E8E78" }}
              >
                $
              </span>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl py-3 pl-8 pr-3 text-sm outline-none"
                style={{
                  background: "#1F1C18",
                  border: "1px solid rgba(245,166,35,0.15)",
                  color: "#F5ECD7",
                }}
                min="1"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                const amount = parseFloat(withdrawAmount);
                if (!amount || amount <= 0) {
                  toast.error("Enter a valid amount");
                  return;
                }
                payoutMutation.mutate(amount);
              }}
              disabled={payoutMutation.isPending}
              className="rounded-xl px-5 py-3 font-bold text-sm"
              style={{
                background: "#F5A623",
                color: "#0D0B08",
                fontFamily: "var(--font-dm-mono)",
                letterSpacing: "0.06em",
              }}
            >
              Cash out
            </button>
          </div>
          <p style={{ fontSize: "11px", color: "#4A4035", marginTop: "10px" }}>
            Min. $10 · Transfers in 2–3 business days
          </p>
        </div>

        <div
          className="rounded-2xl p-5"
          style={{
            background: "#161410",
            border: "1px solid rgba(245,166,35,0.08)",
          }}
        >
          <h3
            className="text-sm font-semibold mb-4 flex items-center gap-2"
            style={{ color: "#F5ECD7" }}
          >
            <Clock className="h-4 w-4" style={{ color: "#F5A623" }} />
            Recent payouts from deliveries
          </h3>
          {earnings.length === 0 ? (
            <p className="text-center py-6" style={{ fontSize: "13px", color: "#4A4035" }}>
              Completed deliveries will show here with your fee per drop.
            </p>
          ) : (
            <div className="space-y-1">
              {earnings.map((earning: any) => (
                <div
                  key={earning.id}
                  className="flex items-center justify-between py-3"
                  style={{
                    borderBottom: "1px solid rgba(245,166,35,0.06)",
                  }}
                >
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "#F5ECD7" }}>
                      {earning.order?.restaurant?.name || "Delivery"}
                    </p>
                    <p style={{ fontSize: "11px", color: "#9E8E78", marginTop: "2px" }}>
                      {earning.createdAt ? formatDate(earning.createdAt) : ""}
                    </p>
                  </div>
                  <p style={{ fontSize: "15px", fontWeight: 700, color: "#4ade80" }}>
                    +${(earning.baseAmount + earning.bonusAmount).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          className="rounded-2xl p-5 flex items-center justify-between"
          style={{
            background: "linear-gradient(135deg, rgba(245,166,35,0.12) 0%, rgba(232,55,42,0.08) 100%)",
            border: "1px solid rgba(245,166,35,0.2)",
          }}
        >
          <div>
            <p style={{ fontSize: "13px", fontWeight: 700, color: "#F5ECD7" }}>Peak hours</p>
            <p style={{ fontSize: "11px", color: "#9E8E78", marginTop: "4px" }}>
              Stay online during lunch & dinner for more assignments
            </p>
          </div>
          <TrendingUp className="h-9 w-9 flex-shrink-0" style={{ color: "#F5A623", opacity: 0.85 }} />
        </div>
      </div>
    </div>
  );
}
