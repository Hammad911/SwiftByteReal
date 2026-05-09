"use client";

import { useState } from "react";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { Zap, Mail, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const night = "#0D0B08", surface = "#161410", elevated = "#1F1C18";
  const gold = "#F5A623", cream = "#F5ECD7", muted = "#9E8E78";
  const border = "rgba(245,166,35,0.15)";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: night, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.75rem", textDecoration: "none", marginBottom: "1.5rem" }}>
            <div style={{ background: gold, borderRadius: "0.75rem", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={20} color={night} />
            </div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1.5rem", color: cream }}>SwiftByte</span>
          </Link>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "2.5rem", color: cream, margin: "0 0 0.5rem" }}>Forgot password?</h1>
          <p style={{ color: muted, fontFamily: "'Lora', serif" }}>Enter your email and we'll send a reset link.</p>
        </div>

        <div style={{ background: surface, borderRadius: "1.5rem", padding: "2rem", border: `1px solid ${border}` }}>
          {!sent ? (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label style={{ display: "block", fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: muted, marginBottom: "0.5rem" }}>Email Address</label>
                <div style={{ position: "relative" }}>
                  <Mail size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: muted }} />
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" required
                    style={{ width: "100%", background: elevated, border: `1px solid ${border}`, borderRadius: "0.75rem", padding: "0.75rem 0.875rem 0.75rem 2.5rem", color: cream, fontFamily: "'Lora', serif", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} style={{ background: gold, color: night, border: "none", borderRadius: "3rem", padding: "0.875rem", fontFamily: "monospace", fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}>
                {loading ? "Sending…" : "Send Reset Link →"}
              </button>
            </form>
          ) : (
            <div style={{ textAlign: "center", padding: "1rem 0" }}>
              <div style={{ width: 56, height: 56, background: "rgba(245,166,35,0.12)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                <Mail size={24} color={gold} />
              </div>
              <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", color: cream, fontSize: "1.25rem", margin: "0 0 0.5rem" }}>Check your inbox</p>
              <p style={{ color: muted, fontFamily: "'Lora', serif", fontSize: "0.875rem" }}>
                If <strong style={{ color: cream }}>{email}</strong> is registered, you'll receive a reset link shortly.
              </p>
            </div>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <Link href="/auth/login" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: muted, textDecoration: "none", fontFamily: "monospace", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            <ArrowLeft size={12} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
