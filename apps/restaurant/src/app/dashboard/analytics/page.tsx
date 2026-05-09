"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { restaurantApi } from "@/lib/api";
import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { TrendingUp, DollarSign, ShoppingBag, XCircle, Loader2, Star } from "lucide-react";

const gold = "#F5A623", night = "#0D0B08", surface = "#161410";
const elevated = "#1F1C18", cream = "#F5ECD7", muted = "#9E8E78";
const border = "rgba(245,166,35,0.15)", flame = "#E8372A";

const PERIODS = [
  { value: "daily",   label: "7 Days"   },
  { value: "weekly",  label: "4 Weeks"  },
  { value: "monthly", label: "12 Months"},
];

// Fallback mock data shown until real orders come in
function generateMock(period: string) {
  const n = period === "daily" ? 7 : period === "weekly" ? 4 : 12;
  const labels = period === "daily"
    ? ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
    : period === "weekly"
    ? ["Week 1","Week 2","Week 3","Week 4"]
    : ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return labels.slice(0, n).map((date, i) => ({
    date,
    revenue: Math.round(1200 + Math.random() * 3000 + i * 200),
    orders: Math.round(8 + Math.random() * 20 + i),
  }));
}

const MOCK_TOP = [
  { name: "Chicken Burger", count: 42, revenue: 14700 },
  { name: "Beef Biryani",   count: 38, revenue: 19000 },
  { name: "Garlic Naan",    count: 30, revenue: 3000  },
  { name: "Mango Shake",    count: 27, revenue: 5400  },
  { name: "Seekh Kabab",    count: 21, revenue: 8400  },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: "0.75rem", padding: "0.75rem 1rem" }}>
      <p style={{ fontFamily: "monospace", fontSize: "0.65rem", letterSpacing: "0.1em", color: muted, marginBottom: "0.375rem" }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ fontFamily: "monospace", fontSize: "0.8rem", color: p.color, margin: "0.1rem 0" }}>
          {p.name}: <strong>{p.name.includes("Revenue") ? `Rs. ${Number(p.value).toLocaleString()}` : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const { restaurantId } = useAuthStore();
  const [period, setPeriod] = useState("weekly");

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["analytics", restaurantId, period],
    queryFn: () => restaurantApi.analytics(restaurantId!, period).then(r => r.data.data).catch(() => null),
    enabled: !!restaurantId,
    retry: false,
  });

  const isMock = !analytics?.summary?.totalOrders;
  const summary = analytics?.summary;
  const revenueData = analytics?.revenueData?.length ? analytics.revenueData : generateMock(period);
  const topItems = analytics?.topItems?.length ? analytics.topItems : MOCK_TOP;

  const stats = [
    { label: "Total Revenue",   value: `Rs. ${Number(summary?.totalRevenue || revenueData.reduce((a: number,b: any) => a+b.revenue, 0)).toLocaleString()}`, icon: DollarSign, color: "#4ad295" },
    { label: "Total Orders",    value: summary?.totalOrders ?? revenueData.reduce((a: number,b: any) => a+b.orders, 0), icon: ShoppingBag, color: gold },
    { label: "Avg Order Value", value: `Rs. ${Math.round(summary?.avgOrderValue || (revenueData.reduce((a: number,b: any) => a+b.revenue, 0) / Math.max(1, revenueData.reduce((a: number,b: any) => a+b.orders, 0))))}`, icon: TrendingUp, color: "#60a5fa" },
    { label: "Cancellations",   value: summary?.cancelledOrders ?? 0, icon: XCircle, color: flame },
  ];

  return (
    <div style={{ fontFamily: "'Lora', serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <span style={{ fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: gold }}>— Analytics</span>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "2rem", color: cream, margin: "0.25rem 0 0.25rem" }}>Performance</h1>
          {isMock && <p style={{ color: muted, fontSize: "0.75rem", fontFamily: "monospace", letterSpacing: "0.08em" }}>⚡ Preview data — real numbers appear as orders come in</p>}
        </div>
        <div style={{ display: "flex", gap: "0.375rem", background: elevated, borderRadius: "3rem", padding: "0.25rem" }}>
          {PERIODS.map(p => (
            <button key={p.value} onClick={() => setPeriod(p.value)} style={{
              borderRadius: "3rem", padding: "0.4rem 1rem",
              background: period === p.value ? gold : "transparent",
              color: period === p.value ? night : muted,
              border: "none", fontFamily: "monospace", fontSize: "0.65rem",
              letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer",
              fontWeight: period === p.value ? 700 : 400, transition: "all 0.15s",
            }}>{p.label}</button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
          <Loader2 size={32} color={gold} style={{ animation: "spin 1s linear infinite" }} />
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.875rem", marginBottom: "1.5rem" }}>
            {stats.map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} style={{ background: surface, borderRadius: "1rem", border: `1px solid ${border}`, padding: "1.25rem" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "0.75rem", background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.875rem" }}>
                    <Icon size={17} color={s.color} />
                  </div>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1.5rem", color: cream, margin: "0 0 0.2rem" }}>{s.value}</p>
                  <p style={{ fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: muted, margin: 0 }}>{s.label}</p>
                </div>
              );
            })}
          </div>

          {/* Revenue Chart */}
          <div style={{ background: surface, borderRadius: "1.25rem", border: `1px solid ${border}`, padding: "1.5rem", marginBottom: "1.25rem" }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", color: cream, fontSize: "1.1rem", margin: "0 0 1.25rem" }}>Revenue & Orders Over Time</p>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={gold}   stopOpacity={0.25} />
                    <stop offset="95%" stopColor={gold}   stopOpacity={0}    />
                  </linearGradient>
                  <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#60a5fa" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={border} />
                <XAxis dataKey="date" tick={{ fill: muted, fontSize: 10, fontFamily: "monospace" }} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left"  tick={{ fill: muted, fontSize: 10, fontFamily: "monospace" }} tickLine={false} axisLine={false} tickFormatter={v => `${Math.round(v/1000)}k`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: muted, fontSize: 10, fontFamily: "monospace" }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontFamily: "monospace", fontSize: "0.65rem", letterSpacing: "0.08em", paddingTop: "0.5rem" }} />
                <Area yAxisId="left"  type="monotone" dataKey="revenue" name="Revenue (Rs.)" stroke={gold}      strokeWidth={2} fill="url(#revGrad)" dot={false} />
                <Area yAxisId="right" type="monotone" dataKey="orders"  name="Orders"        stroke="#60a5fa"   strokeWidth={2} fill="url(#ordGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Top Items */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
            {/* Chart */}
            <div style={{ background: surface, borderRadius: "1.25rem", border: `1px solid ${border}`, padding: "1.5rem" }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", color: cream, fontSize: "1.1rem", margin: "0 0 1.25rem" }}>Top Selling Items</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={topItems.slice(0, 6)} layout="vertical" margin={{ left: 0, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={border} horizontal={false} />
                  <XAxis type="number" tick={{ fill: muted, fontSize: 10, fontFamily: "monospace" }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: cream, fontSize: 10, fontFamily: "'Lora', serif" }} tickLine={false} width={100} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Orders" fill={gold} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue by Item */}
            <div style={{ background: surface, borderRadius: "1.25rem", border: `1px solid ${border}`, padding: "1.5rem" }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", color: cream, fontSize: "1.1rem", margin: "0 0 1.25rem" }}>Revenue by Item</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                {topItems.slice(0, 6).map((item: any, i: number) => {
                  const pct = Math.round((item.count / (topItems[0]?.count || 1)) * 100);
                  return (
                    <div key={item.name ?? item.menuItemId} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span style={{ fontFamily: "monospace", fontSize: "0.65rem", color: i === 0 ? gold : muted, width: 16, textAlign: "right", fontWeight: 700 }}>{i + 1}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                          <span style={{ fontFamily: "'Lora', serif", fontSize: "0.8rem", color: cream, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</span>
                          <span style={{ fontFamily: "monospace", fontSize: "0.7rem", color: gold, flexShrink: 0, marginLeft: "0.5rem" }}>
                            Rs. {Number(item.revenue).toLocaleString()}
                          </span>
                        </div>
                        <div style={{ height: 4, background: elevated, borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: i === 0 ? gold : `${gold}60`, borderRadius: 2, transition: "width 0.6s ease" }} />
                        </div>
                      </div>
                      <span style={{ fontFamily: "monospace", fontSize: "0.6rem", color: muted, flexShrink: 0 }}>{item.count} orders</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
