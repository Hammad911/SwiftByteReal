"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { applicationsApi } from "@/lib/api";
import { CheckCircle, XCircle, MessageSquare, ChefHat, Bike, Clock, Loader2, Search } from "lucide-react";
import toast from "react-hot-toast";

const night = "#0D0B08", surface = "#161410", elevated = "#1F1C18";
const gold = "#F5A623", cream = "#F5ECD7", muted = "#9E8E78", flame = "#E8372A";
const border = "rgba(245,166,35,0.15)";

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  pending:            { label: "Pending",        color: gold },
  approved:           { label: "Approved",       color: "#4ade80" },
  rejected:           { label: "Rejected",       color: flame },
  more_info_required: { label: "More Info",      color: "#fb923c" },
};

type AppType = "restaurant" | "rider";

export default function ApplicationsPage() {
  const qc = useQueryClient();
  const [tab, setTab]         = useState<AppType>("restaurant");
  const [filter, setFilter]   = useState("all");
  const [search, setSearch]   = useState("");
  const [noteModal, setNoteModal] = useState<{ id: string; action: "reject" | "info" } | null>(null);
  const [noteText, setNoteText]   = useState("");

  const { data: rApps, isLoading: rLoading } = useQuery({
    queryKey: ["admin-applications-restaurant", filter],
    queryFn: () => applicationsApi.restaurant(filter !== "all" ? { status: filter } : {}).then((r) => r.data.data.data ?? []),
    enabled: tab === "restaurant",
  });

  const { data: dApps, isLoading: dLoading } = useQuery({
    queryKey: ["admin-applications-rider", filter],
    queryFn: () => applicationsApi.rider(filter !== "all" ? { status: filter } : {}).then((r) => r.data.data.data ?? []),
    enabled: tab === "rider",
  });

  const apps = (tab === "restaurant" ? rApps : dApps) ?? [];
  const loading = tab === "restaurant" ? rLoading : dLoading;

  const filtered = apps.filter((a: any) => {
    const q = search.toLowerCase();
    return !q || (a.restaurantName ?? a.fullName ?? "").toLowerCase().includes(q) || a.user?.name?.toLowerCase().includes(q);
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => tab === "restaurant" ? applicationsApi.approveRestaurant(id) : applicationsApi.approveRider(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-applications"] }); toast.success("Approved!"); },
    onError: (e: any) => toast.error(e.response?.data?.error || "Failed"),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      tab === "restaurant" ? applicationsApi.rejectRestaurant(id, note) : applicationsApi.rejectRider(id, note),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-applications"] }); toast.success("Rejected"); setNoteModal(null); setNoteText(""); },
  });

  const infoMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => applicationsApi.requestInfo(id, note),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-applications"] }); toast.success("Request sent"); setNoteModal(null); setNoteText(""); },
  });

  const handleNote = () => {
    if (!noteModal || !noteText.trim()) { toast.error("Note is required"); return; }
    if (noteModal.action === "reject") rejectMutation.mutate({ id: noteModal.id, note: noteText });
    else infoMutation.mutate({ id: noteModal.id, note: noteText });
  };

  return (
    <div style={{ fontFamily: "'Lora', serif" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <span style={{ fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: gold }}>— Applications</span>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "2rem", color: cream, margin: "0.25rem 0 0.5rem" }}>Partner Applications</h1>
        <p style={{ color: muted, fontSize: "0.875rem" }}>Review restaurant and rider applications</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {(["restaurant", "rider"] as const).map((t) => (
          <button key={t} onClick={() => { setTab(t); setFilter("all"); }} style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            padding: "0.625rem 1.25rem", borderRadius: "3rem",
            background: tab === t ? gold : elevated, color: tab === t ? night : muted,
            border: `1px solid ${tab === t ? gold : border}`, fontFamily: "monospace",
            fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase",
            cursor: "pointer", fontWeight: tab === t ? 700 : 400,
          }}>
            {t === "restaurant" ? <ChefHat size={13} /> : <Bike size={13} />}
            {t === "restaurant" ? "Restaurants" : "Riders"}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
        {["all", "pending", "approved", "rejected"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "0.375rem 0.875rem", borderRadius: "3rem",
            background: filter === f ? gold : elevated, color: filter === f ? night : muted,
            border: `1px solid ${filter === f ? gold : border}`, fontFamily: "monospace",
            fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "capitalize", cursor: "pointer",
          }}>
            {f}
          </button>
        ))}
        <div style={{ position: "relative", flex: 1, maxWidth: 280 }}>
          <Search size={14} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: muted }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name…"
            style={{ width: "100%", background: elevated, border: `1px solid ${border}`, borderRadius: "3rem", padding: "0.5rem 1rem 0.5rem 2.5rem", color: cream, fontFamily: "'Lora', serif", fontSize: "0.8rem", outline: "none", boxSizing: "border-box" }} />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
          <Loader2 size={32} color={gold} style={{ animation: "spin 1s linear infinite" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", color: muted, fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1.25rem" }}>
          No applications found.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {filtered.map((app: any) => {
            const s = STATUS_BADGE[app.status] ?? STATUS_BADGE.pending;
            const title = app.restaurantName || app.fullName;
            return (
              <div key={app.id} style={{ background: surface, border: `1px solid ${app.status === "pending" ? "rgba(245,166,35,0.35)" : border}`, borderRadius: "0.875rem", padding: "1.25rem 1.5rem" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                  <div style={{ flex: 2, minWidth: 200 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
                      <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", color: cream, fontSize: "1rem" }}>{title}</span>
                      <span style={{ fontFamily: "monospace", fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase", background: `${s.color}18`, border: `1px solid ${s.color}40`, borderRadius: "3rem", padding: "0.2rem 0.5rem", color: s.color, display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        {app.status === "pending" ? <Clock size={10} /> : app.status === "approved" ? <CheckCircle size={10} /> : <XCircle size={10} />}
                        {s.label}
                      </span>
                    </div>
                    <p style={{ color: muted, fontSize: "0.8rem", margin: 0 }}>
                      {app.user?.name} · {app.user?.email} · {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                    {app.city && <p style={{ color: muted, fontSize: "0.75rem", margin: "0.25rem 0 0", fontFamily: "monospace" }}>{app.city}{app.cuisineTypes ? ` · ${app.cuisineTypes.slice(0, 3).join(", ")}` : ""}</p>}
                    {app.adminNote && (
                      <div style={{ marginTop: "0.75rem", background: elevated, borderRadius: "0.5rem", padding: "0.625rem", borderLeft: `3px solid ${flame}` }}>
                        <p style={{ color: cream, fontSize: "0.8rem", margin: 0, fontFamily: "'Lora', serif" }}>{app.adminNote}</p>
                      </div>
                    )}
                  </div>

                  {app.status === "pending" && (
                    <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0, flexWrap: "wrap" }}>
                      <button onClick={() => approveMutation.mutate(app.id)} disabled={approveMutation.isPending} style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.5rem 0.875rem", borderRadius: "3rem", background: gold, color: night, border: "none", fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, cursor: "pointer" }}>
                        <CheckCircle size={12} /> Approve
                      </button>
                      {tab === "restaurant" && (
                        <button onClick={() => setNoteModal({ id: app.id, action: "info" })} style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.5rem 0.875rem", borderRadius: "3rem", background: elevated, color: "#fb923c", border: "1px solid #fb923c40", fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
                          <MessageSquare size={12} /> More Info
                        </button>
                      )}
                      <button onClick={() => setNoteModal({ id: app.id, action: "reject" })} style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.5rem 0.875rem", borderRadius: "3rem", background: elevated, color: flame, border: `1px solid ${flame}40`, fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
                        <XCircle size={12} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Note Modal */}
      {noteModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
          <div style={{ background: surface, borderRadius: "1.5rem", padding: "2rem", border: `1px solid ${border}`, width: "100%", maxWidth: 480 }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", color: cream, margin: "0 0 0.5rem" }}>
              {noteModal.action === "reject" ? "Reject Application" : "Request More Information"}
            </h3>
            <p style={{ color: muted, fontSize: "0.875rem", margin: "0 0 1.25rem" }}>
              {noteModal.action === "reject" ? "Provide a reason — this will be emailed to the applicant." : "Describe what additional info is needed."}
            </p>
            <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={4}
              placeholder={noteModal.action === "reject" ? "e.g. Documents are incomplete…" : "e.g. Please provide a clearer photo of your CNIC…"}
              style={{ width: "100%", background: elevated, border: `1px solid ${border}`, borderRadius: "0.75rem", padding: "0.875rem", color: cream, fontFamily: "'Lora', serif", fontSize: "0.875rem", outline: "none", resize: "vertical", boxSizing: "border-box", marginBottom: "1rem" }}
            />
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => { setNoteModal(null); setNoteText(""); }} style={{ flex: 1, padding: "0.75rem", borderRadius: "3rem", background: "transparent", border: `1px solid ${border}`, color: muted, fontFamily: "monospace", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={handleNote} style={{ flex: 1, padding: "0.75rem", borderRadius: "3rem", background: noteModal.action === "reject" ? flame : gold, color: night, border: "none", fontFamily: "monospace", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, cursor: "pointer" }}>
                {noteModal.action === "reject" ? "Reject" : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
