"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { applicationApi } from "@/lib/api";
import { Zap, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const night = "#0D0B08", surface = "#161410", elevated = "#1F1C18";
const gold = "#F5A623", cream = "#F5ECD7", muted = "#9E8E78";
const border = "rgba(245,166,35,0.15)";
const inputStyle: React.CSSProperties = { width: "100%", background: elevated, border: `1px solid ${border}`, borderRadius: "0.75rem", padding: "0.875rem", color: cream, fontFamily: "'Lora', serif", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" };
const labelStyle: React.CSSProperties = { display: "block", fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase" as const, color: muted, marginBottom: "0.5rem" };

export default function ApplyRiderPage() {
  const { isAuthenticated } = useAuthStore();
  const [done, setDone]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [cnic, setCnic]         = useState("");
  const [phone, setPhone]       = useState("");
  const [vehicle, setVehicle]   = useState<"bike" | "bicycle" | "car">("bike");
  const [vehicleNo, setVehicleNo] = useState("");
  const [licenseNo, setLicenseNo] = useState("");
  const [city, setCity]           = useState("");

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: "100vh", background: night, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "2rem", color: cream, margin: "0 0 1rem" }}>Sign in first</p>
          <Link href="/auth/login" style={{ background: gold, color: night, borderRadius: "3rem", padding: "0.875rem 2rem", fontFamily: "monospace", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, textDecoration: "none" }}>Sign In →</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await applicationApi.submitRider({ fullName, cnic, phone, vehicleType: vehicle, vehicleNo, licenseNo, city });
      setDone(true);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: night, minHeight: "100vh", paddingTop: "5rem", paddingBottom: "4rem", fontFamily: "'Lora', serif" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.75rem", textDecoration: "none", marginBottom: "1.5rem" }}>
            <div style={{ background: gold, borderRadius: "0.75rem", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={18} color={night} />
            </div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1.25rem", color: cream }}>SwiftByte</span>
          </Link>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "2.5rem", color: cream, margin: "0 0 0.5rem" }}>Ride with SwiftByte</h1>
          <p style={{ color: muted }}>Earn on your own schedule. Apply now.</p>
        </div>

        {!done ? (
          <form onSubmit={handleSubmit} style={{ background: surface, borderRadius: "1.5rem", padding: "2rem", border: `1px solid ${border}`, display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Full Name (as per CNIC) *</label>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>CNIC *</label>
                <input value={cnic} onChange={(e) => setCnic(e.target.value)} placeholder="XXXXX-XXXXXXX-X" required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Phone *</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92 300 0000000" required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>City *</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Vehicle Type *</label>
                <select value={vehicle} onChange={(e) => setVehicle(e.target.value as any)} style={{ ...inputStyle, appearance: "none" }}>
                  <option value="bike">Motorcycle / Bike</option>
                  <option value="bicycle">Bicycle</option>
                  <option value="car">Car</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Vehicle Number *</label>
                <input value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value)} placeholder="ABC-123" required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>License Number *</label>
                <input value={licenseNo} onChange={(e) => setLicenseNo(e.target.value)} required style={inputStyle} />
              </div>
            </div>
            <button type="submit" disabled={loading} style={{ background: gold, color: night, border: "none", borderRadius: "3rem", padding: "0.875rem", fontFamily: "monospace", fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              {loading ? "Submitting…" : <><CheckCircle size={16} /> Submit Application</>}
            </button>
          </form>
        ) : (
          <div style={{ background: surface, borderRadius: "1.5rem", padding: "3rem 2rem", border: `1px solid ${border}`, textAlign: "center" }}>
            <CheckCircle size={48} color={gold} style={{ margin: "0 auto 1.5rem" }} />
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "2rem", color: cream, margin: "0 0 0.75rem" }}>Application submitted!</h2>
            <p style={{ color: muted, maxWidth: 360, margin: "0 auto 2rem", lineHeight: 1.8 }}>We'll review your documents within 24–48 hours and send you an email with the result.</p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/applications/status" style={{ background: gold, color: night, borderRadius: "3rem", padding: "0.875rem 2rem", fontFamily: "monospace", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, textDecoration: "none" }}>Track Status →</Link>
              <Link href="/" style={{ border: `1px solid ${border}`, color: cream, borderRadius: "3rem", padding: "0.875rem 2rem", fontFamily: "monospace", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none" }}>Back to Home</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
