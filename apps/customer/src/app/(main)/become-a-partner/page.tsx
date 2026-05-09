"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { authApi, restaurantApi } from "@/lib/api";
import {
  Zap, ChefHat, MapPin, Phone, Tag, DollarSign,
  CheckCircle, ArrowRight, Eye, EyeOff, Mail, Lock, User
} from "lucide-react";
import toast from "react-hot-toast";

const CUISINE_OPTIONS = [
  "burgers", "pizza", "biryani", "sushi", "bbq", "ramen",
  "desserts", "wraps", "chinese", "italian", "mexican", "local"
];

export default function BecomePartnerPage() {
  const router = useRouter();
  const { user, setUser, setTokens } = useAuthStore();
  const [step, setStep] = useState<"auth" | "restaurant" | "done">(user ? "restaurant" : "auth");

  // Auth fields
  const [authMode, setAuthMode]   = useState<"login" | "register">("register");
  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPwd, setShowPwd]     = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Restaurant fields
  const [rName, setRName]           = useState("");
  const [rDesc, setRDesc]           = useState("");
  const [rAddress, setRAddress]     = useState("");
  const [rPhone, setRPhone]         = useState("");
  const [rCuisines, setRCuisines]   = useState<string[]>([]);
  const [rDelivery, setRDelivery]   = useState("2.99");
  const [rMinOrder, setRMinOrder]   = useState("10");
  const [rLoading, setRLoading]     = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      let res;
      if (authMode === "register") {
        res = await authApi.register({ name, email, password });
      } else {
        res = await authApi.login(email, password);
      }
      const { user: u, accessToken, refreshToken } = res.data.data;
      setUser(u);
      setTokens(accessToken, refreshToken);
      toast.success(`Welcome, ${u.name.split(" ")[0]}!`);
      setStep("restaurant");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Authentication failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const toggleCuisine = (c: string) => {
    setRCuisines((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const handleRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rName || !rAddress) { toast.error("Name and address are required"); return; }
    if (rCuisines.length === 0) { toast.error("Select at least one cuisine type"); return; }
    setRLoading(true);
    try {
      await restaurantApi.register({
        name: rName,
        description: rDesc,
        phone: rPhone,
        address: rAddress,
        cuisineTypes: rCuisines,
        deliveryFee: parseFloat(rDelivery) || 2.99,
        minOrder: parseFloat(rMinOrder) || 10,
      });
      toast.success("Application submitted! Admin will review it shortly.");
      setStep("done");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to submit restaurant");
    } finally {
      setRLoading(false);
    }
  };

  const night = "#0D0B08";
  const surface = "#161410";
  const elevated = "#1F1C18";
  const gold = "#F5A623";
  const cream = "#F5ECD7";
  const muted = "#9E8E78";
  const border = "rgba(245,166,35,0.15)";

  return (
    <div style={{ background: night, minHeight: "100vh", fontFamily: "var(--font-lora)" }}>
      {/* Header */}
      <div style={{ borderBottom: `1px solid ${border}`, background: surface }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "1rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none" }}>
            <div style={{ background: gold, borderRadius: "0.75rem", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={20} color={night} />
            </div>
            <span style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic", fontSize: "1.5rem", color: cream }}>SwiftByte</span>
          </Link>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: muted }}>Partner Program</span>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "3rem 1.5rem" }}>
        {/* Progress */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "3rem" }}>
          {[
            { id: "auth", label: "01 — Create Account" },
            { id: "restaurant", label: "02 — Your Restaurant" },
            { id: "done", label: "03 — Under Review" },
          ].map((s, i) => {
            const active = s.id === step;
            const done = (step === "restaurant" && i === 0) || (step === "done" && i <= 1);
            return (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: i < 2 ? "1" : "auto" }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: done ? gold : active ? gold : elevated,
                  border: `2px solid ${active || done ? gold : border}`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  {done ? <CheckCircle size={16} color={night} /> : <span style={{ fontFamily: "var(--font-bebas)", fontSize: "0.9rem", color: active ? night : muted }}>{i + 1}</span>}
                </div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: active ? cream : muted }}>{s.label}</span>
                {i < 2 && <div style={{ flex: 1, height: 1, background: done ? gold : border }} />}
              </div>
            );
          })}
        </div>

        {/* STEP 1: Auth */}
        {step === "auth" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "start" }}>
            {/* Left info */}
            <div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: gold }}>— Partner Program</span>
              <h1 style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic", fontSize: "3rem", color: cream, lineHeight: 1.1, margin: "0.75rem 0 1rem" }}>
                Grow your restaurant with SwiftByte.
              </h1>
              <p style={{ color: muted, lineHeight: 1.8, marginBottom: "2rem" }}>
                Join 200+ restaurants already on our platform. Get access to thousands of hungry customers, real-time order management, and detailed analytics.
              </p>
              {[
                { icon: "🚀", title: "Zero setup cost", desc: "List your restaurant for free" },
                { icon: "📊", title: "Real-time analytics", desc: "Track orders, revenue and ratings" },
                { icon: "⚡", title: "Fast payouts", desc: "Weekly direct deposits" },
              ].map((b) => (
                <div key={b.title} style={{ display: "flex", gap: "1rem", alignItems: "flex-start", marginBottom: "1.25rem" }}>
                  <span style={{ fontSize: "1.5rem" }}>{b.icon}</span>
                  <div>
                    <p style={{ fontFamily: "var(--font-playfair)", color: cream, fontWeight: 700, margin: 0 }}>{b.title}</p>
                    <p style={{ color: muted, fontSize: "0.875rem", margin: 0 }}>{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right form */}
            <div style={{ background: surface, borderRadius: "1.5rem", padding: "2rem", border: `1px solid ${border}` }}>
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
                {(["register", "login"] as const).map((m) => (
                  <button key={m} onClick={() => setAuthMode(m)} style={{
                    flex: 1, padding: "0.625rem", borderRadius: "0.75rem",
                    background: authMode === m ? gold : elevated, color: authMode === m ? night : muted,
                    fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.15em",
                    textTransform: "uppercase", border: "none", cursor: "pointer", fontWeight: 700,
                  }}>
                    {m === "register" ? "New account" : "Sign in"}
                  </button>
                ))}
              </div>

              <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {authMode === "register" && (
                  <div>
                    <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: muted, marginBottom: "0.5rem" }}>Full Name</label>
                    <div style={{ position: "relative" }}>
                      <User size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: muted }} />
                      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" required
                        style={{ width: "100%", background: elevated, border: `1px solid ${border}`, borderRadius: "0.75rem", padding: "0.75rem 0.875rem 0.75rem 2.5rem", color: cream, fontFamily: "var(--font-lora)", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }} />
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: muted, marginBottom: "0.5rem" }}>Email</label>
                  <div style={{ position: "relative" }}>
                    <Mail size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: muted }} />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@restaurant.com" required
                      style={{ width: "100%", background: elevated, border: `1px solid ${border}`, borderRadius: "0.75rem", padding: "0.75rem 0.875rem 0.75rem 2.5rem", color: cream, fontFamily: "var(--font-lora)", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: muted, marginBottom: "0.5rem" }}>Password</label>
                  <div style={{ position: "relative" }}>
                    <Lock size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: muted }} />
                    <input type={showPwd ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                      style={{ width: "100%", background: elevated, border: `1px solid ${border}`, borderRadius: "0.75rem", padding: "0.75rem 2.5rem 0.75rem 2.5rem", color: cream, fontFamily: "var(--font-lora)", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }} />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: muted, cursor: "pointer" }}>
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={authLoading} style={{
                  background: gold, color: night, border: "none", borderRadius: "3rem",
                  padding: "0.875rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem",
                  letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700,
                  cursor: authLoading ? "not-allowed" : "pointer", opacity: authLoading ? 0.6 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                }}>
                  {authLoading ? <span style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #0D0B08", borderTop: "2px solid transparent", animation: "spin 0.8s linear infinite", display: "inline-block" }} /> : null}
                  {authMode === "register" ? "Create Account →" : "Sign In →"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* STEP 2: Restaurant Details */}
        {step === "restaurant" && (
          <div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: gold }}>— Restaurant Details</span>
            <h1 style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic", fontSize: "2.5rem", color: cream, margin: "0.75rem 0 0.5rem" }}>
              Tell us about your restaurant
            </h1>
            <p style={{ color: muted, marginBottom: "2rem" }}>
              Your application will be reviewed by our team within 24 hours.
            </p>

            <form onSubmit={handleRestaurant}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                {/* Restaurant Name */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: muted, marginBottom: "0.5rem" }}>Restaurant Name *</label>
                  <div style={{ position: "relative" }}>
                    <ChefHat size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: muted }} />
                    <input value={rName} onChange={(e) => setRName(e.target.value)} placeholder="e.g. Mama Put Kitchen" required
                      style={{ width: "100%", background: surface, border: `1px solid ${border}`, borderRadius: "0.75rem", padding: "0.875rem 0.875rem 0.875rem 2.75rem", color: cream, fontFamily: "var(--font-lora)", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }} />
                  </div>
                </div>

                {/* Description */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: muted, marginBottom: "0.5rem" }}>Description</label>
                  <textarea value={rDesc} onChange={(e) => setRDesc(e.target.value)} placeholder="What makes your restaurant special..." rows={3}
                    style={{ width: "100%", background: surface, border: `1px solid ${border}`, borderRadius: "0.75rem", padding: "0.875rem", color: cream, fontFamily: "var(--font-lora)", fontSize: "0.875rem", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
                </div>

                {/* Address */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: muted, marginBottom: "0.5rem" }}>Address *</label>
                  <div style={{ position: "relative" }}>
                    <MapPin size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: muted }} />
                    <input value={rAddress} onChange={(e) => setRAddress(e.target.value)} placeholder="123 Food Street, Islamabad" required
                      style={{ width: "100%", background: surface, border: `1px solid ${border}`, borderRadius: "0.75rem", padding: "0.875rem 0.875rem 0.875rem 2.75rem", color: cream, fontFamily: "var(--font-lora)", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }} />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: muted, marginBottom: "0.5rem" }}>Phone</label>
                  <div style={{ position: "relative" }}>
                    <Phone size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: muted }} />
                    <input value={rPhone} onChange={(e) => setRPhone(e.target.value)} placeholder="+92 300 0000000"
                      style={{ width: "100%", background: surface, border: `1px solid ${border}`, borderRadius: "0.75rem", padding: "0.875rem 0.875rem 0.875rem 2.75rem", color: cream, fontFamily: "var(--font-lora)", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }} />
                  </div>
                </div>

                {/* Delivery Fee */}
                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: muted, marginBottom: "0.5rem" }}>Delivery Fee ($)</label>
                  <div style={{ position: "relative" }}>
                    <DollarSign size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: muted }} />
                    <input type="number" step="0.01" min="0" value={rDelivery} onChange={(e) => setRDelivery(e.target.value)}
                      style={{ width: "100%", background: surface, border: `1px solid ${border}`, borderRadius: "0.75rem", padding: "0.875rem 0.875rem 0.875rem 2.75rem", color: cream, fontFamily: "var(--font-lora)", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }} />
                  </div>
                </div>

                {/* Cuisine Types */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: muted, marginBottom: "0.75rem" }}>
                    <Tag size={12} style={{ display: "inline", marginRight: "0.4rem" }} />
                    Cuisine Types * (select all that apply)
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {CUISINE_OPTIONS.map((c) => {
                      const selected = rCuisines.includes(c);
                      return (
                        <button key={c} type="button" onClick={() => toggleCuisine(c)} style={{
                          padding: "0.4rem 0.875rem", borderRadius: "3rem",
                          background: selected ? gold : elevated,
                          color: selected ? night : muted,
                          border: `1px solid ${selected ? gold : border}`,
                          fontFamily: "var(--font-mono)", fontSize: "0.65rem",
                          letterSpacing: "0.1em", textTransform: "capitalize",
                          cursor: "pointer", transition: "all 0.2s",
                        }}>
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
                <button type="button" onClick={() => setStep("auth")} style={{
                  padding: "0.875rem 1.5rem", borderRadius: "3rem", background: "transparent",
                  border: `1px solid ${border}`, color: muted, fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer",
                }}>
                  ← Back
                </button>
                <button type="submit" disabled={rLoading} style={{
                  flex: 1, background: gold, color: night, border: "none", borderRadius: "3rem",
                  padding: "0.875rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem",
                  letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700,
                  cursor: rLoading ? "not-allowed" : "pointer", opacity: rLoading ? 0.6 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                }}>
                  {rLoading ? <span style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #0D0B08", borderTop: "2px solid transparent", animation: "spin 0.8s linear infinite", display: "inline-block" }} /> : <ArrowRight size={16} />}
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: Done */}
        {step === "done" && (
          <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
            <div style={{ width: 80, height: 80, background: "rgba(245,166,35,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
              <CheckCircle size={40} color={gold} />
            </div>
            <h1 style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic", fontSize: "2.5rem", color: cream, margin: "0 0 1rem" }}>
              Application Received!
            </h1>
            <p style={{ color: muted, maxWidth: 480, margin: "0 auto 2rem", lineHeight: 1.8 }}>
              Our team will review your restaurant application within 24 hours. You'll get an email once it's approved. Once approved, you can sign in to the restaurant portal to manage your menu and orders.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/" style={{
                background: gold, color: night, borderRadius: "3rem",
                padding: "0.875rem 2rem", fontFamily: "var(--font-mono)",
                fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase",
                fontWeight: 700, textDecoration: "none",
              }}>
                Back to Home
              </Link>
              <a href="http://localhost:3001/login" style={{
                border: `1px solid ${border}`, color: cream, borderRadius: "3rem",
                padding: "0.875rem 2rem", fontFamily: "var(--font-mono)",
                fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase",
                textDecoration: "none",
              }}>
                Restaurant Portal →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
