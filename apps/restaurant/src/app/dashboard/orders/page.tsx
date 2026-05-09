"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/authStore";
import { orderApi } from "@/lib/api";
import { CheckCircle, XCircle, Clock, ChefHat, Bell, Package, Bike, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const TABS = [
  { key: "pending",   label: "New",        color: "#F5A623" },
  { key: "confirmed", label: "Confirmed",  color: "#60a5fa" },
  { key: "preparing", label: "Preparing",  color: "#fb923c" },
  { key: "ready",     label: "Ready",      color: "#c084fc" },
  { key: "delivered", label: "Delivered",  color: "#4ade80" },
  { key: "cancelled", label: "Cancelled",  color: "#f87171" },
];

const STATUS_NEXT: Record<string, { status: string; label: string; icon: any; color: string }> = {
  pending:   { status: "confirmed", label: "Accept Order",      icon: CheckCircle, color: "#4ade80"  },
  confirmed: { status: "preparing", label: "Start Preparing",   icon: ChefHat,     color: "#fb923c"  },
  preparing: { status: "ready",     label: "Mark Ready",        icon: Package,     color: "#c084fc"  },
  ready:     { status: "ready",     label: "Awaiting Rider",    icon: Bike,        color: "#818cf8"  },
};

export default function RestaurantOrdersPage() {
  const { accessToken, restaurantId } = useAuthStore();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("pending");
  const [newCount, setNewCount] = useState(0);

  const { data: ordersData, refetch } = useQuery({
    queryKey: ["restaurant-orders", activeTab],
    queryFn: () => orderApi.list({ status: activeTab, limit: 50 }).then((r) => r.data.data),
    refetchInterval: 20000,
  });

  const orders = ordersData?.data || [];

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      orderApi.updateStatus(id, status),
    onSuccess: (_, vars) => {
      refetch();
      qc.invalidateQueries({ queryKey: ["restaurant-orders"] });
      if (vars.status === "confirmed") toast.success("Order accepted! Kitchen notified.");
      else if (vars.status === "ready") toast.success("Rider being dispatched…");
      else toast.success("Status updated");
    },
    onError: () => toast.error("Failed to update order"),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => orderApi.updateStatus(id, "cancelled"),
    onSuccess: () => {
      refetch();
      toast.error("Order rejected");
    },
  });

  // Socket.IO — listen for incoming orders
  useEffect(() => {
    if (!accessToken || !restaurantId) return;
    const socket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000", {
      auth: { token: accessToken },
    });
    socket.on("connect", () => {
      socket.emit("join_restaurant", restaurantId);
    });
    socket.on("new_order_incoming", (order: any) => {
      setNewCount((c) => c + 1);
      refetch();
      toast.custom(
        (t) => (
          <div
            className={`flex items-start gap-3 rounded-2xl px-5 py-4 shadow-2xl transition-all ${t.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
            style={{ background: "#161410", border: "1px solid rgba(245,166,35,0.4)", minWidth: "300px" }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0" style={{ background: "rgba(245,166,35,0.15)" }}>
              <Bell className="h-5 w-5" style={{ color: "#F5A623" }} />
            </div>
            <div className="flex-1">
              <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#F5A623" }}>New Order!</p>
              <p style={{ color: "#F5ECD7", fontSize: "14px", marginTop: "2px" }}>
                {order.customer?.name} — <span style={{ color: "#F5A623" }}>${order.total?.toFixed(2)}</span>
              </p>
              <p style={{ color: "#9E8E78", fontSize: "12px", marginTop: "2px" }}>
                {order.items?.length} item{order.items?.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={() => { setActiveTab("pending"); toast.dismiss(t.id); }}
              style={{ fontFamily: "var(--font-dm-mono)", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#F5A623", marginTop: "2px" }}
            >
              View →
            </button>
          </div>
        ),
        { duration: 10000, position: "top-right" }
      );
    });
    return () => { socket.disconnect(); };
  }, [accessToken, restaurantId]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#9E8E78" }}>— Live</span>
          <h1 style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic", fontSize: "2rem", color: "#F5ECD7", marginTop: "2px" }}>Orders</h1>
        </div>
        {newCount > 0 && (
          <button
            onClick={() => { setActiveTab("pending"); setNewCount(0); }}
            className="flex items-center gap-2 rounded-full px-4 py-2 animate-pulse"
            style={{ background: "rgba(245,166,35,0.15)", border: "1px solid rgba(245,166,35,0.4)" }}
          >
            <Bell className="h-4 w-4" style={{ color: "#F5A623" }} />
            <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#F5A623" }}>
              {newCount} new
            </span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar rounded-2xl p-1.5" style={{ background: "#161410" }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); if (tab.key === "pending") setNewCount(0); }}
            className="flex-shrink-0 rounded-xl px-4 py-2 transition-all"
            style={{
              background: activeTab === tab.key ? tab.color + "1A" : "transparent",
              border: `1px solid ${activeTab === tab.key ? tab.color + "50" : "transparent"}`,
              fontFamily: "var(--font-dm-mono)", fontSize: "10px", letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: activeTab === tab.key ? tab.color : "#4A4035",
            }}
          >
            {tab.label}
            {tab.key === "pending" && newCount > 0 && (
              <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold" style={{ background: "#F5A623", color: "#0D0B08" }}>{newCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Order cards */}
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 rounded-2xl" style={{ background: "#161410", border: "1px solid rgba(245,166,35,0.08)" }}>
          <Clock className="h-10 w-10 mb-3" style={{ color: "#4A4035" }} />
          <p style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic", fontSize: "1.25rem", color: "#9E8E78" }}>No {activeTab} orders</p>
          <p style={{ color: "#4A4035", fontSize: "13px", marginTop: "4px" }}>They'll appear here in real time</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {orders.map((order: any) => (
            <OrderCard
              key={order.id}
              order={order}
              onAdvance={(id: string, status: string) => updateMutation.mutate({ id, status })}
              onReject={(id: string) => rejectMutation.mutate(id)}
              isLoading={updateMutation.isPending || rejectMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, onAdvance, onReject, isLoading }: {
  order: any;
  onAdvance: (id: string, status: string) => void;
  onReject: (id: string) => void;
  isLoading: boolean;
}) {
  const next = STATUS_NEXT[order.status];
  const isNew = order.status === "pending";
  const elapsed = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: "#161410",
        border: `1px solid ${isNew ? "rgba(245,166,35,0.4)" : "rgba(245,166,35,0.12)"}`,
        boxShadow: isNew ? "0 0 20px rgba(245,166,35,0.1)" : "none",
      }}
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(245,166,35,0.08)", background: isNew ? "rgba(245,166,35,0.06)" : "transparent" }}>
        <div>
          <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "12px", letterSpacing: "0.1em", color: "#F5ECD7", fontWeight: 600 }}>
            #{order.id.slice(-6).toUpperCase()}
          </p>
          <p style={{ fontSize: "11px", color: "#9E8E78" }}>{order.customer?.name}</p>
        </div>
        <div className="text-right">
          <p style={{ fontFamily: "var(--font-bebas)", fontSize: "1.4rem", color: "#F5A623", lineHeight: 1 }}>${order.total?.toFixed(2)}</p>
          <p style={{ fontSize: "10px", color: "#4A4035" }}>{elapsed}m ago</p>
        </div>
      </div>

      {/* Items */}
      <div className="px-4 py-3 flex-1 space-y-1.5">
        {order.items?.map((item: any) => (
          <div key={item.id} className="flex justify-between items-start">
            <p style={{ fontSize: "13px", color: "#F5ECD7" }}>
              <span style={{ color: "#F5A623", fontFamily: "var(--font-bebas)", fontSize: "1rem", marginRight: "6px" }}>{item.quantity}×</span>
              {item.name}
            </p>
            <p style={{ fontSize: "12px", color: "#9E8E78" }}>${(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
        {order.customerNote && (
          <p className="mt-2 rounded-xl px-3 py-2 text-xs italic" style={{ background: "rgba(245,166,35,0.06)", color: "#9E8E78", borderLeft: "2px solid rgba(245,166,35,0.3)" }}>
            "{order.customerNote}"
          </p>
        )}
      </div>

      {/* Status + actions */}
      {order.status !== "delivered" && order.status !== "cancelled" && (
        <div className="px-4 pb-4 pt-2 flex gap-2" style={{ borderTop: "1px solid rgba(245,166,35,0.08)" }}>
          {/* Reject — only for pending */}
          {isNew && (
            <button
              onClick={() => onReject(order.id)}
              disabled={isLoading}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 flex-shrink-0 transition-all"
              style={{ background: "rgba(232,55,42,0.1)", border: "1px solid rgba(232,55,42,0.3)", color: "#f87171" }}
            >
              <XCircle className="h-4 w-4" />
              <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Reject</span>
            </button>
          )}

          {/* Advance */}
          {next && order.status !== "ready" && (
            <button
              onClick={() => onAdvance(order.id, next.status)}
              disabled={isLoading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2 transition-all"
              style={{ background: next.color + "1A", border: `1px solid ${next.color}50`, color: next.color }}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <next.icon className="h-4 w-4" />}
              <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase" }}>{next.label}</span>
            </button>
          )}

          {order.status === "ready" && (
            <div className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2" style={{ background: "rgba(129,140,248,0.1)", border: "1px solid rgba(129,140,248,0.3)" }}>
              <Bike className="h-4 w-4" style={{ color: "#818cf8" }} />
              <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#818cf8" }}>Awaiting Rider</span>
            </div>
          )}
        </div>
      )}

      {order.status === "delivered" && (
        <div className="px-4 py-3 flex items-center gap-2" style={{ borderTop: "1px solid rgba(245,166,35,0.08)" }}>
          <CheckCircle className="h-4 w-4" style={{ color: "#4ade80" }} />
          <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#4ade80" }}>Delivered</span>
        </div>
      )}
    </div>
  );
}
