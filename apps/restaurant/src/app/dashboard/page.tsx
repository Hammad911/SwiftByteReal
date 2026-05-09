"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { restaurantApi, orderApi } from "@/lib/api";
import { DollarSign, ShoppingBag, TrendingUp, AlertCircle, Clock, ArrowUpRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@swiftbyte/shared";
import Link from "next/link";

const STATUS_COLOR: Record<string, string> = {
  delivered: "#4ade80", cancelled: "#f87171", pending: "#F5A623",
  preparing: "#fb923c", confirmed: "#60a5fa", ready: "#c084fc", picked_up: "#818cf8",
};

export default function DashboardOverview() {
  const { restaurantId } = useAuthStore();

  // Check if restaurant is approved
  const { data: myRestaurant } = useQuery({
    queryKey: ["my-restaurant-status", restaurantId],
    queryFn: () => import("@/lib/api").then(m => m.restaurantApi.mine()).then(r => r.data.data),
    enabled: true,
    retry: false,
  });

  if (myRestaurant && !myRestaurant.isApproved) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center", padding: "2rem" }}>
        <div style={{ width: 80, height: 80, background: "rgba(245,166,35,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
          <Clock size={40} color="#F5A623" />
        </div>
        <h2 style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic", fontSize: "2rem", color: "#F5ECD7", margin: "0 0 0.75rem" }}>
          Application Under Review
        </h2>
        <p style={{ fontFamily: "var(--font-lora)", color: "#9E8E78", maxWidth: 400, lineHeight: 1.8, margin: "0 0 1.5rem" }}>
          Your restaurant <strong style={{ color: "#F5ECD7" }}>{myRestaurant.name}</strong> has been submitted and is currently under review by our team. You'll be able to manage orders once it's approved.
        </p>
        <div style={{ padding: "1rem 1.5rem", borderRadius: "0.75rem", background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.2)", fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#F5A623" }}>
          Status: Pending Approval
        </div>
      </div>
    );
  }

  const { data: analytics } = useQuery({
    queryKey: ["restaurant-analytics", restaurantId],
    queryFn: () => restaurantApi.analytics(restaurantId!, "weekly").then((r) => r.data.data),
    enabled: !!restaurantId,
  });

  const { data: ordersData } = useQuery({
    queryKey: ["restaurant-orders-recent", restaurantId],
    queryFn: () => orderApi.list({ limit: 5 }).then((r) => r.data.data),
  });

  const recentOrders = ordersData?.data || [];
  const revenueData  = analytics?.revenueData || [];
  const summary      = analytics?.summary;

  const STATS = [
    { label: "Revenue", value: formatCurrency(summary?.totalRevenue || 0),  icon: DollarSign, change: "+12.5%" },
    { label: "Orders",  value: summary?.totalOrders || 0,                   icon: ShoppingBag, change: "+8.2%" },
    { label: "Avg Order", value: formatCurrency(summary?.avgOrderValue || 0), icon: TrendingUp, change: "+3.1%" },
    { label: "Cancels", value: `${(summary?.cancellationRate || 0).toFixed(1)}%`, icon: AlertCircle, change: "-0.8%" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#9E8E78" }}>— This Week</span>
        <h1 style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic", fontSize: "2rem", color: "#F5ECD7", marginTop: "4px" }}>Overview</h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map(({ label, value, icon: Icon, change }) => (
          <div key={label} className="rounded-2xl p-5" style={{ background: "#161410", border: "1px solid rgba(245,166,35,0.12)" }}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "rgba(245,166,35,0.1)" }}>
                <Icon className="h-4 w-4" style={{ color: "#F5A623" }} />
              </div>
              <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: "rgba(74,188,120,0.12)", color: "#4ade80" }}>{change}</span>
            </div>
            <p style={{ fontFamily: "var(--font-bebas)", fontSize: "1.8rem", color: "#F5ECD7", lineHeight: 1 }}>{value}</p>
            <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9E8E78", marginTop: "4px" }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Revenue chart */}
        <div className="rounded-2xl p-5 xl:col-span-2" style={{ background: "#161410", border: "1px solid rgba(245,166,35,0.12)" }}>
          <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#9E8E78", marginBottom: "16px" }}>Revenue — Last 4 Weeks</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="gold-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#F5A623" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#F5A623" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,166,35,0.08)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#4A4035" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#4A4035" }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ background: "#161410", border: "1px solid rgba(245,166,35,0.2)", borderRadius: "12px", fontSize: "12px", color: "#F5ECD7" }}
                formatter={(v: any) => [`$${v.toFixed(2)}`, "Revenue"]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#F5A623" strokeWidth={2} fill="url(#gold-grad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top items */}
        <div className="rounded-2xl p-5" style={{ background: "#161410", border: "1px solid rgba(245,166,35,0.12)" }}>
          <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#9E8E78", marginBottom: "16px" }}>Top Selling Items</p>
          <div className="space-y-3">
            {(analytics?.topItems || []).slice(0, 6).map((item: any, idx: number) => (
              <div key={item.menuItemId} className="flex items-center gap-3">
                <span style={{ fontFamily: "var(--font-bebas)", fontSize: "1.1rem", color: "#F5A623", width: "1.2rem" }}>{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate" style={{ color: "#F5ECD7" }}>{item.name}</p>
                  <p style={{ fontSize: "11px", color: "#9E8E78" }}>{item.count} orders</p>
                </div>
                <span className="text-sm font-bold" style={{ color: "#F5A623" }}>${item.revenue?.toFixed(2)}</span>
              </div>
            ))}
            {(!analytics?.topItems || analytics.topItems.length === 0) && (
              <p className="text-sm text-center py-6" style={{ color: "#4A4035" }}>No data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="rounded-2xl p-5" style={{ background: "#161410", border: "1px solid rgba(245,166,35,0.12)" }}>
        <div className="flex items-center justify-between mb-5">
          <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#9E8E78" }}>Recent Orders</p>
          <Link href="/dashboard/orders" className="flex items-center gap-1 text-xs transition-colors" style={{ color: "#F5A623", fontFamily: "var(--font-dm-mono)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            View all <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(245,166,35,0.1)" }}>
                {["Order", "Customer", "Items", "Total", "Status"].map((h) => (
                  <th key={h} className="pb-3 text-left" style={{ fontFamily: "var(--font-dm-mono)", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#4A4035" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order: any) => (
                <tr key={order.id} style={{ borderBottom: "1px solid rgba(245,166,35,0.06)" }}>
                  <td className="py-3" style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", color: "#9E8E78" }}>#{order.id.slice(-6).toUpperCase()}</td>
                  <td className="py-3 font-medium" style={{ color: "#F5ECD7" }}>{order.customer?.name}</td>
                  <td className="py-3 max-w-[180px] truncate" style={{ color: "#9E8E78" }}>{order.items?.slice(0, 2).map((i: any) => i.name).join(", ")}</td>
                  <td className="py-3 font-bold" style={{ color: "#F5A623" }}>${order.total?.toFixed(2)}</td>
                  <td className="py-3">
                    <span className={`badge badge-${order.status}`}>{order.status?.replace(/_/g, " ")}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentOrders.length === 0 && <p className="text-center py-8 text-sm" style={{ color: "#4A4035" }}>No recent orders</p>}
        </div>
      </div>
    </div>
  );
}
