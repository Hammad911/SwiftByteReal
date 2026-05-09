"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api";
import { Eye, EyeOff, Zap, Mail, Lock, User, Phone, CheckCircle, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

declare global {
  interface Window {
    google?: any;
    handleGoogleSignIn?: (r: any) => void;
  }
}

type AccountType = "customer" | "restaurant" | "rider";

const ACCOUNT_TYPES: { id: AccountType; emoji: string; title: string; desc: string; color: string }[] = [
  { id: "customer",   emoji: "🍔", title: "Customer",          desc: "Order food from the best restaurants",   color: "#F5A623" },
  { id: "restaurant", emoji: "🍽️", title: "Restaurant Owner",  desc: "List your restaurant and grow your business", color: "#4ad295" },
  { id: "rider",      emoji: "🛵", title: "Delivery Rider",    desc: "Earn money delivering food on your schedule", color: "#60a5fa" },
];

export default function RegisterPage() {
  const router = useRouter();
  const { setUser, setTokens } = useAuthStore();
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [form, setForm]           = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [showPassword, setShowPwd] = useState(false);
  const [loading, setLoading]      = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailSent, setEmailSent]  = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  // ── Google OAuth ──────────────────────────────────────────────────────────
  const handleGoogleSignIn = async (response: any) => {
    setGoogleLoading(true);
    try {
      const res = await authApi.googleAuth(response.credential);
      const { user, accessToken, refreshToken } = res.data.data;
      setUser(user);
      setTokens(accessToken, refreshToken);
      toast.success(`Welcome, ${user.name.split(" ")[0]}!`);
      router.push("/");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const initGoogle = () => {
      if (!window.google) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleSignIn,
      });
      if (googleBtnRef.current) {
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: "filled_black",
          size: "large",
          width: googleBtnRef.current.offsetWidth || 400,
          text: "signup_with",
          logo_alignment: "center",
        });
      }
    };

    // If script already loaded
    if (window.google) { initGoogle(); return; }

    // Check if script tag already exists
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener("load", initGoogle);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;
    document.head.appendChild(script);
  }, []);

  // ── Email/password register ───────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error("Please fill in required fields"); return; }
    if (form.password !== form.confirm) { toast.error("Passwords do not match"); return; }
    if (form.password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      const res = await authApi.register({ name: form.name, email: form.email, password: form.password, phone: form.phone });
      const data = res.data.data;

      if (data.requiresVerification) {
        // SMTP configured — user must verify email
        setEmailSent(true);
        return;
      }

      // No SMTP (dev) — auto-verified, tokens returned
      const { user, accessToken, refreshToken } = data;
      setUser(user);
      setTokens(accessToken, refreshToken);
      toast.success(`Welcome to SwiftByte, ${user.name.split(" ")[0]}!`);
      if (accountType === "restaurant") {
        router.push("/apply/restaurant");
      } else if (accountType === "rider") {
        router.push("/apply/rider");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full rounded-xl border border-gold/15 bg-elevated pl-11 pr-4 py-3 text-sm text-cream placeholder:text-ink-muted outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-colors font-lora";

  // ── Email sent confirmation screen ───────────────────────────────────────
  if (emailSent) {
    return (
      <div className="min-h-screen bg-night flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gold/10 border border-gold/20">
            <Mail className="h-10 w-10 text-gold" />
          </div>
          <h1 className="font-playfair italic text-4xl text-cream mb-3">Check your inbox</h1>
          <p className="font-lora text-ink-secondary leading-relaxed mb-6">
            We sent a verification link to <strong className="text-cream">{form.email}</strong>.
            Click it to activate your account.
          </p>
          <Link href="/auth/login" className="inline-block bg-gold text-night rounded-full px-8 py-3 font-mono text-xs tracking-widest uppercase font-bold hover:bg-gold/90 transition-colors">
            Back to Login →
          </Link>
        </div>
      </div>
    );
  }

  // ── Account type selection screen ────────────────────────────────────────
  if (!accountType) {
    return (
      <div className="min-h-screen bg-night flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          {/* Logo */}
          <div className="text-center mb-10">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold">
                <Zap className="h-5 w-5 text-night" />
              </div>
              <span className="font-playfair italic text-2xl text-cream">SwiftByte</span>
            </Link>
            <span className="block font-mono text-[9px] tracking-[0.25em] uppercase text-gold mb-2">— Join SwiftByte</span>
            <h1 className="font-playfair italic text-4xl text-cream mb-2">How will you use SwiftByte?</h1>
            <p className="font-lora text-ink-secondary text-sm">Choose your account type to get started</p>
          </div>

          <div className="space-y-3 mb-8">
            {ACCOUNT_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setAccountType(type.id)}
                className="w-full text-left rounded-2xl border border-gold/15 bg-surface hover:border-gold/40 hover:bg-elevated transition-all p-5 flex items-center gap-4 group"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl flex-shrink-0 text-2xl"
                  style={{ background: `${type.color}15`, border: `1px solid ${type.color}30` }}>
                  {type.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-playfair italic text-lg text-cream group-hover:text-gold transition-colors">{type.title}</p>
                  <p className="font-lora text-ink-secondary text-sm mt-0.5">{type.desc}</p>
                </div>
                <div className="flex-shrink-0 h-6 w-6 rounded-full border border-gold/20 group-hover:border-gold group-hover:bg-gold/10 transition-all flex items-center justify-center">
                  <ChevronRight className="h-3 w-3 text-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>

          <p className="text-center font-mono text-[9px] tracking-widest uppercase text-ink-secondary">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-gold hover:text-gold/80 transition-colors">Sign in →</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-night flex">
      {/* ── Left panel ──────────────────────────────── */}
      <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden bg-elevated items-center justify-center">
        <div className="absolute top-1/3 left-1/3 h-72 w-72 rounded-full bg-gold/10 blur-[90px]" />
        <div className="absolute bottom-1/4 right-1/4 h-56 w-56 rounded-full bg-flame/10 blur-[70px]" />
        <div className="relative z-10 px-12 text-center">
          <Link href="/" className="inline-flex items-center gap-3 mb-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold shadow-amber-glow">
              <Zap className="h-6 w-6 text-night" />
            </div>
            <span className="font-playfair italic text-3xl text-cream">SwiftByte</span>
          </Link>
          <h2 className="font-playfair italic text-4xl text-cream leading-tight mb-4">
            {accountType === "restaurant" ? "Start taking orders today." :
             accountType === "rider"      ? "Ride, earn, repeat." :
             <>Join <span className="text-gold">12,400+</span> food lovers.</>}
          </h2>
          <p className="font-lora text-ink-secondary text-base leading-relaxed max-w-xs mx-auto">
            {accountType === "restaurant" ? "List your restaurant on SwiftByte and reach thousands of hungry customers in your city." :
             accountType === "rider"      ? "Flexible hours, great earnings. Deliver with SwiftByte on your own schedule." :
             <>Create your account and get 20% off your first order with code <span className="text-gold font-mono">SWIFT20</span>.</>}
          </p>
          <div className="mt-8 space-y-3">
            {(accountType === "restaurant"
              ? ["Easy menu management", "Real-time orders", "Analytics dashboard", "Fast payments"]
              : accountType === "rider"
              ? ["Set your own hours", "Weekly payouts", "Navigation built-in", "Rider support 24/7"]
              : ["Free to join", "No minimum order", "Real-time tracking", "20% off first order"]
            ).map((f) => (
              <div key={f} className="flex items-center gap-2 text-ink-secondary font-mono text-[10px] tracking-widest uppercase">
                <CheckCircle className="h-3 w-3 text-gold flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form ──────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold">
                <Zap className="h-5 w-5 text-night" />
              </div>
              <span className="font-playfair italic text-2xl text-cream">SwiftByte</span>
            </Link>
          </div>

          <div className="mb-8">
            <button onClick={() => setAccountType(null)} className="inline-flex items-center gap-1.5 font-mono text-[9px] tracking-widest uppercase text-ink-secondary hover:text-gold transition-colors mb-4">
              <ChevronRight className="h-3 w-3 rotate-180" /> Back
            </button>
            <span className="block font-mono text-[9px] tracking-[0.25em] uppercase text-gold">
              — {ACCOUNT_TYPES.find(t => t.id === accountType)?.title}
            </span>
            <h1 className="font-playfair italic text-4xl text-cream mt-1 mb-1">Create account</h1>
            <p className="font-lora text-ink-secondary text-sm">
              Already have one?{" "}
              <Link href="/auth/login" className="text-gold hover:text-gold/80 transition-colors">Sign in →</Link>
            </p>
          </div>

          {/* Google Sign-Up */}
          <div className="mb-6">
            <div ref={googleBtnRef} className="w-full rounded-xl overflow-hidden" style={{ minHeight: 44 }} />
            {!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
              <p className="text-center font-mono text-[9px] text-ink-secondary mt-2">Google sign-in requires NEXT_PUBLIC_GOOGLE_CLIENT_ID</p>
            )}
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gold/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-night px-4 font-mono text-[9px] tracking-widest uppercase text-ink-secondary">or register with email</span>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Name */}
            <div>
              <label className="mb-1.5 block font-mono text-[9px] tracking-widest uppercase text-ink-secondary">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-secondary" />
                <input value={form.name} onChange={set("name")} type="text" placeholder="Your full name" required className={inputClass} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block font-mono text-[9px] tracking-widest uppercase text-ink-secondary">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-secondary" />
                <input value={form.email} onChange={set("email")} type="email" placeholder="you@example.com" required className={inputClass} />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="mb-1.5 block font-mono text-[9px] tracking-widest uppercase text-ink-secondary">Phone (Optional)</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-secondary" />
                <input value={form.phone} onChange={set("phone")} type="tel" placeholder="+1 555 000 0000" className={inputClass} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block font-mono text-[9px] tracking-widest uppercase text-ink-secondary">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-secondary" />
                <input value={form.password} onChange={set("password")} type={showPassword ? "text" : "password"} placeholder="••••••••" required className={inputClass + " pr-11"} />
                <button type="button" onClick={() => setShowPwd(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-secondary hover:text-cream transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-1.5 block font-mono text-[9px] tracking-widest uppercase text-ink-secondary">Confirm Password *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-secondary" />
                <input value={form.confirm} onChange={set("confirm")} type={showPassword ? "text" : "password"} placeholder="••••••••" required className={`${inputClass} ${form.confirm && form.password !== form.confirm ? "border-flame/50 focus:border-flame/70" : ""}`} />
              </div>
              {form.confirm && form.password !== form.confirm && (
                <p className="mt-1 font-lora text-xs text-flame">Passwords don't match</p>
              )}
            </div>

            <p className="font-lora text-[11px] text-ink-secondary leading-relaxed">
              By creating an account you agree to our{" "}
              <Link href="/terms" className="text-gold hover:underline">Terms</Link> and{" "}
              <Link href="/privacy" className="text-gold hover:underline">Privacy Policy</Link>.
            </p>

            <button
              type="submit"
              disabled={loading || (!!form.confirm && form.password !== form.confirm)}
              className="w-full rounded-full bg-gold py-3.5 font-mono text-xs tracking-widest uppercase font-bold text-night transition-all hover:bg-gold/90 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : null}
              {loading ? "Creating account…" : "Create Account →"}
            </button>
          </form>

          {accountType === "customer" && (
            <p className="mt-6 text-center font-mono text-[9px] tracking-widest uppercase text-ink-secondary">
              Want to list your restaurant?{" "}
              <Link href="/apply/restaurant" className="text-gold hover:text-gold/80 transition-colors">Become a Partner →</Link>
            </p>
          )}
          {accountType === "restaurant" && (
            <p className="mt-6 text-center font-lora text-xs text-ink-secondary">
              After signing up you&apos;ll complete your restaurant application on the next step.
            </p>
          )}
          {accountType === "rider" && (
            <p className="mt-6 text-center font-lora text-xs text-ink-secondary">
              After signing up you&apos;ll fill out your rider application on the next step.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
