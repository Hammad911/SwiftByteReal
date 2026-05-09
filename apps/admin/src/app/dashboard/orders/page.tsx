"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { useState } from "react";
import { Loader2, ShoppingBag } from "lucide-react";

const gold = "#F5A623", night = "#0D0B08", surface = "#161410";
const elevated = "#1F1C18", cream = "#F5ECD7", muted = "#9E8E78";
const border = "rgba(245,166,35,0.15)", flame = "#E8372A";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending", confirmed: "Confirmed", preparing: "Preparing",
  ready: "Ready", picked_up: "Picked Up", delivered: "Delivered", cancelled: "Cancelled",
};

const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  pending:    { bg: "rgba(245,166,35,0.12)",  color: gold },
  confirmed:  { bg: "rgba(96,165,250,0.12)",  color: "#60a5fa" },
  preparing:  { bg: "rgba(251,146,60,0.12)",  color: "#fb923c" },
  ready:      { bg: "rgba(168,85,247,0.12)",  color: "#a855f7" },
  picked_up:  { bg: "rgba(74,222,128,0.1)",   color: "#4ade80" },
  delivered:  { bg: "rgba(74,222,128,0.15)",  color: "#4ade80" },
  cancelled:  { bg: `${flame}12`,             color: flame },
};

const STATUS_OPTIONS = ["", "pending", "confirmed", "preparing", "ready", "picked_up", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const [status, setStatus] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", status],
    queryFn: () => adminApi.orders({ status: status || undefined }).then((r) => r.data.data),
  });

  const orders = data?.data || [];

  return (
    <div style={{ fontFamily: "'Lora', serif" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.75rem" }}>
        <span style={{ fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: gold }}>— Orders</span>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "2rem", color: cream, margin: "0.25rem 0 0" }}>All Orders</h1>
      </div>

      {/* Status filter pills */}
      <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
        {STATUS_OPTIONS.map(s => (
          <button key={s} onClick={() => setStatus(s)} style={{
            borderRadius: "3rem", padding: "0.375rem 0.875rem",
            background: status === s ? gold : elevated,
            color: status === s ? night : muted,
            border: `1px solid ${status === s ? gold : border}`,
            fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.1em",
            textTransform: "uppercase", cursor: "pointer", fontWeight: status === s ? 700 : 400,
          }}>{s === "" ? "All" : STATUS_LABELS[s] ?? s}</button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: surface, borderRadius: "1.25rem", border: `1px solid ${border}`, overflow: "hidden" }}>
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
            <Loader2 size={28} color={gold} style={{ animation: "spin 1s linear infinite" }} />
          </div>
        ) : orders.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <ShoppingBag size={36} color={muted} style={{ margin: "0 auto 0.75rem" }} />
            <p style={{ color: muted, fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>No orders found</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${border}` }}>
                  {["Order ID", "Customer", "Restaurant", "Rider", "Total", "Status", "Date"].map(h => (
                    <th key={h} style={{ padding: "0.875rem 1rem", textAlign: "left", fontFamily: "monospace", fontSize: "0.55rem", letterSpacing: "0.15em", textTransform: "uppercase", color: muted, fontWeight: 400, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any, i: number) => {
                  const sc = STATUS_COLOR[order.status] ?? { bg: elevated, color: muted };
                  return (
                    <tr key={order.id} style={{ borderBottom: i < orders.length - 1 ? `1px solid rgba(245,166,35,0.06)` : "none" }}>
                      <td style={{ padding: "1rem" }}>
                        <span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: gold, fontWeight: 700 }}>#{order.id.slice(-6).toUpperCase()}</span>
                      </td>
                      <td style={{ padding: "1rem", color: cream, fontSize: "0.85rem" }}>{order.customer?.name ?? order.user?.name ?? "—"}</td>
                      <td style={{ padding: "1rem", color: muted, fontSize: "0.85rem" }}>{order.restaurant?.name ?? "—"}</td>
                      <td style={{ padding: "1rem", color: muted, fontSize: "0.8rem" }}>{order.rider?.name ?? <span style={{ color: "#4A4035" }}>Unassigned</span>}</td>
                      <td style={{ padding: "1rem" }}>
                        <span style={{ fontFamily: "monospace", fontSize: "0.85rem", color: gold, fontWeight: 700 }}>
                          Rs. {Number(order.total ?? 0).toLocaleString()}
                        </span>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <span style={{ fontFamily: "monospace", fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: "3rem", padding: "0.2rem 0.625rem", background: sc.bg, color: sc.color }}>
                          {STATUS_LABELS[order.status] ?? order.status}
                        </span>
                      </td>
                      <td style={{ padding: "1rem", fontFamily: "monospace", fontSize: "0.7rem", color: muted, whiteSpace: "nowrap" }}>
                        {new Date(order.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
