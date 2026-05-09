"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api";
import { Zap, Mail, Lock, Eye, EyeOff, ChefHat } from "lucide-react";
import toast from "react-hot-toast";

export default function RestaurantLoginPage() {
  const router = useRouter();
  const { setAuth, logout } = useAuthStore();
  const [email, setEmail]     = useState("");
  const [password, setPwd]    = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login(email, password, "restaurant");
      const { user, accessToken } = res.data.data;

      // Check if user has the restaurant role in their roles array
      const hasRestaurantRole = (user.roles || []).includes("restaurant") || user.role === "restaurant" || user.role === "admin";
      if (!hasRestaurantRole) {
        toast.error(
          "You don't have a restaurant yet. Apply at swiftbyte.com/apply/restaurant",
          { duration: 5000 }
        );
        return;
      }
      setAuth(user, accessToken);

      // Auto-fetch this user's restaurant
      try {
        const { restaurantApi } = await import("@/lib/api");
        const rRes = await restaurantApi.mine();
        const r = rRes.data.data;
        const { setRestaurant } = await import("@/store/authStore").then(m => m.useAuthStore.getState());
        setRestaurant(r.id, r.name);
      } catch {
        // No restaurant yet (maybe pending approval)
      }

      toast.success(`Welcome, ${user.name}!`);
      router.push("/dashboard");
    } catch (err: any) {
      logout(); // clear any stale session
      toast.error(err.response?.data?.error || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0B08] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-[#F5A623]/8 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-[#E8372A]/8 blur-[80px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5A623]" style={{boxShadow:"0 0 30px rgba(245,166,35,0.35)"}}>
              <Zap className="h-7 w-7 text-[#0D0B08]" />
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#0D0B08] border border-[#F5A623]/30">
                <ChefHat className="h-3.5 w-3.5 text-[#F5A623]" />
              </div>
            </div>
            <div className="text-left">
              <p style={{fontFamily:"'Playfair Display',serif"}} className="italic text-2xl text-[#F5ECD7]">SwiftByte</p>
              <p style={{fontFamily:"'DM Mono',monospace"}} className="text-[9px] tracking-widest uppercase text-[#9E8E78]">Restaurant Dashboard</p>
            </div>
          </div>
          <h1 style={{fontFamily:"'Playfair Display',serif"}} className="italic text-4xl text-[#F5ECD7] mt-4">Welcome back.</h1>
          <p style={{fontFamily:"'Lora',serif"}} className="text-[#9E8E78] mt-1">Sign in to manage your restaurant</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-[rgba(245,166,35,0.15)] bg-[#161410] p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label style={{fontFamily:"'DM Mono',monospace"}} className="text-[10px] tracking-widest uppercase text-[#9E8E78] block mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4A4035] pointer-events-none" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[rgba(245,166,35,0.15)] bg-[#1F1C18] pl-11 pr-4 py-3 text-sm text-[#F5ECD7] placeholder:text-[#4A4035] outline-none transition-colors"
                  style={{fontFamily:"'Lora',serif"}}
                  onFocus={e => e.target.style.borderColor = "rgba(245,166,35,0.5)"}
                  onBlur={e => e.target.style.borderColor = "rgba(245,166,35,0.15)"} />
              </div>
            </div>

            <div>
              <label style={{fontFamily:"'DM Mono',monospace"}} className="text-[10px] tracking-widest uppercase text-[#9E8E78] block mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4A4035] pointer-events-none" />
                <input type={showPwd ? "text" : "password"} value={password} onChange={(e) => setPwd(e.target.value)}
                  className="w-full rounded-xl border border-[rgba(245,166,35,0.15)] bg-[#1F1C18] pl-11 pr-11 py-3 text-sm text-[#F5ECD7] placeholder:text-[#4A4035] outline-none transition-colors"
                  style={{fontFamily:"'Lora',serif"}}
                  onFocus={e => e.target.style.borderColor = "rgba(245,166,35,0.5)"}
                  onBlur={e => e.target.style.borderColor = "rgba(245,166,35,0.15)"} />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4A4035] hover:text-[#F5ECD7] transition-colors">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full rounded-full py-3.5 text-sm font-bold tracking-widest uppercase text-[#0D0B08] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              style={{fontFamily:"'DM Mono',monospace", backgroundColor:"#F5A623", boxShadow: loading ? "none" : "0 0 25px rgba(245,166,35,0.3)"}}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-[#0D0B08] border-t-transparent animate-spin" />
                  Signing in...
                </span>
              ) : "Sign In →"}
            </button>
          </form>

          <p style={{fontFamily:"'Lora',serif"}} className="mt-5 text-center text-xs text-[#4A4035]">
            Don&apos;t have a restaurant yet?{" "}
            <a href="http://localhost:3000/apply/restaurant" className="text-[#F5A623] hover:opacity-80 transition-opacity">Apply here →</a>
          </p>
        </div>
      </div>
    </div>
  );
}
