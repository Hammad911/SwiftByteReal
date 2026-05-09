"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { useState } from "react";
import { Plus, Trash2, Tag, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const gold = "#F5A623", night = "#0D0B08", surface = "#161410";
const elevated = "#1F1C18", cream = "#F5ECD7", muted = "#9E8E78";
const border = "rgba(245,166,35,0.15)", flame = "#E8372A";

const fieldStyle = { background: night, border: `1px solid ${border}`, borderRadius: "0.625rem", padding: "0.625rem 0.75rem", color: cream, fontFamily: "'Lora',serif", fontSize: "0.85rem", outline: "none", width: "100%", boxSizing: "border-box" as const };
const labelStyle = { display: "block" as const, fontFamily: "monospace", fontSize: "0.55rem", letterSpacing: "0.12em", textTransform: "uppercase" as const, color: muted, marginBottom: "0.35rem" };

export default function VouchersPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", type: "percentage", value: "", minOrder: "0", validFrom: "", validTo: "", usageLimit: "100" });
  const f = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const { data, isLoading } = useQuery({
    queryKey: ["vouchers"],
    queryFn: () => adminApi.vouchers().then((r) => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: () => adminApi.createVoucher({ ...form, value: parseFloat(form.value), minOrder: parseFloat(form.minOrder), usageLimit: parseInt(form.usageLimit) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["vouchers"] }); toast.success("Voucher created!"); setShowForm(false); setForm({ code: "", type: "percentage", value: "", minOrder: "0", validFrom: "", validTo: "", usageLimit: "100" }); },
    onError: () => toast.error("Failed to create voucher"),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => adminApi.deactivateVoucher(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["vouchers"] }); toast.success("Voucher deactivated"); },
  });

  const vouchers = data || [];

  return (
    <div style={{ fontFamily: "'Lora', serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <span style={{ fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: gold }}>— Promotions</span>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "2rem", color: cream, margin: "0.25rem 0 0" }}>Vouchers</h1>
        </div>
        <button onClick={() => setShowForm(true)} style={{ background: gold, color: night, border: "none", borderRadius: "3rem", padding: "0.75rem 1.5rem", fontFamily: "monospace", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Plus size={14} /> New Voucher
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div style={{ background: surface, border: `1px solid ${gold}40`, borderRadius: "1.25rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <p style={{ fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: gold }}>— Create Voucher</p>
            <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: muted }}><X size={16} /></button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.875rem" }}>
            <div>
              <label style={labelStyle}>Code</label>
              <input value={form.code} onChange={e => f("code", e.target.value.toUpperCase())} placeholder="SWIFT20" style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>Type</label>
              <select value={form.type} onChange={e => f("type", e.target.value)} style={{ ...fieldStyle, cursor: "pointer" }}>
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (Rs.)</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Value ({form.type === "percentage" ? "%" : "Rs."})</label>
              <input type="number" value={form.value} onChange={e => f("value", e.target.value)} placeholder={form.type === "percentage" ? "20" : "100"} style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>Min Order (Rs.)</label>
              <input type="number" value={form.minOrder} onChange={e => f("minOrder", e.target.value)} style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>Valid From</label>
              <input type="date" value={form.validFrom} onChange={e => f("validFrom", e.target.value)} style={{ ...fieldStyle, colorScheme: "dark" }} />
            </div>
            <div>
              <label style={labelStyle}>Valid To</label>
              <input type="date" value={form.validTo} onChange={e => f("validTo", e.target.value)} style={{ ...fieldStyle, colorScheme: "dark" }} />
            </div>
            <div>
              <label style={labelStyle}>Usage Limit</label>
              <input type="number" value={form.usageLimit} onChange={e => f("usageLimit", e.target.value)} style={fieldStyle} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.625rem", marginTop: "1.25rem" }}>
            <button onClick={() => createMutation.mutate()} disabled={!form.code || !form.value || createMutation.isPending}
              style={{ background: gold, color: night, border: "none", borderRadius: "3rem", padding: "0.625rem 1.5rem", fontFamily: "monospace", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, cursor: "pointer", opacity: (!form.code || !form.value) ? 0.5 : 1, display: "flex", alignItems: "center", gap: "0.375rem" }}>
              {createMutation.isPending ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Plus size={13} />} Create
            </button>
            <button onClick={() => setShowForm(false)} style={{ background: elevated, color: muted, border: `1px solid ${border}`, borderRadius: "3rem", padding: "0.625rem 1rem", fontFamily: "monospace", fontSize: "0.65rem", cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ background: surface, borderRadius: "1.25rem", border: `1px solid ${border}`, overflow: "hidden" }}>
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
            <Loader2 size={28} color={gold} style={{ animation: "spin 1s linear infinite" }} />
          </div>
        ) : vouchers.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <Tag size={36} color={muted} style={{ margin: "0 auto 0.75rem" }} />
            <p style={{ color: muted, fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>No vouchers yet</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${border}` }}>
                  {["Code", "Type", "Value", "Min Order", "Used / Limit", "Valid Until", "Status", ""].map(h => (
                    <th key={h} style={{ padding: "0.875rem 1rem", textAlign: "left", fontFamily: "monospace", fontSize: "0.55rem", letterSpacing: "0.15em", textTransform: "uppercase", color: muted, fontWeight: 400, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vouchers.map((v: any, i: number) => (
                  <tr key={v.id} style={{ borderBottom: i < vouchers.length - 1 ? `1px solid rgba(245,166,35,0.06)` : "none" }}>
                    <td style={{ padding: "1rem" }}>
                      <span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: gold, fontWeight: 700, letterSpacing: "0.08em" }}>{v.code}</span>
                    </td>
                    <td style={{ padding: "1rem", color: muted, fontSize: "0.8rem", textTransform: "capitalize" }}>{v.type}</td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{ fontFamily: "monospace", fontSize: "0.85rem", color: cream }}>{v.type === "percentage" ? `${v.value}%` : `Rs. ${v.value}`}</span>
                    </td>
                    <td style={{ padding: "1rem", color: muted, fontFamily: "monospace", fontSize: "0.75rem" }}>Rs. {v.minOrder}</td>
                    <td style={{ padding: "1rem", fontFamily: "monospace", fontSize: "0.75rem", color: muted }}>
                      <span style={{ color: cream }}>{v.usedCount}</span> / {v.usageLimit}
                    </td>
                    <td style={{ padding: "1rem", fontFamily: "monospace", fontSize: "0.7rem", color: muted, whiteSpace: "nowrap" }}>
                      {v.validTo ? new Date(v.validTo).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{ fontFamily: "monospace", fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: "3rem", padding: "0.2rem 0.625rem",
                        background: v.isActive ? "rgba(74,222,128,0.12)" : "rgba(74,64,53,0.4)",
                        color: v.isActive ? "#4ade80" : "#4A4035",
                      }}>{v.isActive ? "Active" : "Inactive"}</span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      {v.isActive && (
                        <button onClick={() => deactivateMutation.mutate(v.id)} title="Deactivate"
                          style={{ background: "none", border: "none", cursor: "pointer", color: muted, display: "flex", alignItems: "center" }}
                          onMouseEnter={e => (e.currentTarget.style.color = flame)}
                          onMouseLeave={e => (e.currentTarget.style.color = muted)}>
                          <Trash2 size={14} />
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
