"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { applicationApi } from "@/lib/api";
import { ChefHat, Bike, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";

const night = "#0D0B08", surface = "#161410", elevated = "#1F1C18";
const gold = "#F5A623", cream = "#F5ECD7", muted = "#9E8E78", flame = "#E8372A";
const border = "rgba(245,166,35,0.15)";

const STATUS_STYLE: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:           { label: "Under Review",      color: gold,     icon: <Clock size={14} /> },
  approved:          { label: "Approved",           color: "#4ade80", icon: <CheckCircle size={14} /> },
  rejected:          { label: "Rejected",           color: flame,    icon: <XCircle size={14} /> },
  more_info_required:{ label: "More Info Needed",   color: "#fb923c", icon: <AlertCircle size={14} /> },
};

function AppCard({ title, icon, app }: { title: string; icon: React.ReactNode; app: any }) {
  const s = STATUS_STYLE[app.status] ?? STATUS_STYLE.pending;
  return (
    <div style={{ background: surface, borderRadius: "1.25rem", border: `1px solid ${border}`, padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: 40, height: 40, background: elevated, borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {icon}
          </div>
          <div>
            <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", color: cream, fontSize: "1.1rem", margin: 0 }}>{title}</p>
            <p style={{ color: muted, fontSize: "0.75rem", margin: "0.1rem 0 0", fontFamily: "monospace" }}>
              {new Date(app.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: `${s.color}18`, border: `1px solid ${s.color}40`, borderRadius: "3rem", padding: "0.3rem 0.75rem", color: s.color, fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", flexShrink: 0 }}>
          {s.icon} {s.label}
        </div>
      </div>

      {/* Timeline */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {[
          { label: "Application submitted", done: true, date: app.createdAt },
          { label: "Under review by team", done: app.status !== "pending" },
          { label: "Decision made", done: ["approved", "rejected"].includes(app.status), date: app.reviewedAt },
        ].map((t, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.done ? gold : elevated, border: `2px solid ${t.done ? gold : border}`, flexShrink: 0 }} />
            <span style={{ fontFamily: "'Lora', serif", fontSize: "0.8rem", color: t.done ? cream : muted }}>{t.label}</span>
            {t.done && t.date && (
              <span style={{ marginLeft: "auto", fontFamily: "monospace", fontSize: "0.6rem", color: muted }}>
                {new Date(t.date).toLocaleDateString()}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Admin note */}
      {app.adminNote && (
        <div style={{ background: elevated, borderRadius: "0.75rem", padding: "0.875rem", borderLeft: `3px solid ${app.status === "rejected" ? flame : "#fb923c"}` }}>
          <p style={{ fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: muted, margin: "0 0 0.375rem" }}>Admin Note</p>
          <p style={{ color: cream, fontSize: "0.875rem", fontFamily: "'Lora', serif", margin: 0, lineHeight: 1.6 }}>{app.adminNote}</p>
        </div>
      )}
    </div>
  );
}

export default function ApplicationStatusPage() {
  const { isAuthenticated } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ["my-applications"],
    queryFn: () => applicationApi.myApplications().then((r) => r.data.data),
    enabled: isAuthenticated,
    refetchInterval: 30_000,
  });

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: "100vh", background: night, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "2rem", color: cream, margin: "0 0 1rem" }}>Sign in to view your applications</p>
          <Link href="/auth/login" style={{ background: gold, color: night, borderRadius: "3rem", padding: "0.875rem 2rem", fontFamily: "monospace", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, textDecoration: "none" }}>Sign In →</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: night, minHeight: "100vh", paddingTop: "6rem", paddingBottom: "4rem", fontFamily: "'Lora', serif" }}>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 1.5rem" }}>
        <div style={{ marginBottom: "2.5rem" }}>
          <span style={{ fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: gold }}>— My Applications</span>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "2.5rem", color: cream, margin: "0.5rem 0 0.5rem" }}>Application Status</h1>
          <p style={{ color: muted }}>Track the status of your partner applications. Refreshes every 30 seconds.</p>
        </div>

        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
            <Loader2 size={36} color={gold} style={{ animation: "spin 1s linear infinite" }} />
          </div>
        ) : !data?.restaurant && !data?.rider ? (
          <div style={{ background: surface, borderRadius: "1.5rem", padding: "3rem 2rem", border: `1px solid ${border}`, textAlign: "center" }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", color: cream, fontSize: "1.5rem", margin: "0 0 0.75rem" }}>No applications yet</p>
            <p style={{ color: muted, marginBottom: "2rem" }}>Apply to become a restaurant partner or join our rider fleet.</p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/apply/restaurant" style={{ background: gold, color: night, borderRadius: "3rem", padding: "0.75rem 1.75rem", fontFamily: "monospace", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ChefHat size={14} /> Partner Restaurant
              </Link>
              <Link href="/apply/rider" style={{ border: `1px solid ${border}`, color: cream, borderRadius: "3rem", padding: "0.75rem 1.75rem", fontFamily: "monospace", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Bike size={14} /> Become a Rider
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {data?.restaurant && (
              <AppCard
                title={data.restaurant.restaurantName}
                icon={<ChefHat size={20} color={gold} />}
                app={data.restaurant}
              />
            )}
            {data?.rider && (
              <AppCard
                title="Rider Application"
                icon={<Bike size={20} color={gold} />}
                app={data.rider}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
