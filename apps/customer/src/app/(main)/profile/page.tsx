"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api";
import { useState } from "react";
import { User, Mail, Phone, Star, Package, MapPin, Settings, Camera } from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "" });

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => authApi.me().then((r) => r.data.data),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => authApi.updateProfile(data),
    onSuccess: (res) => {
      setUser(res.data.data);
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated!");
      setEditing(false);
    },
    onError: () => toast.error("Failed to update profile"),
  });

  const stats = [
    { icon: Package, label: "Total Orders", value: "12" },
    { icon: Star, label: "Panda Points", value: profile?.loyaltyBalance || 0 },
    { icon: MapPin, label: "Saved Addresses", value: profile?.addresses?.length || 0 },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>

      {/* Avatar & Basic Info */}
      <div className="card p-6 mb-5">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-brand-400 to-orange-400 flex items-center justify-center text-3xl font-bold text-white shadow-md">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <button className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-white border-2 border-gray-100 shadow-sm hover:bg-gray-50">
              <Camera className="h-3.5 w-3.5 text-gray-600" />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="badge bg-brand-100 text-brand-700 capitalize mt-1">{user?.role}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 border-t border-gray-100 pt-5">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="text-center">
              <div className="flex justify-center mb-1">
                <Icon className="h-4 w-4 text-brand-500" />
              </div>
              <p className="text-lg font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Form */}
      <div className="card p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900">Personal Information</h3>
          <button
            onClick={() => setEditing(!editing)}
            className={editing ? "btn-ghost text-sm text-gray-500" : "btn-secondary text-sm"}
          >
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>

        {editing ? (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input h-10 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 555 000 0000"
                className="input h-10 text-sm"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => updateMutation.mutate(form)}
                disabled={updateMutation.isPending}
                className="btn-primary text-sm flex-1"
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {[
              { icon: User, label: "Name", value: user?.name },
              { icon: Mail, label: "Email", value: user?.email },
              { icon: Phone, label: "Phone", value: user?.phone || "Not set" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100">
                  <Icon className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-medium text-gray-900">{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Loyalty Points */}
      <div className="card p-5 mb-5 bg-gradient-to-br from-brand-500 to-orange-500 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-80">Panda Points Balance</p>
            <p className="text-3xl font-extrabold mt-1">{profile?.loyaltyBalance || 0}</p>
            <p className="text-xs opacity-70 mt-1">= ${((profile?.loyaltyBalance || 0) / 100).toFixed(2)} in rewards</p>
          </div>
          <div className="text-5xl">⭐</div>
        </div>
        <p className="text-xs opacity-70 mt-3">Earn 1 point for every $1 spent. Redeem 100 points for $1 off.</p>
      </div>

      {/* Settings */}
      <div className="card">
        {[
          { icon: Settings, label: "Account Settings", href: "/settings" },
          { icon: MapPin, label: "Saved Addresses", href: "/addresses" },
          { icon: Star, label: "My Reviews", href: "/reviews" },
        ].map(({ icon: Icon, label, href }) => (
          <a
            key={href}
            href={href}
            className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors first:rounded-t-2xl last:rounded-b-2xl border-b border-gray-100 last:border-none"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100">
                <Icon className="h-4 w-4 text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-800">{label}</span>
            </div>
            <span className="text-gray-400">›</span>
          </a>
        ))}
      </div>
    </div>
  );
}
