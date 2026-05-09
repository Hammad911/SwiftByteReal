"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCartStore, selectCartSubtotal } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { orderApi, voucherApi, addressApi } from "@/lib/api";
import { MapPin, CreditCard, Banknote, Tag, Clock, ChevronRight, Plus, X } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

const inputClass = "w-full rounded-xl border bg-elevated pl-4 pr-4 py-3 text-sm text-cream placeholder:text-ink-muted outline-none focus:border-gold/50 transition-colors font-lora";
const borderColor = "border-gold/15";

export default function CheckoutPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore(selectCartSubtotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const restaurantId = useCartStore((s) => s.restaurantId);
  const { user, isAuthenticated } = useAuthStore();

  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: "Home", fullAddress: "", isDefault: true });
  const [paymentMethod, setPaymentMethod]     = useState<"card" | "cash">("cash");
  const [voucherCode, setVoucherCode]         = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [scheduledFor, setScheduledFor]       = useState("");
  const [customerNote, setCustomerNote]       = useState("");
  const [validating, setValidating]           = useState(false);

  const deliveryFee = 2.99;
  const total       = Math.max(0, subtotal + deliveryFee - appliedDiscount);

  const { data: addresses } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => addressApi.list().then((r) => r.data.data),
    enabled: isAuthenticated,
  });

  const createAddressMutation = useMutation({
    mutationFn: () =>
      addressApi.create({
        label: newAddr.label.trim(),
        fullAddress: newAddr.fullAddress.trim(),
        lat: 33.6844,
        lng: 73.0479,
        isDefault: newAddr.isDefault,
      }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["addresses"] });
      setSelectedAddress(res.data.data.id);
      setAddressModalOpen(false);
      setNewAddr({ label: "Home", fullAddress: "", isDefault: true });
      toast.success("Address saved");
    },
    onError: (err: any) => toast.error(err.response?.data?.error || "Could not save address"),
  });

  const createOrderMutation = useMutation({
    mutationFn: (data: any) => orderApi.create(data),
    onSuccess: (res) => {
      clearCart();
      toast.success("Order placed! Kitchen is being notified 🎉");
      router.push(`/orders/${res.data.data.id}`);
    },
    onError: (err: any) => toast.error(err.response?.data?.error || "Failed to place order"),
  });

  const validateVoucher = async () => {
    if (!voucherCode.trim()) return;
    setValidating(true);
    try {
      const res = await voucherApi.validate(voucherCode, subtotal);
      setAppliedDiscount(res.data.data.discount);
      toast.success(`Voucher applied — $${res.data.data.discount.toFixed(2)} off`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Invalid voucher code");
      setAppliedDiscount(0);
    } finally {
      setValidating(false);
    }
  };

  const handlePlaceOrder = () => {
    if (!isAuthenticated) { router.push("/auth/login?redirect=/checkout"); return; }
    if (items.length === 0) { toast.error("Cart is empty"); return; }
    const addressId = selectedAddress || addresses?.[0]?.id;
    if (!addressId) { toast.error("Please add a delivery address"); return; }

    createOrderMutation.mutate({
      restaurantId,
      addressId,
      items: items.map((i) => ({
        menuItemId: i.menuItemId,
        quantity: i.quantity,
        customisations: i.customisations,
        specialInstructions: i.specialInstructions,
      })),
      paymentMethod,
      voucherCode: appliedDiscount > 0 ? voucherCode : undefined,
      scheduledFor: scheduledFor || undefined,
      customerNote: customerNote || undefined,
    });
  };

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <p className="font-bebas text-8xl text-gold/20">Empty</p>
        <p className="font-playfair italic text-3xl text-cream mt-2">Your cart is empty</p>
        <p className="font-lora text-ink-secondary mt-2">Add something delicious to get started.</p>
        <button onClick={() => router.push("/")} className="btn-gold mt-8">Browse Restaurants</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <span className="eyebrow">— Almost there</span>
        <h1 className="h-display text-5xl mt-2">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Delivery address */}
          <Section icon={MapPin} title="Delivery Address">
            {addresses?.length > 0 ? (
              <div className="space-y-2">
                {addresses.map((addr: any) => (
                  <label key={addr.id} className="flex items-start gap-3 cursor-pointer rounded-xl p-3 transition-colors" style={{ background: (selectedAddress === addr.id || (!selectedAddress && addr.isDefault)) ? "rgba(245,166,35,0.08)" : "transparent", border: `1px solid ${(selectedAddress === addr.id || (!selectedAddress && addr.isDefault)) ? "rgba(245,166,35,0.3)" : "rgba(245,166,35,0.1)"}` }}>
                    <input type="radio" name="address" value={addr.id} checked={selectedAddress === addr.id || (!selectedAddress && addr.isDefault)} onChange={() => setSelectedAddress(addr.id)} className="mt-0.5 accent-gold" />
                    <div>
                      <p className="text-sm font-semibold text-cream">{addr.label}</p>
                      <p className="text-sm text-ink-secondary">{addr.fullAddress}</p>
                    </div>
                  </label>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    if (!isAuthenticated) { router.push("/auth/login?redirect=/checkout"); return; }
                    setAddressModalOpen(true);
                  }}
                  className="w-full mt-1 font-mono text-[10px] tracking-widest uppercase text-gold border border-dashed border-gold/25 rounded-xl py-2 hover:border-gold/50 transition-colors"
                >
                  + Add another address
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-ink-secondary">No saved addresses</p>
                <button
                  type="button"
                  onClick={() => {
                    if (!isAuthenticated) {
                      router.push("/auth/login?redirect=/checkout");
                      return;
                    }
                    setAddressModalOpen(true);
                  }}
                  className="mt-2 font-mono text-xs tracking-widest uppercase text-gold border border-gold/30 rounded-full px-4 py-1.5 hover:border-gold/60 transition-colors"
                >
                  <Plus className="h-3 w-3 inline mr-1" />Add Address
                </button>
              </div>
            )}
          </Section>

          {/* Payment */}
          <Section icon={CreditCard} title="Payment Method">
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "card", label: "Card", icon: CreditCard },
                { value: "cash", label: "Cash on Delivery", icon: Banknote },
              ].map(({ value, label, icon: Icon }) => (
                <label key={value} className="flex items-center gap-3 rounded-xl p-4 cursor-pointer transition-all" style={{ border: `1px solid ${paymentMethod === value ? "rgba(245,166,35,0.5)" : "rgba(245,166,35,0.12)"}`, background: paymentMethod === value ? "rgba(245,166,35,0.08)" : "transparent" }}>
                  <input type="radio" name="payment" value={value} checked={paymentMethod === value} onChange={() => setPaymentMethod(value as any)} className="hidden" />
                  <Icon className="h-4 w-4 flex-shrink-0" style={{ color: paymentMethod === value ? "#F5A623" : "#4A4035" }} />
                  <span className="text-sm" style={{ color: paymentMethod === value ? "#F5ECD7" : "#9E8E78" }}>{label}</span>
                </label>
              ))}
            </div>
          </Section>

          {/* Voucher */}
          <Section icon={Tag} title="Promo Code">
            <div className="flex gap-2">
              <input type="text" value={voucherCode} onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                placeholder="SWIFT20" className={`${inputClass} ${borderColor} flex-1`} />
              <button onClick={validateVoucher} disabled={validating || !voucherCode.trim()}
                className="rounded-full bg-gold px-5 font-mono text-xs tracking-widest uppercase text-night hover:bg-gold/90 disabled:opacity-40 transition-all flex-shrink-0">
                {validating ? "…" : "Apply"}
              </button>
            </div>
            {appliedDiscount > 0 && (
              <div className="mt-2 flex items-center gap-2 text-sm" style={{ color: "#4ade80" }}>
                <span>✓ {voucherCode} — ${appliedDiscount.toFixed(2)} off</span>
                <button onClick={() => { setAppliedDiscount(0); setVoucherCode(""); }} className="ml-auto"><X className="h-3.5 w-3.5" /></button>
              </div>
            )}
          </Section>

          {/* Schedule */}
          <Section icon={Clock} title="Schedule Delivery (optional)">
            <input type="datetime-local" value={scheduledFor} onChange={(e) => setScheduledFor(e.target.value)}
              min={new Date(Date.now() + 30 * 60000).toISOString().slice(0, 16)}
              className={`${inputClass} ${borderColor}`} />
          </Section>

          {/* Note */}
          <div className="rounded-2xl p-5" style={{ background: "#161410", border: "1px solid rgba(245,166,35,0.12)" }}>
            <p className="font-mono text-[10px] tracking-widest uppercase text-ink-secondary mb-3">Order Notes</p>
            <textarea value={customerNote} onChange={(e) => setCustomerNote(e.target.value)}
              placeholder="Any special instructions for the kitchen…"
              className={`${inputClass} ${borderColor} h-20 resize-none`} maxLength={300} />
          </div>
        </div>

        {/* ── Right: Summary ── */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl p-5 sticky top-24" style={{ background: "#161410", border: "1px solid rgba(245,166,35,0.2)" }}>
            <p className="font-mono text-[10px] tracking-widest uppercase text-ink-secondary mb-5">Order Summary</p>

            {/* Items */}
            <div className="space-y-3 mb-5 max-h-56 overflow-y-auto no-scrollbar">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  {item.photo ? (
                    <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg">
                      <Image src={item.photo} alt={item.name} fill className="object-cover" sizes="44px" />
                    </div>
                  ) : (
                    <div className="h-11 w-11 flex-shrink-0 rounded-lg flex items-center justify-center text-lg" style={{ background: "#1F1C18" }}>🍽️</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-cream truncate">{item.quantity}× {item.name}</p>
                    {item.customisations.length > 0 && (
                      <p className="text-xs text-ink-muted truncate">{item.customisations.map((c) => c.optionName).join(", ")}</p>
                    )}
                  </div>
                  <span className="text-sm font-bold text-gold flex-shrink-0">${item.itemTotal.toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2 pt-4" style={{ borderTop: "1px solid rgba(245,166,35,0.1)" }}>
              {[
                { label: "Subtotal",        value: `$${subtotal.toFixed(2)}`,   color: "#9E8E78" },
                { label: "Delivery fee",    value: `$${deliveryFee.toFixed(2)}`, color: "#9E8E78" },
                ...(appliedDiscount > 0 ? [{ label: `Discount (${voucherCode})`, value: `-$${appliedDiscount.toFixed(2)}`, color: "#4ade80" }] : []),
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span style={{ color }}>{label}</span>
                  <span style={{ color }}>{value}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold pt-3" style={{ borderTop: "1px solid rgba(245,166,35,0.1)" }}>
                <span className="text-cream">Total</span>
                <span className="font-bebas text-2xl leading-none text-gold">${total.toFixed(2)}</span>
              </div>
            </div>

            <button onClick={handlePlaceOrder} disabled={createOrderMutation.isPending}
              className="w-full mt-5 flex items-center justify-center gap-2 rounded-full bg-gold py-3.5 font-mono text-sm font-bold tracking-widest uppercase text-night hover:bg-gold/90 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-amber-glow">
              {createOrderMutation.isPending ? (
                <><span className="h-4 w-4 rounded-full border-2 border-night border-t-transparent animate-spin" />Placing…</>
              ) : (
                <>Place Order · ${total.toFixed(2)}<ChevronRight className="h-4 w-4" /></>
              )}
            </button>
            <p className="mt-3 text-center font-mono text-[9px] tracking-widest uppercase text-ink-muted">Secure checkout</p>
          </div>
        </div>
      </div>

      {/* Add address modal */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-night/80 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl border border-gold/20 bg-surface p-6 shadow-amber-glow">
            <div className="flex items-center justify-between mb-4">
              <p className="font-mono text-[10px] tracking-widest uppercase text-gold">New delivery address</p>
              <button type="button" onClick={() => setAddressModalOpen(false)} className="text-ink-muted hover:text-cream" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="font-mono text-[9px] tracking-widest uppercase text-ink-secondary block mb-1.5">Label</label>
                <input
                  value={newAddr.label}
                  onChange={(e) => setNewAddr((a) => ({ ...a, label: e.target.value }))}
                  placeholder="Home, Work…"
                  className={`${inputClass} ${borderColor}`}
                />
              </div>
              <div>
                <label className="font-mono text-[9px] tracking-widest uppercase text-ink-secondary block mb-1.5">Full address</label>
                <textarea
                  value={newAddr.fullAddress}
                  onChange={(e) => setNewAddr((a) => ({ ...a, fullAddress: e.target.value }))}
                  placeholder="Street, building, area, city…"
                  rows={3}
                  className={`${inputClass} ${borderColor} resize-none`}
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newAddr.isDefault}
                  onChange={(e) => setNewAddr((a) => ({ ...a, isDefault: e.target.checked }))}
                  className="accent-gold"
                />
                <span className="text-sm text-ink-secondary">Set as default</span>
              </label>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                type="button"
                onClick={() => createAddressMutation.mutate()}
                disabled={!newAddr.label.trim() || !newAddr.fullAddress.trim() || createAddressMutation.isPending}
                className="flex-1 rounded-full bg-gold py-3 font-mono text-xs font-bold tracking-widest uppercase text-night hover:bg-gold/90 disabled:opacity-40"
              >
                {createAddressMutation.isPending ? "Saving…" : "Save address"}
              </button>
              <button
                type="button"
                onClick={() => setAddressModalOpen(false)}
                className="rounded-full border border-gold/25 px-4 font-mono text-[10px] tracking-widest uppercase text-ink-secondary hover:border-gold/50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: "#161410", border: "1px solid rgba(245,166,35,0.12)" }}>
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-4 w-4 text-gold" />
        <p className="font-mono text-[10px] tracking-widest uppercase text-ink-secondary">{title}</p>
      </div>
      {children}
    </div>
  );
}
