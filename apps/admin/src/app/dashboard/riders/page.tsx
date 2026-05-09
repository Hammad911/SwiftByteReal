"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { useState } from "react";
import { CheckCircle, XCircle, Star, Search, Loader2, Bike } from "lucide-react";
import toast from "react-hot-toast";

const gold = "#F5A623", night = "#0D0B08", surface = "#161410";
const elevated = "#1F1C18", cream = "#F5ECD7", muted = "#9E8E78";
const border = "rgba(245,166,35,0.15)", flame = "#E8372A";

const inp = { background: elevated, border: `1px solid ${border}`, borderRadius: "0.75rem", padding: "0.625rem 0.75rem 0.625rem 2.5rem", color: cream, fontFamily: "'Lora',serif", fontSize: "0.875rem", outline: "none", width: "100%", boxSizing: "border-box" as const };

export default function AdminRidersPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | "approved" | "pending">("all");
  const [search, setSearch] = useState("");

  const params = filter !== "all" ? { approved: filter === "approved" } : {};
  const { data, isLoading } = useQuery({
    queryKey: ["admin-riders", filter],
    queryFn: () => adminApi.riders(params).then((r) => r.data.data),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, isApproved }: { id: string; isApproved: boolean }) => adminApi.approveRider(id, isApproved),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-riders"] }); toast.success("Rider status updated"); },
  });

  const riders = (data?.data || []).filter((r: any) =>
    search ? r.user?.name?.toLowerCase().includes(search.toLowerCase()) || r.user?.email?.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div style={{ fontFamily: "'Lora', serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <span style={{ fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: gold }}>— Riders</span>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "2rem", color: cream, margin: "0.25rem 0 0" }}>All Riders</h1>
        </div>
        {/* Filters */}
        <div style={{ display: "flex", gap: "0.375rem", background: elevated, borderRadius: "3rem", padding: "0.25rem" }}>
          {(["all", "approved", "pending"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              borderRadius: "3rem", padding: "0.375rem 1rem", background: filter === f ? gold : "transparent",
              color: filter === f ? night : muted, border: "none", fontFamily: "monospace", fontSize: "0.6rem",
              letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", fontWeight: filter === f ? 700 : 400,
            }}>{f}</button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "1.25rem", maxWidth: 380 }}>
        <Search size={14} color={muted} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…" style={inp} />
      </div>

      {/* Table */}
      <div style={{ background: surface, borderRadius: "1.25rem", border: `1px solid ${border}`, overflow: "hidden" }}>
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
            <Loader2 size={28} color={gold} style={{ animation: "spin 1s linear infinite" }} />
          </div>
        ) : riders.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <Bike size={36} color={muted} style={{ margin: "0 auto 0.75rem" }} />
            <p style={{ color: muted, fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>No riders found</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${border}` }}>
                  {["Name", "Email", "Vehicle", "Rating", "Status", "Online", "Actions"].map(h => (
                    <th key={h} style={{ padding: "0.875rem 1rem", textAlign: "left", fontFamily: "monospace", fontSize: "0.55rem", letterSpacing: "0.15em", textTransform: "uppercase", color: muted, fontWeight: 400, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {riders.map((rider: any, i: number) => (
                  <tr key={rider.id} style={{ borderBottom: i < riders.length - 1 ? `1px solid rgba(245,166,35,0.06)` : "none" }}>
                    <td style={{ padding: "1rem", color: cream, fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>{rider.user?.name}</td>
                    <td style={{ padding: "1rem", color: muted, fontFamily: "monospace", fontSize: "0.75rem" }}>{rider.user?.email}</td>
                    <td style={{ padding: "1rem", color: muted, fontSize: "0.8rem", textTransform: "capitalize" }}>{rider.vehicleType}</td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontFamily: "monospace", fontSize: "0.8rem", color: gold }}>
                        <Star size={11} style={{ fill: gold, color: gold }} />
                        {rider.rating?.toFixed(1) ?? "—"}
                      </span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{ fontFamily: "monospace", fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: "3rem", padding: "0.2rem 0.625rem",
                        background: rider.isApproved ? "rgba(74,222,128,0.12)" : "rgba(245,166,35,0.12)",
                        color: rider.isApproved ? "#4ade80" : gold,
                        border: `1px solid ${rider.isApproved ? "rgba(74,222,128,0.3)" : "rgba(245,166,35,0.3)"}`,
                      }}>{rider.isApproved ? "Approved" : "Pending"}</span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{ fontFamily: "monospace", fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: "3rem", padding: "0.2rem 0.625rem",
                        background: rider.isOnline ? "rgba(74,222,128,0.1)" : "rgba(74,64,53,0.4)",
                        color: rider.isOnline ? "#4ade80" : "#4A4035",
                      }}>{rider.isOnline ? "Online" : "Offline"}</span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      {approveMutation.isPending ? <Loader2 size={14} color={muted} style={{ animation: "spin 1s linear infinite" }} /> : !rider.isApproved ? (
                        <button onClick={() => approveMutation.mutate({ id: rider.id, isApproved: true })}
                          style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", background: "rgba(74,222,128,0.12)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.3)", borderRadius: "3rem", padding: "0.3rem 0.75rem", fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>
                          <CheckCircle size={11} /> Approve
                        </button>
                      ) : (
                        <button onClick={() => approveMutation.mutate({ id: rider.id, isApproved: false })}
                          style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", background: `${flame}12`, color: flame, border: `1px solid ${flame}30`, borderRadius: "3rem", padding: "0.3rem 0.75rem", fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>
                          <XCircle size={11} /> Suspend
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
