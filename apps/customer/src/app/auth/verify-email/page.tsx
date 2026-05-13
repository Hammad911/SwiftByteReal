"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api";
import { Zap, CheckCircle, XCircle, Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const params   = useSearchParams();
  const router   = useRouter();
  const { setUser, setTokens } = useAuthStore();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [msg, setMsg]       = useState("");

  useEffect(() => {
    const token = params.get("token");
    if (!token) { setStatus("error"); setMsg("No verification token found."); return; }

    authApi.verifyEmail(token)
      .then((res) => {
        const { user, accessToken, refreshToken } = res.data.data;
        setUser(user);
        setTokens(accessToken, refreshToken);
        setStatus("success");
        setTimeout(() => router.push("/"), 2000);
      })
      .catch((err) => {
        setStatus("error");
        setMsg(err.response?.data?.error || "Verification failed. The link may have expired.");
      });
  }, []);

  const night = "#0D0B08", gold = "#F5A623", cream = "#F5ECD7", muted = "#9E8E78";

  return (
    <div style={{ minHeight: "100vh", background: night, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div style={{ textAlign: "center", maxWidth: 420 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
          <div style={{ background: gold, borderRadius: "0.75rem", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={20} color={night} />
          </div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "1.5rem", color: cream }}>SwiftByte</span>
        </div>

        {status === "loading" && (
          <>
            <Loader2 size={48} color={gold} style={{ margin: "0 auto 1.5rem", animation: "spin 1s linear infinite" }} />
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "2rem", color: cream, margin: "0 0 0.75rem" }}>Verifying your email…</h1>
            <p style={{ color: muted, fontFamily: "'Lora', serif" }}>Just a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle size={48} color={gold} style={{ margin: "0 auto 1.5rem" }} />
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "2rem", color: cream, margin: "0 0 0.75rem" }}>Email verified!</h1>
            <p style={{ color: muted, fontFamily: "'Lora', serif", marginBottom: "1.5rem" }}>Welcome to SwiftByte. Redirecting you home…</p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle size={48} color="#E8372A" style={{ margin: "0 auto 1.5rem" }} />
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "2rem", color: cream, margin: "0 0 0.75rem" }}>Verification failed</h1>
            <p style={{ color: muted, fontFamily: "'Lora', serif", marginBottom: "2rem" }}>{msg}</p>
            <Link href="/auth/login" style={{ background: gold, color: night, borderRadius: "3rem", padding: "0.875rem 2rem", fontFamily: "monospace", fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, textDecoration: "none" }}>
              Back to Login →
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
