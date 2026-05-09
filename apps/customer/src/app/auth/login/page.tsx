"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api";
import { Eye, EyeOff, Zap, Mail, Lock, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

declare global {
  interface Window {
    google?: any;
  }
}

const DEMO = {
  customer:   { email: "alice@example.com",    password: "Password123!" },
  restaurant: { email: "owner1@swiftbyte.com", password: "Password123!" },
  rider:      { email: "marcus@rider.com",      password: "Password123!" },
  admin:      { email: "admin@swiftbyte.com",   password: "Password123!" },
};

type LoginRole = "customer" | "restaurant" | "rider" | "admin";

const ROLE_CARDS: { id: LoginRole; emoji: string; title: string; desc: string; color: string; portalUrl?: string }[] = [
  { id: "customer",   emoji: "🍔", title: "Customer",          desc: "Order food from the best restaurants",    color: "#F5A623" },
  { id: "restaurant", emoji: "🍽️", title: "Restaurant Manager", desc: "Manage your restaurant & orders",         color: "#4ad295", portalUrl: "http://localhost:3001/login" },
  { id: "rider",      emoji: "🛵", title: "Delivery Rider",    desc: "View and manage your deliveries",          color: "#60a5fa", portalUrl: "http://localhost:3002/login" },
  { id: "admin",      emoji: "🛡️", title: "Admin",             desc: "Platform management & analytics",          color: "#c084fc", portalUrl: "http://localhost:3003/login" },
];

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postLoginRedirect = searchParams.get("redirect");
  const { setUser, setTokens } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState<LoginRole | null>(null);
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPassword, setShowPwd]  = useState(false);
  const [loading, setLoading]       = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const fillDemo = (role: keyof typeof DEMO) => {
    setEmail(DEMO[role].email);
    setPassword(DEMO[role].password);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Fill in both fields"); return; }
    setLoading(true);
    try {
      const res = await authApi.login(email, password, selectedRole ?? "customer");
      const { user, accessToken, refreshToken } = res.data.data;
      setUser(user);
      setTokens(accessToken, refreshToken);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
      // Other portals run on different origins — must use full navigation
      if (user.role === "restaurant") window.location.href = "http://localhost:3001/dashboard";
      else if (user.role === "rider") window.location.href = "http://localhost:3002";
      else if (user.role === "admin") window.location.href = "http://localhost:3003/dashboard";
      else if (postLoginRedirect?.startsWith("/")) router.push(postLoginRedirect);
      else router.push("/");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async (response: any) => {
    setGoogleLoading(true);
    try {
      const res = await authApi.googleAuth(response.credential);
      const { user, accessToken, refreshToken } = res.data.data;
      setUser(user);
      setTokens(accessToken, refreshToken);
      toast.success(`Welcome, ${user.name.split(" ")[0]}!`);
      if (user.role === "restaurant") window.location.href = "http://localhost:3001/dashboard";
      else if (user.role === "rider") window.location.href = "http://localhost:3002";
      else if (user.role === "admin") window.location.href = "http://localhost:3003/dashboard";
      else if (postLoginRedirect?.startsWith("/")) router.push(postLoginRedirect);
      else router.push("/");
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
      if (!window.google || !googleBtnRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleSignIn,
      });
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "filled_black",
        size: "large",
        width: googleBtnRef.current.offsetWidth || 400,
        text: "continue_with",
        logo_alignment: "center",
      });
    };

    if (window.google) { initGoogle(); return; }

    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) { existing.addEventListener("load", initGoogle); return; }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;
    document.head.appendChild(script);
  }, []);

  // ── Role selection screen ──────────────────────────────────────────────
  if (!selectedRole) {
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
            <span className="block font-mono text-[9px] tracking-[0.25em] uppercase text-gold mb-2">— Welcome back</span>
            <h1 className="font-playfair italic text-4xl text-cream mb-2">Sign in as…</h1>
            <p className="font-lora text-ink-secondary text-sm">Choose your account type to continue</p>
          </div>

          <div className="space-y-3 mb-8">
            {ROLE_CARDS.map((card) => (
              <button
                key={card.id}
                onClick={() => {
                  if (card.portalUrl) {
                    window.location.href = card.portalUrl;
                  } else {
                    setSelectedRole(card.id);
                    fillDemo(card.id);
                  }
                }}
                className="w-full text-left rounded-2xl border border-gold/15 bg-surface hover:border-gold/40 hover:bg-elevated transition-all p-5 flex items-center gap-4 group"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl flex-shrink-0 text-2xl"
                  style={{ background: `${card.color}15`, border: `1px solid ${card.color}30` }}>
                  {card.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-playfair italic text-lg text-cream group-hover:text-gold transition-colors">{card.title}</p>
                  <p className="font-lora text-ink-secondary text-sm mt-0.5">{card.desc}</p>
                </div>
                <div className="flex-shrink-0 h-6 w-6 rounded-full border border-gold/20 group-hover:border-gold group-hover:bg-gold/10 transition-all flex items-center justify-center">
                  <ChevronRight className="h-3 w-3 text-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>

          <p className="text-center font-mono text-[9px] tracking-widest uppercase text-ink-secondary">
            New to SwiftByte?{" "}
            <Link href="/auth/register" className="text-gold hover:text-gold/80 transition-colors">Create account →</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-night flex">
      {/* ── Left decorative panel ─────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-elevated items-center justify-center">
        {/* Amber blobs */}
        <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-gold/10 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-flame/10 blur-[80px]" />

        <div className="relative z-10 px-16 text-center">
          <Link href="/" className="inline-flex items-center gap-3 mb-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold shadow-amber-glow">
              <Zap className="h-6 w-6 text-night" />
            </div>
            <span className="font-playfair italic text-3xl text-cream">SwiftByte</span>
          </Link>

          <h2 className="font-playfair italic text-5xl text-cream leading-tight mb-4">
            Food that <span className="text-gold">moves you.</span>
          </h2>
          <p className="font-lora text-ink-secondary text-lg leading-relaxed max-w-sm mx-auto">
            From the city's finest kitchens to your doorstep. Real ingredients. Real fast.
          </p>

          <div className="mt-10 flex items-center justify-center gap-8 font-mono text-[10px] tracking-widest uppercase text-ink-secondary">
            <div className="text-center">
              <p className="font-bebas text-4xl text-gold">200+</p>
              <p>Restaurants</p>
            </div>
            <div className="w-px h-8 bg-gold/20" />
            <div className="text-center">
              <p className="font-bebas text-4xl text-gold">18min</p>
              <p>Avg delivery</p>
            </div>
            <div className="w-px h-8 bg-gold/20" />
            <div className="text-center">
              <p className="font-bebas text-4xl text-gold">4.9★</p>
              <p>Avg rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ──────────────────────── */}
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
            <button
              onClick={() => setSelectedRole(null)}
              className="inline-flex items-center gap-1.5 font-mono text-[9px] tracking-widest uppercase text-ink-secondary hover:text-gold transition-colors mb-4"
            >
              <ChevronRight className="h-3 w-3 rotate-180" /> Back
            </button>
            <span className="block font-mono text-[10px] tracking-widest uppercase text-gold">— Welcome back</span>
            <h1 className="font-playfair italic text-4xl text-cream mt-2">Sign in</h1>
            <p className="font-lora text-ink-secondary mt-1">Don't have an account?{" "}
              <Link href="/auth/register" className="text-gold hover:text-gold/80 transition-colors">Create one →</Link>
            </p>
          </div>

          {/* Demo buttons */}
          <div className="mb-6 rounded-2xl border border-gold/15 bg-elevated p-4">
            <p className="font-mono text-[9px] tracking-widest uppercase text-ink-secondary mb-3">Quick demo login</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(DEMO) as Array<keyof typeof DEMO>).map((role) => (
                <button
                  key={role}
                  onClick={() => fillDemo(role)}
                  className="rounded-full border border-gold/20 bg-night px-4 py-1.5 font-mono text-[9px] tracking-widest uppercase text-cream hover:border-gold/60 hover:text-gold transition-all capitalize"
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="font-mono text-[10px] tracking-widest uppercase text-ink-secondary block mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-gold/15 bg-elevated pl-11 pr-4 py-3 text-sm text-cream placeholder:text-ink-muted outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-colors font-lora"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-mono text-[10px] tracking-widest uppercase text-ink-secondary">Password</label>
                <Link href="/auth/forgot-password" className="font-mono text-[9px] tracking-widest uppercase text-gold hover:text-gold/80 transition-colors">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gold/15 bg-elevated pl-11 pr-11 py-3 text-sm text-cream placeholder:text-ink-muted outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-colors font-lora"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted hover:text-cream transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-gold px-6 py-3.5 font-mono text-sm font-bold tracking-widest uppercase text-night hover:bg-gold/90 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-amber-glow mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-night border-t-transparent animate-spin" />
                  Signing in...
                </span>
              ) : "Sign In →"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gold/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-night px-4 font-mono text-[9px] tracking-widest uppercase text-ink-muted">or continue with</span>
            </div>
          </div>

          {/* Google Sign-In — rendered by GIS SDK */}
          <div ref={googleBtnRef} className="w-full rounded-xl overflow-hidden" style={{ minHeight: 44 }} />

          <p className="mt-6 text-center font-lora text-sm text-ink-secondary">
            Want to list your restaurant?{" "}
            <Link href="/become-a-partner" className="text-gold hover:text-gold/80 transition-colors">
              Become a Partner →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-night flex items-center justify-center">
          <div className="h-9 w-9 rounded-full border-2 border-gold border-t-transparent animate-spin" />
        </div>
      }
    >
      <LoginPageInner />
    </Suspense>
  );
}
