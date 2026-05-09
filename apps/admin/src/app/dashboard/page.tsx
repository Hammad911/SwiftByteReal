"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { Users, UtensilsCrossed, Bike, ShoppingBag, DollarSign, TrendingUp, AlertCircle, Clock } from "lucide-react";
import { formatCurrency } from "@swiftbyte/shared";

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => adminApi.analytics().then((r) => r.data.data),
    refetchInterval: 30000,
  });

  const STATS = [
    { title: "Customers",        value: data?.totalUsers || 0,                         icon: Users,           color: "#60a5fa" },
    { title: "Restaurants",      value: data?.totalRestaurants || 0,                   icon: UtensilsCrossed, color: "#F5A623" },
    { title: "Riders",           value: data?.totalRiders || 0,                        icon: Bike,            color: "#4ade80" },
    { title: "Total Orders",     value: data?.totalOrders || 0,                        icon: ShoppingBag,     color: "#c084fc" },
    { title: "Today's Revenue",  value: formatCurrency(data?.revenueToday || 0),       icon: DollarSign,      color: "#34d399" },
    { title: "Weekly GMV",       value: formatCurrency(data?.gmv || 0),                icon: TrendingUp,      color: "#818cf8" },
    { title: "Pending Review",   value: data?.pendingRestaurants || 0,                 icon: AlertCircle,     color: "#fb923c" },
    { title: "Orders Today",     value: data?.ordersToday || 0,                        icon: Clock,           color: "#f472b6" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#9E8E78" }}>— Platform</span>
        <h1 style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic", fontSize: "2rem", color: "#F5ECD7", marginTop: "4px" }}>Overview</h1>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(({ title, value, icon: Icon, color }) => (
          <div key={title} className="rounded-2xl p-5" style={{ background: "#161410", border: "1px solid rgba(245,166,35,0.12)" }}>
            {isLoading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-9 w-9 rounded-xl" style={{ background: "#1F1C18" }} />
                <div className="h-6 w-20 rounded" style={{ background: "#1F1C18" }} />
                <div className="h-3 w-24 rounded" style={{ background: "#1F1C18" }} />
              </div>
            ) : (
              <>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl mb-3" style={{ background: color + "1A" }}>
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
                <p style={{ fontFamily: "var(--font-bebas)", fontSize: "1.8rem", color: "#F5ECD7", lineHeight: 1 }}>{value}</p>
                <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9E8E78", marginTop: "4px" }}>{title}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Top restaurants */}
      {data?.topRestaurants?.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: "#161410", border: "1px solid rgba(245,166,35,0.12)" }}>
          <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#9E8E78", marginBottom: "16px" }}>Top Restaurants — This Week</p>
          <div className="space-y-3">
            {data.topRestaurants.map((r: any, idx: number) => (
              <div key={r.id || idx} className="flex items-center gap-3">
                <span style={{ fontFamily: "var(--font-bebas)", fontSize: "1.1rem", color: "#F5A623", width: "1.5rem" }}>#{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate" style={{ color: "#F5ECD7" }}>{r.name}</p>
                  <p style={{ fontSize: "11px", color: "#9E8E78" }}>{r.orders} orders</p>
                </div>
                <span className="font-bold" style={{ color: "#F5A623" }}>{formatCurrency(r.revenue || 0)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders by status */}
      {data?.ordersByStatus?.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: "#161410", border: "1px solid rgba(245,166,35,0.12)" }}>
          <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#9E8E78", marginBottom: "16px" }}>Orders by Status</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {data.ordersByStatus.map((item: any) => (
              <div key={item.status} className="rounded-xl p-3 text-center" style={{ background: "#1F1C18" }}>
                <p style={{ fontFamily: "var(--font-bebas)", fontSize: "1.5rem", color: "#F5ECD7", lineHeight: 1 }}>{item._count?.id || 0}</p>
                <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9E8E78", marginTop: "4px" }}>{item.status?.replace(/_/g, " ")}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
