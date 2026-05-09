"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { useState } from "react";
import { CheckCircle, XCircle, Star, Search, Clock, ChefHat, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const night = "#0D0B08", surface = "#161410", elevated = "#1F1C18";
const gold = "#F5A623", cream = "#F5ECD7", muted = "#9E8E78", flame = "#E8372A";
const border = "rgba(245,166,35,0.15)";

export default function AdminRestaurantsPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | "approved" | "pending">("all");
  const [search, setSearch] = useState("");

  const params = filter !== "all" ? { approved: filter === "approved" } : {};

  const { data, isLoading } = useQuery({
    queryKey: ["admin-restaurants", filter],
    queryFn: () => adminApi.restaurants(params).then((r) => r.data.data),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, isApproved }: { id: string; isApproved: boolean }) =>
      adminApi.approveRestaurant(id, isApproved),
    onSuccess: (_, { isApproved }) => {
      qc.invalidateQueries({ queryKey: ["admin-restaurants"] });
      toast.success(isApproved ? "✓ Restaurant approved!" : "Restaurant suspended");
    },
  });

  const restaurants = ((data as any)?.data || []).filter((r: any) =>
    search ? r.name.toLowerCase().includes(search.toLowerCase()) : true
  );

  const pending = restaurants.filter((r: any) => !r.isApproved);
  const approved = restaurants.filter((r: any) => r.isApproved);
  const displayed = filter === "all" ? restaurants : filter === "pending" ? pending : approved;

  return (
    <div style={{ fontFamily: "var(--font-lora)" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: gold }}>— Management</span>
        <h1 style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic", fontSize: "2rem", color: cream, margin: "0.25rem 0 0.5rem" }}>Restaurants</h1>
        <p style={{ color: muted, fontSize: "0.875rem" }}>Approve new applications and manage existing restaurants</p>
      </div>

      {/* Pending Alert */}
      {pending.length > 0 && filter === "all" && (
        <div style={{ background: "rgba(245,166,35,0.1)", border: `1px solid ${gold}40`, borderRadius: "0.875rem", padding: "0.875rem 1.25rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <AlertCircle size={18} color={gold} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "0.1em", color: cream }}>
            {pending.length} restaurant application{pending.length > 1 ? "s" : ""} awaiting approval
          </span>
          <button onClick={() => setFilter("pending")} style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: gold, background: "none", border: "none", cursor: "pointer" }}>
            Review →
          </button>
        </div>
      )}

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {/* Filters */}
        <div style={{ display: "flex", gap: "0.375rem" }}>
          {(["all", "pending", "approved"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "0.375rem 0.875rem", borderRadius: "3rem",
              background: filter === f ? gold : elevated,
              color: filter === f ? night : muted,
              border: `1px solid ${filter === f ? gold : border}`,
              fontFamily: "var(--font-mono)", fontSize: "0.6rem",
              letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer",
              fontWeight: filter === f ? 700 : 400,
            }}>
              {f} {f === "pending" && pending.length > 0 ? `(${pending.length})` : f === "approved" ? `(${approved.length})` : `(${restaurants.length})`}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
          <Search size={14} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: muted }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search restaurants..."
            style={{ width: "100%", background: elevated, border: `1px solid ${border}`, borderRadius: "3rem", padding: "0.5rem 1rem 0.5rem 2.5rem", color: cream, fontFamily: "var(--font-lora)", fontSize: "0.8rem", outline: "none", boxSizing: "border-box" }}
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ height: 64, borderRadius: "0.75rem", background: surface, animation: "pulse 1.5s infinite" }} />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <ChefHat size={40} color={muted} style={{ margin: "0 auto 1rem" }} />
          <p style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic", color: cream, fontSize: "1.25rem" }}>No restaurants found</p>
          <p style={{ color: muted, fontSize: "0.875rem", marginTop: "0.5rem" }}>
            {filter === "pending" ? "No applications pending review." : "Try adjusting your filters."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {displayed.map((r: any) => (
            <div key={r.id} style={{ background: surface, border: `1px solid ${r.isApproved ? border : "rgba(245,166,35,0.35)"}`, borderRadius: "0.875rem", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem", transition: "border-color 0.2s" }}>
              {/* Status indicator */}
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: r.isApproved ? "#4ade80" : gold, flexShrink: 0, boxShadow: `0 0 8px ${r.isApproved ? "#4ade80" : gold}` }} />

              {/* Name & owner */}
              <div style={{ flex: 2 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic", color: cream, fontSize: "0.95rem" }}>{r.name}</span>
                  {!r.isApproved && (
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase", background: "rgba(245,166,35,0.15)", color: gold, padding: "0.15rem 0.5rem", borderRadius: "3rem" }}>New Application</span>
                  )}
                </div>
                <p style={{ color: muted, fontSize: "0.75rem", margin: "0.125rem 0 0" }}>{r.owner?.name || "—"} · {r.cuisineTypes?.slice(0, 2).join(", ")}</p>
              </div>

              {/* Address */}
              <div style={{ flex: 2, display: "none" }} className="sm-show">
                <p style={{ color: muted, fontSize: "0.8rem", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.address}</p>
              </div>

              {/* Rating */}
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <Star size={14} fill={gold} color={gold} />
                <span style={{ fontFamily: "var(--font-bebas)", fontSize: "1.1rem", color: gold }}>{r.rating?.toFixed(1) || "—"}</span>
              </div>

              {/* Status badge */}
              <div style={{ flex: 1 }}>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.1em",
                  textTransform: "uppercase", padding: "0.25rem 0.625rem", borderRadius: "3rem",
                  background: r.isApproved ? "rgba(74,222,128,0.12)" : "rgba(245,166,35,0.12)",
                  color: r.isApproved ? "#4ade80" : gold,
                  display: "flex", alignItems: "center", gap: "0.375rem", width: "fit-content",
                }}>
                  {r.isApproved ? <CheckCircle size={10} /> : <Clock size={10} />}
                  {r.isApproved ? "Live" : "Pending"}
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                {!r.isApproved ? (
                  <>
                    <button
                      onClick={() => approveMutation.mutate({ id: r.id, isApproved: true })}
                      disabled={approveMutation.isPending}
                      style={{
                        display: "flex", alignItems: "center", gap: "0.375rem",
                        padding: "0.5rem 0.875rem", borderRadius: "3rem",
                        background: gold, color: night, border: "none",
                        fontFamily: "var(--font-mono)", fontSize: "0.6rem",
                        letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      <CheckCircle size={12} /> Approve
                    </button>
                    <button
                      onClick={() => approveMutation.mutate({ id: r.id, isApproved: false })}
                      disabled={approveMutation.isPending}
                      style={{
                        display: "flex", alignItems: "center", gap: "0.375rem",
                        padding: "0.5rem 0.875rem", borderRadius: "3rem",
                        background: elevated, color: flame, border: `1px solid ${flame}40`,
                        fontFamily: "var(--font-mono)", fontSize: "0.6rem",
                        letterSpacing: "0.1em", textTransform: "uppercase",
                        cursor: "pointer",
                      }}
                    >
                      <XCircle size={12} /> Reject
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => approveMutation.mutate({ id: r.id, isApproved: false })}
                    disabled={approveMutation.isPending}
                    style={{
                      display: "flex", alignItems: "center", gap: "0.375rem",
                      padding: "0.5rem 0.875rem", borderRadius: "3rem",
                      background: elevated, color: muted, border: `1px solid ${border}`,
                      fontFamily: "var(--font-mono)", fontSize: "0.6rem",
                      letterSpacing: "0.1em", textTransform: "uppercase",
                      cursor: "pointer",
                    }}
                  >
                    <XCircle size={12} /> Suspend
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
