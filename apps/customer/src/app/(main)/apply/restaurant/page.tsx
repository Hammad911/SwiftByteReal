"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { applicationApi } from "@/lib/api";
import { Zap, ChefHat, MapPin, Phone, Tag, DollarSign, User, CreditCard, Building2, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

const CUISINE_OPTIONS = ["burgers", "pizza", "biryani", "sushi", "bbq", "ramen", "desserts", "wraps", "chinese", "italian", "mexican", "local", "seafood", "healthy"];

const night = "#0D0B08", surface = "#161410", elevated = "#1F1C18";
const gold = "#F5A623", cream = "#F5ECD7", muted = "#9E8E78";
const border = "rgba(245,166,35,0.15)";

const inputStyle: React.CSSProperties = { width: "100%", background: elevated, border: `1px solid ${border}`, borderRadius: "0.75rem", padding: "0.875rem", color: cream, fontFamily: "'Lora', serif", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" };
const labelStyle: React.CSSProperties = { display: "block", fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase" as const, color: muted, marginBottom: "0.5rem" };

const STEPS = ["Restaurant Info", "Owner Details", "Submit"];

export default function ApplyRestaurantPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [name, setName]           = useState("");
  const [desc, setDesc]           = useState("");
  const [cuisines, setCuisines]   = useState<string[]>([]);
  const [address, setAddress]     = useState("");
  const [city, setCity]           = useState("");
  const [phone, setPhone]         = useState("");

  // Step 2
  const [ownerName, setOwnerName]     = useState("");
  const [cnic, setCnic]               = useState("");
  const [bankName, setBankName]       = useState("");
  const [bankAccName, setBankAccName] = useState("");
  const [bankAccNo, setBankAccNo]     = useState("");

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: "100vh", background: night, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "2rem", color: cream, margin: "0 0 1rem" }}>Sign in first</p>
          <Link href="/auth/login" style={{ background: gold, color: night, borderRadius: "3rem", padding: "0.875rem 2rem", fontFamily: "monospace", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, textDecoration: "none" }}>
            Sign In →
          </Link>
        </div>
      </div>
    );
  }

  const toggleCuisine = (c: string) =>
    setCuisines((p) => p.includes(c) ? p.filter((x) => x !== c) : [...p, c]);

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (cuisines.length === 0) { toast.error("Select at least one cuisine"); return; }
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await applicationApi.submitRestaurant({
        restaurantName: name, description: desc, cuisineTypes: cuisines,
        address, city, phone, ownerName, ownerCnic: cnic,
        bankName, bankAccountName: bankAccName, bankAccountNo: bankAccNo,
      });
      setStep(2);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: night, minHeight: "100vh", paddingTop: "5rem", paddingBottom: "4rem", fontFamily: "'Lora', serif" }}>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 1.5rem" }}>
        {/* Header */}
        <div style={{ marginBottom: "2.5rem", textAlign: "center" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.75rem", textDecoration: "none", marginBottom: "1.5rem" }}>
            <div style={{ background: gold, borderRadius: "0.75rem", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={18} color={night} />
            </div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1.25rem", color: cream }}>SwiftByte</span>
          </Link>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "2.5rem", color: cream, margin: "0 0 0.5rem" }}>
            Partner Application
          </h1>
          <p style={{ color: muted }}>Join 200+ restaurants on SwiftByte. No setup fee.</p>
        </div>

        {/* Progress */}
        {step < 2 && (
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}>
            {STEPS.slice(0, 2).map((s, i) => (
              <div key={s} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ height: 4, borderRadius: 2, background: i <= step ? gold : elevated, marginBottom: "0.5rem", transition: "background 0.3s" }} />
                <span style={{ fontFamily: "monospace", fontSize: "0.55rem", letterSpacing: "0.15em", textTransform: "uppercase", color: i <= step ? gold : muted }}>{s}</span>
              </div>
            ))}
          </div>
        )}

        {/* Step 0 — Restaurant Info */}
        {step === 0 && (
          <form onSubmit={handleStep1} style={{ background: surface, borderRadius: "1.5rem", padding: "2rem", border: `1px solid ${border}`, display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={labelStyle}>Restaurant Name *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mama Put Kitchen" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Description *</label>
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What makes your restaurant special…" required rows={3}
                style={{ ...inputStyle, resize: "vertical" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>City *</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Islamabad" required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Phone *</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92 300 0000000" required style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Address *</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, area, city" required style={inputStyle} />
            </div>
            <div>
              <label style={{ ...labelStyle, marginBottom: "0.75rem" }}>Cuisine Types * (select all that apply)</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {CUISINE_OPTIONS.map((c) => {
                  const sel = cuisines.includes(c);
                  return (
                    <button key={c} type="button" onClick={() => toggleCuisine(c)} style={{
                      padding: "0.375rem 0.875rem", borderRadius: "3rem",
                      background: sel ? gold : elevated, color: sel ? night : muted,
                      border: `1px solid ${sel ? gold : border}`, fontFamily: "monospace",
                      fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "capitalize", cursor: "pointer",
                    }}>
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>
            <button type="submit" style={{ background: gold, color: night, border: "none", borderRadius: "3rem", padding: "0.875rem", fontFamily: "monospace", fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              Continue <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* Step 1 — Owner Details */}
        {step === 1 && (
          <form onSubmit={handleSubmit} style={{ background: surface, borderRadius: "1.5rem", padding: "2rem", border: `1px solid ${border}`, display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={labelStyle}>Owner Full Name *</label>
              <input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="As per CNIC" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>CNIC Number *</label>
              <input value={cnic} onChange={(e) => setCnic(e.target.value)} placeholder="XXXXX-XXXXXXX-X" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Bank Name *</label>
              <input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. HBL, Meezan, Allied" required style={inputStyle} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>Account Title *</label>
                <input value={bankAccName} onChange={(e) => setBankAccName(e.target.value)} required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Account Number *</label>
                <input value={bankAccNo} onChange={(e) => setBankAccNo(e.target.value)} required style={inputStyle} />
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button type="button" onClick={() => setStep(0)} style={{ padding: "0.875rem 1.5rem", borderRadius: "3rem", background: "transparent", border: `1px solid ${border}`, color: muted, fontFamily: "monospace", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ArrowLeft size={14} /> Back
              </button>
              <button type="submit" disabled={loading} style={{ flex: 1, background: gold, color: night, border: "none", borderRadius: "3rem", padding: "0.875rem", fontFamily: "monospace", fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                {loading ? "Submitting…" : <><CheckCircle size={16} /> Submit Application</>}
              </button>
            </div>
          </form>
        )}

        {/* Step 2 — Success */}
        {step === 2 && (
          <div style={{ background: surface, borderRadius: "1.5rem", padding: "3rem 2rem", border: `1px solid ${border}`, textAlign: "center" }}>
            <div style={{ width: 72, height: 72, background: "rgba(245,166,35,0.12)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
              <CheckCircle size={36} color={gold} />
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "2rem", color: cream, margin: "0 0 0.75rem" }}>Application submitted!</h2>
            <p style={{ color: muted, maxWidth: 400, margin: "0 auto 2rem", lineHeight: 1.8 }}>
              Our team will review your application within 24–48 hours. You'll get an email the moment a decision is made.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/applications/status" style={{ background: gold, color: night, borderRadius: "3rem", padding: "0.875rem 2rem", fontFamily: "monospace", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, textDecoration: "none" }}>
                Track Status →
              </Link>
              <Link href="/" style={{ border: `1px solid ${border}`, color: cream, borderRadius: "3rem", padding: "0.875rem 2rem", fontFamily: "monospace", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none" }}>
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
