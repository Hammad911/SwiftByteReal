"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { Zap, Lock, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const params    = useSearchParams();
  const router    = useRouter();
  const token     = params.get("token") ?? "";
  const [pwd, setPwd]       = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow]     = useState(false);
  const [loading, setLoading] = useState(false);

  const night = "#0D0B08", surface = "#161410", elevated = "#1F1C18";
  const gold = "#F5A623", cream = "#F5ECD7", muted = "#9E8E78", flame = "#E8372A";
  const border = "rgba(245,166,35,0.15)";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (pwd !== confirm) { toast.error("Passwords don't match"); return; }
    if (!token) { toast.error("Invalid reset link"); return; }
    setLoading(true);
    try {
      await authApi.resetPassword(token, pwd);
      toast.success("Password reset! Please log in.");
      router.push("/auth/login");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Reset failed. The link may have expired.");
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
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "2.5rem", color: cream, margin: "0 0 0.5rem" }}>Set new password</h1>
          <p style={{ color: muted, fontFamily: "'Lora', serif" }}>Choose a strong password you haven't used before.</p>
        </div>

        <div style={{ background: surface, borderRadius: "1.5rem", padding: "2rem", border: `1px solid ${border}` }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {["New Password", "Confirm Password"].map((label, i) => {
              const val = i === 0 ? pwd : confirm;
              const setter = i === 0 ? setPwd : setConfirm;
              const mismatch = i === 1 && confirm && pwd !== confirm;
              return (
                <div key={label}>
                  <label style={{ display: "block", fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: muted, marginBottom: "0.5rem" }}>{label}</label>
                  <div style={{ position: "relative" }}>
                    <Lock size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: muted }} />
                    <input
                      type={show ? "text" : "password"} value={val}
                      onChange={(e) => setter(e.target.value)} required minLength={8}
                      style={{ width: "100%", background: elevated, border: `1px solid ${mismatch ? flame + "60" : border}`, borderRadius: "0.75rem", padding: "0.75rem 2.5rem 0.75rem 2.5rem", color: cream, fontFamily: "'Lora', serif", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }}
                    />
                    {i === 0 && (
                      <button type="button" onClick={() => setShow(!show)} style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: muted, cursor: "pointer" }}>
                        {show ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    )}
                  </div>
                  {mismatch && <p style={{ color: flame, fontSize: "0.75rem", marginTop: "0.25rem", fontFamily: "'Lora', serif" }}>Passwords don't match</p>}
                </div>
              );
            })}

            <button type="submit" disabled={loading} style={{ background: gold, color: night, border: "none", borderRadius: "3rem", padding: "0.875rem", fontFamily: "monospace", fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}>
              {loading ? "Resetting…" : "Reset Password →"}
            </button>
          </form>
        </div>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <Link href="/auth/login" style={{ color: muted, textDecoration: "none", fontFamily: "monospace", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
