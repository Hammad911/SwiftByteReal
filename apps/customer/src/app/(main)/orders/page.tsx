"use client";

import { useQuery } from "@tanstack/react-query";
import { orderApi } from "@/lib/api";
import Link from "next/link";
import {
  Package,
  ChevronRight,
  Clock,
  Star,
  MapPin,
  Loader2,
} from "lucide-react";
import { formatDateTime, ORDER_STATUS_LABELS } from "@swiftbyte/shared";

/** Dark-theme status chips (readable on #0D0B08 / #161410) */
function statusChip(status: string) {
  const base = "text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border";
  const map: Record<string, string> = {
    pending: `${base} border-amber-500/35 text-amber-200 bg-amber-500/10`,
    confirmed: `${base} border-sky-500/30 text-sky-200 bg-sky-500/10`,
    preparing: `${base} border-orange-500/30 text-orange-200 bg-orange-500/10`,
    ready: `${base} border-purple-400/35 text-purple-200 bg-purple-500/10`,
    picked_up: `${base} border-indigo-400/35 text-indigo-200 bg-indigo-500/10`,
    delivered: `${base} border-emerald-500/35 text-emerald-200 bg-emerald-500/10`,
    cancelled: `${base} border-red-500/35 text-red-200 bg-red-500/10`,
  };
  return map[status] || `${base} border-white/10 text-ink-secondary bg-white/5`;
}

export default function OrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => orderApi.list().then((r) => r.data.data),
  });

  const orders = data?.data || [];

  return (
    <div className="min-h-screen bg-night pb-16">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold mb-2"
          style={{ color: "#9E8E78" }}
        >
          History
        </p>
        <h1
          className="font-playfair italic text-3xl sm:text-4xl text-cream mb-1"
        >
          My orders
        </h1>
        <p className="text-sm text-ink-secondary mb-8 max-w-md">
          Track deliveries and leave feedback when your meal arrives.
        </p>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-9 w-9 text-gold animate-spin" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-secondary">
              Loading orders…
            </span>
          </div>
        ) : orders.length === 0 ? (
          <div
            className="rounded-2xl border border-gold/15 bg-surface p-10 text-center shadow-warm-card"
          >
            <Package className="h-12 w-12 text-ink-muted mx-auto mb-4 opacity-80" />
            <h2 className="font-playfair italic text-xl text-cream">No orders yet</h2>
            <p className="text-ink-secondary mt-2 text-sm">
              Your order history will show up here.
            </p>
            <Link
              href="/restaurants"
              className="btn-gold mt-6 inline-flex"
            >
              Browse restaurants
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {orders.map((order: {
              id: string;
              status: string;
              createdAt: string;
              total: number;
              restaurant?: { name?: string };
              items?: Array<{ quantity: number; name: string }>;
            }) => (
              <li key={order.id}>
                <div
                  className="rounded-2xl border border-gold/15 bg-surface p-5 shadow-warm-card transition-all hover:border-gold/30 hover:shadow-[0_12px_40px_-8px_rgba(245,166,35,0.12)]"
                >
                  <Link
                    href={`/orders/${order.id}`}
                    className="flex items-start justify-between gap-3 group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <p className="font-playfair italic text-lg text-cream group-hover:text-gold transition-colors truncate">
                          {order.restaurant?.name ?? "Restaurant"}
                        </p>
                        <span className={statusChip(order.status)}>
                          {ORDER_STATUS_LABELS[order.status] || order.status}
                        </span>
                      </div>
                      <p className="text-sm text-ink-secondary line-clamp-2 leading-relaxed">
                        {order.items?.slice(0, 3).map((i) => `${i.quantity}× ${i.name}`).join(" · ")}
                        {(order.items?.length ?? 0) > 3 &&
                          ` +${(order.items?.length ?? 0) - 3} more`}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-ink-secondary">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-gold/70 flex-shrink-0" />
                          {formatDateTime(order.createdAt)}
                        </span>
                        <span className="font-bebas text-lg text-gold tracking-wide">
                          ${Number(order.total).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-ink-muted flex-shrink-0 mt-1 group-hover:text-gold transition-colors" />
                  </Link>

                  <div className="mt-4 pt-4 border-t border-gold/10 flex flex-wrap gap-2">
                    <Link
                      href={`/orders/${order.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-gold hover:opacity-90"
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      Track order
                    </Link>
                    {order.status === "delivered" && (
                      <Link
                        href={`/orders/${order.id}#feedback`}
                        className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-cream/90 hover:text-gold ml-3"
                      >
                        <Star className="h-3.5 w-3.5 text-gold" />
                        Rate & feedback
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
