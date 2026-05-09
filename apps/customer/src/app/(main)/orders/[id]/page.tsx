"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";
import Link from "next/link";
import {
  CheckCircle,
  Clock,
  Package,
  Truck,
  MapPin,
  Star,
  RotateCcw,
  ChevronLeft,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { orderApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { ORDER_STATUS_LABELS } from "@swiftbyte/shared";

const FLOW = ["pending", "confirmed", "preparing", "ready", "picked_up", "delivered"] as const;

const STATUS_STEPS = [
  { key: "pending", label: "Order placed", icon: Package },
  { key: "confirmed", label: "Restaurant confirmed", icon: CheckCircle },
  { key: "preparing", label: "Preparing your food", icon: Clock },
  { key: "ready", label: "Ready for rider pickup", icon: Package },
  { key: "picked_up", label: "On the way to you", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
] as const;

const card =
  "rounded-2xl border border-[rgba(245,166,35,0.14)] bg-[#161410] p-5 shadow-[0_8px_40px_rgba(0,0,0,0.45)]";
const eyebrow = "font-[family-name:var(--font-dm-mono)] text-[10px] uppercase tracking-[0.22em] text-[#9E8E78]";
const muted = "text-[#9E8E78]";

function StarRow({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (n: number) => void;
  label: string;
}) {
  return (
    <div>
      <p className={`text-sm font-semibold text-[#F5ECD7] mb-2`}>{label}</p>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className="p-0.5 rounded-lg transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60"
            aria-label={`${s} star${s > 1 ? "s" : ""}`}
          >
            <Star
              className={`h-8 w-8 ${s <= value ? "fill-[#F5A623] text-[#F5A623]" : "text-[#4A4035]"}`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function OrderTrackingPage() {
  const { id: rawId } = useParams<{ id: string }>();
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const { accessToken } = useAuthStore();
  const [currentStatus, setCurrentStatus] = useState<string>("pending");
  const [restaurantRating, setRestaurantRating] = useState(0);
  const [riderRating, setRiderRating] = useState(0);
  const [comment, setComment] = useState("");
  const [feedbackDone, setFeedbackDone] = useState<null | "rated" | "skipped">(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    data: order,
    refetch,
    isPending: orderLoading,
    isError: orderError,
    error: orderErr,
  } = useQuery({
    queryKey: ["order", id],
    queryFn: () => orderApi.get(id!).then((r) => r.data.data),
    enabled: Boolean(id),
    refetchInterval:
      currentStatus !== "delivered" && currentStatus !== "cancelled" ? 12000 : false,
  });

  const { data: tracking } = useQuery({
    queryKey: ["order-tracking", id],
    queryFn: () => orderApi.getTracking(id!).then((r) => r.data.data),
    enabled:
      !!id &&
      !!order &&
      !!order.riderId &&
      !["delivered", "cancelled"].includes(order.status),
    refetchInterval: 8000,
  });

  const deliveryFeeLooksOdd = useMemo(() => {
    if (!order) return false;
    const f = Number(order.deliveryFee) || 0;
    const s = Number(order.subtotal) || 0;
    return f > 75 || (s > 0 && f > s * 1.75);
  }, [order]);

  useEffect(() => {
    if (order?.status) {
      setCurrentStatus(order.status);
    }
  }, [order?.status]);

  useEffect(() => {
    if (!accessToken || !id) return;
    const socket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000", {
      auth: { token: accessToken },
    });

    socket.on("connect", () => {
      socket.emit("join_order", id);
    });

    socket.on("order_status_changed", (data: { orderId: string; status: string }) => {
      if (data.orderId === id) {
        setCurrentStatus(data.status);
        refetch();
      }
    });

    return () => {
      socket.emit("leave_order", id);
      socket.disconnect();
    };
  }, [accessToken, id, refetch]);

  const stepIndex = useMemo(() => {
    const i = FLOW.indexOf(currentStatus as (typeof FLOW)[number]);
    if (currentStatus === "cancelled") return -1;
    return i === -1 ? 0 : i;
  }, [currentStatus]);

  const isDelivered = currentStatus === "delivered";

  const progressPct =
    stepIndex <= 0 ? 0 : (stepIndex / (STATUS_STEPS.length - 1)) * 100;

  const handleSubmitRating = async () => {
    if (!id || restaurantRating === 0) return;
    setSubmitting(true);
    try {
      await orderApi.rate(id, {
        restaurantScore: restaurantRating,
        restaurantComment: comment,
        riderScore: order?.rider ? riderRating || restaurantRating : 0,
        riderComment: comment,
      });
      setFeedbackDone("rated");
      toast.success("Thanks — your feedback helps us improve.");
    } catch {
      toast.error("Couldn’t send feedback. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!id) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center text-sm text-[#9E8E78]">
        Invalid order link.
      </div>
    );
  }

  if (orderLoading) {
    return (
      <div className="min-h-[50vh] max-w-2xl mx-auto px-4 py-16 flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 text-[#F5A623] animate-spin" />
        <p className={`text-sm ${muted}`}>Loading your order…</p>
      </div>
    );
  }

  if (orderError || !order) {
    const err = orderErr as any;
    const httpStatus = err?.response?.status as number | undefined;
    if (httpStatus === 401) {
      return (
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Link
            href={`/auth/login?redirect=/orders/${encodeURIComponent(id)}`}
            className="inline-flex items-center gap-1 text-sm text-[#F5A623] font-medium mb-6"
          >
            <ChevronLeft className="h-4 w-4" /> Sign in to track this order
          </Link>
          <div className={`${card} text-[#F5ECD7]`}>
            <p className="font-medium">Order tracking needs your account</p>
            <p className={`text-sm ${muted} mt-2`}>
              Sign in with the same email you used to place the order, then you&apos;ll see live status
              here.
            </p>
          </div>
        </div>
      );
    }
    const msg =
      httpStatus === 403
        ? "This order is linked to a different account. Sign in with the customer who placed it."
        : err?.response?.data?.error ||
          err?.response?.data?.detail ||
          err?.message ||
          (!err?.response ? "Network error — is the API running?" : null) ||
          "We couldn’t load this order.";
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1 text-sm text-[#F5A623] font-medium mb-6"
        >
          <ChevronLeft className="h-4 w-4" /> Back to orders
        </Link>
        <div className="rounded-2xl border border-red-500/25 bg-red-950/40 p-6 flex gap-3 text-red-100">
          <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-100">Unable to open tracking</p>
            <p className="text-sm text-red-200/90 mt-1">{msg}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0B08] pb-16">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1 text-sm text-[#9E8E78] hover:text-[#F5ECD7] mb-5 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Orders
        </Link>

        <div className="mb-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="h-display text-2xl sm:text-3xl text-[#F5ECD7]">Track order</h1>
              <p className={`text-sm ${muted} mt-1 font-[family-name:var(--font-dm-mono)] tracking-wide`}>
                #{order.id.slice(-8).toUpperCase()}
              </p>
            </div>
            <span
              className={`shrink-0 text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-xl font-[family-name:var(--font-dm-mono)] ${
                currentStatus === "delivered"
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                  : currentStatus === "cancelled"
                  ? "bg-red-500/15 text-red-300 border border-red-500/30"
                  : "bg-amber-500/12 text-[#F5A623] border border-amber-500/25"
              }`}
            >
              {ORDER_STATUS_LABELS[currentStatus] || currentStatus}
            </span>
          </div>
        </div>

        {currentStatus === "cancelled" && (
          <div
            className={`${card} mb-5 border-amber-500/20 text-sm text-[#F5ECD7]`}
          >
            This order was cancelled. If you were charged, contact support.
          </div>
        )}

        {/* Status stepper */}
        {currentStatus !== "cancelled" && (
          <div className={`${card} mb-5`}>
            <p className={`${eyebrow} mb-4 text-[#F5A623]`}>Progress</p>
            <div className="relative">
              <div className="absolute left-5 top-5 bottom-10 w-px bg-[#2a261f]" />
              <div
                className="absolute left-5 top-5 w-px bg-gradient-to-b from-[#F5A623] to-[#c084fc] transition-all duration-700"
                style={{ height: `${progressPct}%` }}
              />

              <div className="space-y-6">
                {STATUS_STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const isComplete = idx < stepIndex || (isDelivered && idx === stepIndex);
                  const isCurrent = idx === stepIndex && !isDelivered;

                  return (
                    <div key={step.key} className="relative flex items-center gap-4">
                      <div
                        className={`relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                          isComplete
                            ? "border-[#F5A623] bg-[#F5A623]/20"
                            : isCurrent
                            ? "border-[#F5A623] bg-[#F5A623]/10 shadow-[0_0_20px_rgba(245,166,35,0.25)]"
                            : "border-[#3d362c] bg-[#1F1C18]"
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 ${
                            isComplete
                              ? "text-[#F5A623]"
                              : isCurrent
                              ? "text-[#F5A623]"
                              : "text-[#4A4035]"
                          }`}
                        />
                        {isCurrent && (
                          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[#F5A623]" />
                        )}
                      </div>
                      <div>
                        <p
                          className={`text-sm font-semibold ${
                            isComplete || isCurrent ? "text-[#F5ECD7]" : "text-[#4A4035]"
                          }`}
                        >
                          {step.label}
                        </p>
                        {isCurrent && (
                          <p className="text-xs text-[#F5A623] mt-0.5">In progress…</p>
                        )}
                        {isComplete && !isCurrent && (
                          <p className="text-xs text-emerald-400/90 mt-0.5">Completed</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {order.estimatedDelivery && !["delivered", "cancelled"].includes(currentStatus) && (
              <div className="mt-4 rounded-xl bg-[#1F1C18] border border-[rgba(245,166,35,0.12)] p-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#F5A623]" />
                <span className="text-sm font-medium text-[#F5ECD7]">
                  Est. delivery:{" "}
                  {new Date(order.estimatedDelivery).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
          </div>
        )}

        {tracking?.riderLocation && ["picked_up"].includes(currentStatus) && (
          <div className={`${card} mb-5`}>
            <p className={eyebrow}>Rider location</p>
            <p className="text-sm text-[#F5ECD7] font-mono mt-2">
              {tracking.riderLocation.lat.toFixed(5)}, {tracking.riderLocation.lng.toFixed(5)}
            </p>
            <p className={`text-xs ${muted} mt-1`}>Updates while en route</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          {order.restaurant && (
            <div className={card}>
              <p className={eyebrow}>Restaurant</p>
              <p className="text-sm font-bold text-[#F5ECD7] mt-2">{order.restaurant.name}</p>
              {order.restaurant?.address && (
                <p className={`text-xs ${muted} mt-1`}>{order.restaurant.address}</p>
              )}
            </div>
          )}
          {order.rider && (
            <div className={card}>
              <p className={eyebrow}>Your rider</p>
              <p className="text-sm font-bold text-[#F5ECD7] mt-2">{order.rider.name}</p>
              {order.rider.phone && (
                <a
                  href={`tel:${order.rider.phone}`}
                  className="inline-flex items-center gap-1 text-xs text-[#F5A623] font-semibold mt-2 hover:underline"
                >
                  Call rider
                </a>
              )}
            </div>
          )}
        </div>

        {order.address && (
          <div className={card + " mb-5"}>
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-[#F5A623] mt-0.5 flex-shrink-0" />
              <div>
                <p className={eyebrow}>Delivering to</p>
                <p className="text-sm font-semibold text-[#F5ECD7] mt-1">{order.address.label}</p>
                <p className={`text-sm ${muted}`}>{order.address.fullAddress}</p>
              </div>
            </div>
          </div>
        )}

        <div className={card + " mb-5"}>
          <h3 className="text-sm font-bold text-[#F5ECD7] mb-3">Order summary</h3>
          <div className="space-y-2">
            {order.items?.map((item: { id: string; name: string; quantity: number; price: number }) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-[#C4B5A0]">
                  {item.quantity}× {item.name}
                </span>
                <span className="font-semibold text-[#F5ECD7]">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-[rgba(245,166,35,0.12)] mt-3 pt-3 space-y-1">
            <div className={`flex justify-between text-sm ${muted}`}>
              <span>Subtotal</span>
              <span className="text-[#F5ECD7]">${order.subtotal?.toFixed(2)}</span>
            </div>
            <div className={`flex justify-between text-sm ${muted}`}>
              <span>Delivery</span>
              <span className="text-[#F5ECD7]">${order.deliveryFee?.toFixed(2)}</span>
            </div>
            {deliveryFeeLooksOdd && (
              <p className="text-xs text-amber-200/80 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2 py-1.5 mt-1">
                This delivery fee reflects the distance between the restaurant and your address. If it
                looks wrong, check your saved address or contact support.
              </p>
            )}
            {order.discount > 0 && (
              <div className="flex justify-between text-sm text-emerald-400/90">
                <span>Discount</span>
                <span>-${order.discount?.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-[#F5ECD7] pt-2">
              <span>Total</span>
              <span>${order.total?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Inline feedback — always visible for delivered orders */}
        {isDelivered && !feedbackDone && (
          <div
            id="feedback"
            className={`${card} mb-5 border-[rgba(192,132,252,0.25)] bg-gradient-to-b from-[#1a1624] to-[#161410] scroll-mt-24`}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5A623]/15 border border-[#F5A623]/30">
                <Sparkles className="h-5 w-5 text-[#F5A623]" />
              </div>
              <div>
                <p className={`${eyebrow} text-[#c084fc]`}>Your feedback</p>
                <h2 className="h-display text-xl text-[#F5ECD7] mt-1">How was everything?</h2>
                <p className={`text-sm ${muted} mt-1`}>
                  Quick ratings help restaurants and riders on SwiftByte.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <StarRow
                value={restaurantRating}
                onChange={setRestaurantRating}
                label={order.restaurant?.name ? `Rate ${order.restaurant.name}` : "Rate the restaurant"}
              />

              {order.rider && (
                <StarRow
                  value={riderRating}
                  onChange={setRiderRating}
                  label={`Rate ${order.rider.name}`}
                />
              )}

              <div>
                <p className={`text-sm font-semibold text-[#F5ECD7] mb-2`}>Comments (optional)</p>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What stood out? Dish, packaging, timing…"
                  rows={3}
                  className="w-full rounded-xl border border-[rgba(245,166,35,0.2)] bg-[#0D0B08] text-[#F5ECD7] placeholder:text-[#4A4035] text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFeedbackDone("skipped");
                    toast("No problem — enjoy your next order.");
                  }}
                  className="btn-outline flex-1 justify-center"
                >
                  Skip
                </button>
                <button
                  type="button"
                  disabled={restaurantRating === 0 || submitting}
                  onClick={handleSubmitRating}
                  className="btn-gold flex-1 justify-center disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none"
                >
                  {submitting ? "Sending…" : "Submit feedback"}
                </button>
              </div>
            </div>
          </div>
        )}

        {isDelivered && feedbackDone === "rated" && (
          <div
            className={`${card} mb-5 border-emerald-500/25 bg-emerald-950/25 flex items-center gap-3`}
          >
            <CheckCircle className="h-8 w-8 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-[#F5ECD7]">Thank you</p>
              <p className={`text-sm ${muted} mt-0.5`}>
                We appreciate you taking a moment to share feedback.
              </p>
            </div>
          </div>
        )}

        {isDelivered && feedbackDone === "skipped" && (
          <div className={`${card} mb-5 border-[#3d362c]`}>
            <p className={`text-sm ${muted}`}>
              You skipped feedback for this order. You can still rate future deliveries from this page
              when they complete.
            </p>
          </div>
        )}

        {isDelivered &&
          (order.restaurant?.id ? (
            <Link
              href={`/restaurants/${order.restaurant.id}`}
              className="btn-outline w-full h-12 text-sm flex items-center justify-center gap-2 border-[rgba(245,166,35,0.25)]"
            >
              <RotateCcw className="h-4 w-4" />
              Order again
            </Link>
          ) : (
            <Link
              href="/restaurants"
              className="btn-outline w-full h-12 text-sm flex items-center justify-center gap-2 border-[rgba(245,166,35,0.25)]"
            >
              Browse restaurants
            </Link>
          ))}
      </div>
    </div>
  );
}
