"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/authStore";
import { riderApi, orderApi, applicationApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Power, Navigation, CheckCircle, Package, MapPin, Phone, Star, DollarSign, Clock, Bike, Zap, Bell, ChevronRight, LogOut, ClipboardList, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function RiderHomePage() {
  const router = useRouter();
  const { user, accessToken, isAuthenticated, logout } = useAuthStore();
  const qc = useQueryClient();
  const [isOnline, setIsOnline] = useState(false);
  const locationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated]);

  const hasRiderAccess =
    user?.role === "admin" ||
    (user?.roles || []).includes("rider") ||
    user?.role === "rider";

  // Check application status for non-riders
  const { data: appData, isLoading: appLoading } = useQuery({
    queryKey: ["my-applications"],
    queryFn: () => applicationApi.my().then(r => r.data.data),
    enabled: isAuthenticated && !hasRiderAccess,
    retry: false,
  });

  const { data: profile } = useQuery({
    queryKey: ["rider-profile"],
    queryFn: () => riderApi.getProfile().then((r) => r.data.data),
    enabled: isAuthenticated && hasRiderAccess,
  });

  const { data: ordersData, refetch } = useQuery({
    queryKey: ["rider-orders"],
    queryFn: () => orderApi.list({ limit: 25 }).then((r) => r.data.data),
    enabled: isAuthenticated && hasRiderAccess,
    refetchInterval: 8000,
  });

  const orderList = ordersData?.data ?? [];
  const myActive = orderList.find(
    (o: any) => ["ready", "picked_up"].includes(o.status) && o.riderId === user?.id
  );
  const poolOffer = orderList.find((o: any) => o.status === "ready" && !o.riderId);
  const activeOrder = myActive ?? poolOffer;
  const needsClaim =
    !!activeOrder && activeOrder.status === "ready" && activeOrder.riderId == null;

  const toggleMutation = useMutation({
    mutationFn: (online: boolean) => riderApi.updateAvailability(online),
    onSuccess: (_, online) => {
      setIsOnline(online);
      qc.invalidateQueries({ queryKey: ["rider-profile"] });
      if (online) {
        toast.success("You're online — orders incoming!");
        startTracking();
      } else {
        toast("Offline");
        stopTracking();
      }
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        "Could not update availability. Try logging out and signing in again.";
      toast.error(msg);
    },
  });

  const requestToggle = () => toggleMutation.mutate(!isOnline);

  useEffect(() => {
    if (profile && typeof profile.isOnline === "boolean") {
      setIsOnline(profile.isOnline);
    }
  }, [profile?.isOnline]);

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => orderApi.updateStatus(id, status),
    onSuccess: () => { refetch(); qc.invalidateQueries({ queryKey: ["rider-orders"] }); toast.success("Status updated!"); },
  });

  const claimMutation = useMutation({
    mutationFn: (orderId: string) => orderApi.claim(orderId),
    onSuccess: () => {
      refetch();
      qc.invalidateQueries({ queryKey: ["rider-orders"] });
      toast.success("You claimed this delivery — head to the restaurant.");
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.error || "Could not claim order"),
  });

  const startTracking = () => {
    if (!navigator.geolocation) return;
    locationIntervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        riderApi.sendLocation(coords.latitude, coords.longitude, activeOrder?.id).catch(() => {});
      });
    }, 10000);
  };
  const stopTracking = () => {
    if (locationIntervalRef.current) { clearInterval(locationIntervalRef.current); locationIntervalRef.current = null; }
  };
  useEffect(() => () => stopTracking(), []);

  useEffect(() => {
    if (!accessToken) return;
    const socket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000", { auth: { token: accessToken } });
    socket.on("connect", () => socket.emit("join_rider"));
    const onOrderForPickup = (data: any) => {
      refetch();
      qc.invalidateQueries({ queryKey: ["rider-orders"] });
      toast.custom(
        (t) => (
          <div
            className={`flex items-start gap-3 rounded-2xl px-5 py-4 transition-all ${t.visible ? "opacity-100" : "opacity-0"}`}
            style={{ background: "#161410", border: "1px solid rgba(192,132,252,0.45)", minWidth: "280px" }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0" style={{ background: "rgba(192,132,252,0.2)" }}>
              <Bell className="h-5 w-5" style={{ color: "#c084fc" }} />
            </div>
            <div>
              <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#c084fc" }}>Food ready</p>
              <p style={{ color: "#F5ECD7", fontSize: "14px", marginTop: "2px" }}>
                {data.restaurantName || "Restaurant"} — order #{data.orderId?.slice(-6).toUpperCase()}
              </p>
              <p style={{ color: "#9E8E78", fontSize: "12px", marginTop: "4px" }}>
                {data?.requiresClaim
                  ? "Open the app and tap Claim if you want this delivery — first come, first served."
                  : "Head to the restaurant for pickup"}
              </p>
            </div>
          </div>
        ),
        { duration: 10000, position: "top-center" }
      );
    };
    socket.on("order_food_ready", onOrderForPickup);
    socket.on("order_needs_rider", (data: any) => {
      refetch();
      qc.invalidateQueries({ queryKey: ["rider-orders"] });
      toast.custom(
        (t) => (
          <div
            className={`flex items-start gap-3 rounded-2xl px-5 py-4 transition-all ${t.visible ? "opacity-100" : "opacity-0"}`}
            style={{ background: "#161410", border: "1px solid rgba(245,166,35,0.35)", minWidth: "280px" }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0" style={{ background: "rgba(245,166,35,0.15)" }}>
              <Bell className="h-5 w-5" style={{ color: "#F5A623" }} />
            </div>
            <div>
              <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#F5A623" }}>Dispatch</p>
              <p style={{ color: "#F5ECD7", fontSize: "14px", marginTop: "2px" }}>
                {data.restaurantName || "Restaurant"} needs a rider — food is ready
              </p>
              <p style={{ color: "#9E8E78", fontSize: "12px", marginTop: "4px" }}>Stay online; orders refresh automatically</p>
            </div>
          </div>
        ),
        { duration: 9000, position: "top-center" }
      );
    });
    return () => { socket.disconnect(); };
  }, [accessToken, refetch, qc]);

  if (!isAuthenticated) return null;

  // ── Non-rider: show application status screen ──────────────────────────
  if (!hasRiderAccess) {
    const riderApp = appData?.rider ?? null;

    const handleLogout = () => { logout(); router.push("/login"); };

    if (appLoading) {
      return (
        <div style={{ minHeight: "100vh", background: "#0D0B08", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 36, height: 36, border: "3px solid rgba(245,166,35,0.2)", borderTopColor: "#F5A623", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
      );
    }

    return (
      <div style={{ minHeight: "100vh", background: "#0D0B08", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", fontFamily: "'Lora', serif" }}>
        {/* Ambient glow */}
        <div style={{ position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)", width: 400, height: 400, borderRadius: "50%", background: "rgba(245,166,35,0.05)", filter: "blur(80px)", pointerEvents: "none" }} />

        <div style={{ width: "100%", maxWidth: 420, position: "relative" }}>
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <div style={{ width: 44, height: 44, borderRadius: "0.875rem", background: "#F5A623", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 24px rgba(245,166,35,0.35)" }}>
                <Zap size={22} color="#0D0B08" />
              </div>
              <div style={{ textAlign: "left" }}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1.4rem", color: "#F5ECD7", lineHeight: 1 }}>SwiftByte</p>
                <p style={{ fontFamily: "monospace", fontSize: "0.55rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#9E8E78" }}>Rider Portal</p>
              </div>
            </div>
          </div>

          {riderApp ? (
            /* ── Application submitted — show status ── */
            <div style={{ background: "#161410", border: "1px solid rgba(245,166,35,0.2)", borderRadius: "1.5rem", padding: "2rem", textAlign: "center" }}>
              {riderApp.status === "approved" ? (
                <>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
                    <CheckCircle size={28} color="#4ade80" />
                  </div>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1.5rem", color: "#F5ECD7", marginBottom: "0.5rem" }}>You&apos;re Approved!</p>
                  <p style={{ color: "#9E8E78", fontSize: "0.875rem", marginBottom: "1.5rem" }}>Your rider account is ready. Please log out and log back in to access your dashboard.</p>
                  <button onClick={handleLogout} style={{ background: "#4ade80", color: "#0D0B08", border: "none", borderRadius: "3rem", padding: "0.75rem 2rem", fontFamily: "monospace", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, cursor: "pointer" }}>
                    Log In Again →
                  </button>
                </>
              ) : riderApp.status === "rejected" ? (
                <>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(232,55,42,0.12)", border: "1px solid rgba(232,55,42,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
                    <AlertCircle size={28} color="#E8372A" />
                  </div>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1.5rem", color: "#F5ECD7", marginBottom: "0.5rem" }}>Application Rejected</p>
                  {riderApp.adminNote && <p style={{ color: "#9E8E78", fontSize: "0.875rem", marginBottom: "0.75rem" }}>Reason: {riderApp.adminNote}</p>}
                  <p style={{ color: "#4A4035", fontSize: "0.8rem", marginBottom: "1.5rem" }}>You may reapply after 30 days.</p>
                  <a href="http://localhost:3000/apply/rider" style={{ display: "inline-block", background: "#F5A623", color: "#0D0B08", borderRadius: "3rem", padding: "0.75rem 2rem", fontFamily: "monospace", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, textDecoration: "none" }}>
                    Reapply →
                  </a>
                </>
              ) : (
                /* pending / more_info_required */
                <>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(245,166,35,0.12)", border: "1px solid rgba(245,166,35,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
                    <ClipboardList size={28} color="#F5A623" />
                  </div>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1.5rem", color: "#F5ECD7", marginBottom: "0.5rem" }}>Application Under Review</p>
                  <p style={{ color: "#9E8E78", fontSize: "0.875rem", marginBottom: "0.5rem" }}>We&apos;re reviewing your application. This usually takes 1–2 business days.</p>
                  {riderApp.adminNote && (
                    <div style={{ background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.2)", borderRadius: "0.75rem", padding: "0.75rem 1rem", marginBottom: "1rem", textAlign: "left" }}>
                      <p style={{ fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#F5A623", marginBottom: "0.25rem" }}>Note from admin</p>
                      <p style={{ color: "#9E8E78", fontSize: "0.8rem" }}>{riderApp.adminNote}</p>
                    </div>
                  )}
                  {/* Status badge */}
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.2)", borderRadius: "3rem", padding: "0.375rem 1rem", marginBottom: "1.5rem" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#F5A623", animation: "pulse 2s infinite" }} />
                    <span style={{ fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#F5A623" }}>
                      {riderApp.status === "more_info_required" ? "More Info Required" : "Pending Review"}
                    </span>
                  </div>
                </>
              )}
              <div style={{ marginTop: "1.5rem", borderTop: "1px solid rgba(245,166,35,0.1)", paddingTop: "1rem" }}>
                <button onClick={handleLogout} style={{ background: "none", border: "none", cursor: "pointer", color: "#4A4035", fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
                  <LogOut size={12} /> Sign Out
                </button>
              </div>
            </div>
          ) : (
            /* ── No application yet ── */
            <div style={{ background: "#161410", border: "1px solid rgba(245,166,35,0.15)", borderRadius: "1.5rem", padding: "2rem", textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(245,166,35,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
                <Bike size={28} color="#F5A623" />
              </div>
              <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1.5rem", color: "#F5ECD7", marginBottom: "0.5rem" }}>Not a Rider Yet</p>
              <p style={{ color: "#9E8E78", fontSize: "0.875rem", marginBottom: "1.75rem" }}>
                Apply to become a SwiftByte delivery rider and start earning on your own schedule.
              </p>
              <a href="http://localhost:3000/apply/rider" style={{ display: "inline-block", background: "#F5A623", color: "#0D0B08", borderRadius: "3rem", padding: "0.875rem 2rem", fontFamily: "monospace", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, textDecoration: "none" }}>
                Apply to Ride →
              </a>
              <div style={{ marginTop: "1.5rem" }}>
                <button onClick={handleLogout} style={{ background: "none", border: "none", cursor: "pointer", color: "#4A4035", fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
                  <LogOut size={12} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const earnings = profile?.earnings;
  const rider = profile
    ? { vehicleType: profile.vehicleType, rating: profile.rating }
    : undefined;

  return (
    <div className="min-h-screen" style={{ background: "#0D0B08" }}>
      {/* ── Header ── */}
      <div style={{ background: "#161410", borderBottom: "1px solid rgba(245,166,35,0.12)" }}>
        <div className="px-5 pt-10 pb-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-base font-bold" style={{ background: "rgba(245,166,35,0.15)", color: "#F5A623", fontFamily: "var(--font-bebas)", fontSize: "1.4rem" }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic", fontSize: "1.1rem", color: "#F5ECD7" }}>{user?.name}</p>
                <div className="flex items-center gap-2">
                  <Bike className="h-3 w-3" style={{ color: "#9E8E78" }} />
                  <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9E8E78" }}>{rider?.vehicleType || "Rider"}</span>
                  <Star className="h-3 w-3" style={{ color: "#F5A623" }} />
                  <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", color: "#F5A623" }}>{rider?.rating?.toFixed(1) || "5.0"}</span>
                </div>
              </div>
            </div>
            <Link href="/login">
              <Zap className="h-5 w-5" style={{ color: "#4A4035" }} />
            </Link>
          </div>

          {/* Online toggle */}
          <div className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ background: "#1F1C18", border: "1px solid rgba(245,166,35,0.12)" }}>
            <div>
              <p style={{ color: "#F5ECD7", fontSize: "14px", fontWeight: 600 }}>
                {isOnline ? "🟢 You're Online" : "🔴 You're Offline"}
              </p>
              <p style={{ color: "#9E8E78", fontSize: "12px", marginTop: "2px" }}>
                {isOnline ? "Ready to accept deliveries" : "Toggle to start earning"}
              </p>
            </div>
            <button
              type="button"
              onClick={requestToggle}
              disabled={toggleMutation.isPending}
              className="flex h-12 w-12 items-center justify-center rounded-full transition-all"
              style={{
                background: isOnline ? "#4ade80" : "#1F1C18",
                border: `2px solid ${isOnline ? "#4ade80" : "rgba(245,166,35,0.3)"}`,
                boxShadow: isOnline ? "0 0 20px rgba(74,222,128,0.3)" : "none",
              }}
            >
              <Power className="h-5 w-5" style={{ color: isOnline ? "#0D0B08" : "#9E8E78" }} />
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: "Today",      value: `$${earnings?.today?.toFixed(2) || "0.00"}`, icon: DollarSign },
              { label: "Deliveries", value: profile?.totalDeliveries || 0,                 icon: CheckCircle },
              { label: "Rating",     value: rider?.rating?.toFixed(1) || "5.0",            icon: Star },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-xl p-3 text-center" style={{ background: "#0D0B08" }}>
                <Icon className="h-4 w-4 mx-auto mb-1" style={{ color: "#F5A623" }} />
                <p style={{ fontFamily: "var(--font-bebas)", fontSize: "1.3rem", color: "#F5ECD7", lineHeight: 1 }}>{value}</p>
                <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9E8E78", marginTop: "2px" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-5 py-5 space-y-4">
        {/* Active order */}
        {activeOrder && (
          <div className="rounded-2xl overflow-hidden" style={{ background: "#161410", border: "2px solid rgba(245,166,35,0.4)", boxShadow: "0 0 30px rgba(245,166,35,0.08)" }}>
            <div className="flex items-center gap-2 px-4 py-3" style={{ background: "rgba(245,166,35,0.08)", borderBottom: "1px solid rgba(245,166,35,0.15)" }}>
              <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: "#F5A623" }} />
              <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#F5A623" }}>
                {needsClaim ? "Pickup available" : "Active delivery"}
              </p>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic", fontSize: "1.1rem", color: "#F5ECD7" }}>{activeOrder.restaurant?.name}</p>
                  <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", letterSpacing: "0.1em", color: "#9E8E78" }}>#{activeOrder.id.slice(-6).toUpperCase()}</p>
                </div>
                <p style={{ fontFamily: "var(--font-bebas)", fontSize: "1.6rem", color: "#F5A623", lineHeight: 1 }}>${activeOrder.total?.toFixed(2)}</p>
              </div>

              {/* Step info */}
              <div className="rounded-xl p-3 mb-4 flex items-start gap-2.5" style={{ background: "#1F1C18" }}>
                {activeOrder.status === "picked_up" ? (
                  <>
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "#4ade80" }} />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#F5ECD7" }}>Deliver to customer</p>
                      <p className="text-xs" style={{ color: "#9E8E78" }}>{activeOrder.address?.fullAddress}</p>
                    </div>
                  </>
                ) : needsClaim ? (
                  <>
                    <Package className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "#F5A623" }} />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#F5ECD7" }}>Open pickup — tap Claim to assign yourself</p>
                      <p className="text-xs" style={{ color: "#9E8E78" }}>{activeOrder.restaurant?.address}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Package className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "#c084fc" }} />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#F5ECD7" }}>Food ready — pick up at restaurant</p>
                      <p className="text-xs" style={{ color: "#9E8E78" }}>{activeOrder.restaurant?.address}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Action button */}
              {activeOrder.status === "ready" && needsClaim && (
                <button
                  type="button"
                  onClick={() => claimMutation.mutate(activeOrder.id)}
                  disabled={claimMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-bold transition-all"
                  style={{ background: "rgba(245,166,35,0.18)", border: "1px solid rgba(245,166,35,0.5)", color: "#F5A623" }}
                >
                  <Package className="h-4 w-4" />
                  <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Claim delivery</span>
                </button>
              )}
              {activeOrder.status === "ready" && !needsClaim && (
                <button
                  type="button"
                  onClick={() => statusMutation.mutate({ id: activeOrder.id, status: "picked_up" })}
                  disabled={statusMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-bold transition-all"
                  style={{ background: "rgba(192,132,252,0.15)", border: "1px solid rgba(192,132,252,0.45)", color: "#c084fc" }}
                >
                  <Package className="h-4 w-4" />
                  <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Mark Picked Up</span>
                </button>
              )}
              {activeOrder.status === "picked_up" && (
                <button
                  onClick={() => statusMutation.mutate({ id: activeOrder.id, status: "delivered" })}
                  disabled={statusMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-bold transition-all"
                  style={{ background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.4)", color: "#4ade80" }}
                >
                  <CheckCircle className="h-4 w-4" />
                  <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Mark Delivered</span>
                </button>
              )}

              {/* Contact buttons */}
              <div className="flex gap-2 mt-2">
                {[
                  { icon: Phone, label: "Call Customer" },
                  { icon: Navigation, label: "Navigate" },
                ].map(({ icon: Icon, label }) => (
                  <button key={label} className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2" style={{ background: "#1F1C18", color: "#9E8E78", fontSize: "12px" }}>
                    <Icon className="h-3.5 w-3.5" />{label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Idle states */}
        {!activeOrder && isOnline && (
          <div className="flex flex-col items-center justify-center py-16 rounded-2xl" style={{ background: "#161410", border: "1px solid rgba(245,166,35,0.1)" }}>
            <Clock className="h-8 w-8 mb-3" style={{ color: "#4A4035" }} />
            <p style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic", fontSize: "1.1rem", color: "#9E8E78" }}>Waiting for orders…</p>
            <p style={{ fontSize: "12px", color: "#4A4035", marginTop: "4px" }}>You'll be notified instantly</p>
          </div>
        )}
        {!isOnline && (
          <button
            type="button"
            onClick={requestToggle}
            disabled={toggleMutation.isPending}
            className="flex w-full flex-col items-center justify-center py-16 rounded-2xl transition-opacity disabled:opacity-60"
            style={{ background: "#161410", border: "1px solid rgba(245,166,35,0.08)", cursor: toggleMutation.isPending ? "wait" : "pointer" }}
          >
            <Power className="h-8 w-8 mb-3" style={{ color: "#4A4035" }} />
            <p style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic", fontSize: "1.1rem", color: "#9E8E78" }}>
              You&apos;re offline
            </p>
            <p style={{ fontSize: "12px", color: "#4A4035", marginTop: "4px" }}>
              Tap here or use the switch above to go online
            </p>
          </button>
        )}

        {/* Quick links */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "#161410", border: "1px solid rgba(245,166,35,0.08)" }}>
          {[
            { href: "/earnings", icon: DollarSign, label: "Earnings",          sub: `$${earnings?.week?.toFixed(2) || "0.00"} this week` },
            { href: "/history",  icon: Clock,       label: "Delivery History",  sub: `${profile?.totalDeliveries || 0} total` },
            { href: "/profile",  icon: Star,        label: "Performance",       sub: `${rider?.rating?.toFixed(1) || "5.0"} ★ avg` },
          ].map(({ href, icon: Icon, label, sub }, i, arr) => (
            <Link key={href} href={href} className="flex items-center justify-between px-4 py-4 transition-colors" style={{ borderBottom: i < arr.length - 1 ? "1px solid rgba(245,166,35,0.08)" : "none" }}>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "rgba(245,166,35,0.1)" }}>
                  <Icon className="h-4 w-4" style={{ color: "#F5A623" }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#F5ECD7" }}>{label}</p>
                  <p style={{ fontSize: "11px", color: "#9E8E78" }}>{sub}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4" style={{ color: "#4A4035" }} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
