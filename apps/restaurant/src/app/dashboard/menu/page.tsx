"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { restaurantApi } from "@/lib/api";
import { useState } from "react";
import {
  Plus, Trash2, ChevronDown, ChevronRight,
  Star, ImageIcon, ToggleLeft, ToggleRight,
  Pencil, X, Check, Loader2, UtensilsCrossed,
} from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

const gold = "#F5A623", night = "#0D0B08", surface = "#161410";
const elevated = "#1F1C18", cream = "#F5ECD7", muted = "#9E8E78";
const border = "rgba(245,166,35,0.15)", flame = "#E8372A";

const DIETARY = ["halal", "vegan", "vegetarian", "gluten-free", "spicy"];

function Tag({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{
      padding: "0.25rem 0.625rem", borderRadius: "3rem", cursor: "pointer",
      background: active ? gold : elevated, color: active ? night : muted,
      border: `1px solid ${active ? gold : border}`,
      fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.08em",
      textTransform: "capitalize" as const, transition: "all 0.15s",
    }}>{label}</button>
  );
}

function ItemRow({ item, restaurantId, catId, qc }: any) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: item.name, price: String(item.price), description: item.description || "" });

  const toggleMutation = useMutation({
    mutationFn: () => restaurantApi.updateItem(restaurantId, item.id, { isAvailable: !item.isAvailable }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["menu", restaurantId] }),
  });

  const updateMutation = useMutation({
    mutationFn: () => restaurantApi.updateItem(restaurantId, item.id, { name: form.name, price: parseFloat(form.price), description: form.description }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["menu", restaurantId] }); setEditing(false); toast.success("Item updated"); },
  });

  const deleteMutation = useMutation({
    mutationFn: () => restaurantApi.deleteItem(restaurantId, item.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["menu", restaurantId] }); toast.success("Item deleted"); },
  });

  return (
    <div style={{ padding: "1rem 1.25rem", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", gap: "1rem" }}>
      {/* Thumbnail */}
      <div style={{ width: 52, height: 52, borderRadius: "0.75rem", background: elevated, flexShrink: 0, overflow: "hidden", border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {item.photo
          ? <Image src={item.photo} alt={item.name} width={52} height={52} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
          : <ImageIcon size={18} color={muted} />}
      </div>

      {editing ? (
        <div style={{ flex: 1, display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            style={{ background: elevated, border: `1px solid ${border}`, borderRadius: "0.5rem", padding: "0.375rem 0.625rem", color: cream, fontSize: "0.8rem", outline: "none", minWidth: 120 }} />
          <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} type="number" min="0" step="0.01"
            style={{ background: elevated, border: `1px solid ${border}`, borderRadius: "0.5rem", padding: "0.375rem 0.625rem", color: gold, fontSize: "0.8rem", outline: "none", width: 80 }} />
          <button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending} style={{ background: gold, color: night, border: "none", borderRadius: "0.5rem", padding: "0.375rem 0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", fontWeight: 700 }}>
            {updateMutation.isPending ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Check size={13} />} Save
          </button>
          <button onClick={() => setEditing(false)} style={{ background: elevated, color: muted, border: `1px solid ${border}`, borderRadius: "0.5rem", padding: "0.375rem 0.625rem", cursor: "pointer" }}><X size={13} /></button>
        </div>
      ) : (
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", color: item.isAvailable ? cream : muted, fontSize: "0.9rem" }}>{item.name}</span>
            {item.isFeatured && <Star size={12} style={{ fill: gold, color: gold }} />}
            {!item.isAvailable && <span style={{ fontFamily: "monospace", fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase", background: `${flame}20`, color: flame, borderRadius: "3rem", padding: "0.15rem 0.5rem" }}>Sold Out</span>}
          </div>
          {item.description && <p style={{ color: muted, fontSize: "0.75rem", margin: "0 0 0.3rem", fontFamily: "'Lora', serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.description}</p>}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <span style={{ fontFamily: "monospace", fontSize: "0.85rem", color: gold, fontWeight: 700 }}>Rs. {Number(item.price).toFixed(0)}</span>
            {item.dietaryTags?.map((t: string) => (
              <span key={t} style={{ fontFamily: "monospace", fontSize: "0.55rem", letterSpacing: "0.06em", textTransform: "capitalize", background: "rgba(74,210,149,0.1)", color: "#4ad295", borderRadius: "3rem", padding: "0.15rem 0.45rem" }}>{t}</span>
            ))}
          </div>
        </div>
      )}

      {!editing && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", flexShrink: 0 }}>
          <button onClick={() => toggleMutation.mutate()} title={item.isAvailable ? "Mark sold out" : "Mark available"}
            style={{ background: "none", border: "none", cursor: "pointer", color: item.isAvailable ? "#4ad295" : muted, padding: "0.25rem" }}>
            {toggleMutation.isPending ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : item.isAvailable ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
          </button>
          <button onClick={() => setEditing(true)} style={{ background: "none", border: "none", cursor: "pointer", color: muted, padding: "0.25rem" }} title="Edit"><Pencil size={14} /></button>
          <button onClick={() => { if (confirm(`Delete "${item.name}"?`)) deleteMutation.mutate(); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: muted, padding: "0.25rem" }} title="Delete">
            {deleteMutation.isPending ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Trash2 size={14} />}
          </button>
        </div>
      )}
    </div>
  );
}

function AddItemForm({ catId, restaurantId, onClose, qc }: any) {
  const [form, setForm] = useState({ name: "", description: "", price: "", dietaryTags: [] as string[], isFeatured: false });

  const mutation = useMutation({
    mutationFn: () => restaurantApi.createItem(restaurantId, {
      categoryId: catId,
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      dietaryTags: form.dietaryTags,
      isFeatured: form.isFeatured,
      isAvailable: true,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["menu", restaurantId] });
      toast.success("Item added!");
      onClose();
    },
    onError: (e: any) => toast.error(e.response?.data?.error || "Failed to add item"),
  });

  const toggleTag = (tag: string) =>
    setForm(f => ({ ...f, dietaryTags: f.dietaryTags.includes(tag) ? f.dietaryTags.filter(t => t !== tag) : [...f.dietaryTags, tag] }));

  return (
    <div style={{ margin: "0 1rem 1rem", background: elevated, borderRadius: "1rem", border: `1px solid ${gold}30`, padding: "1.25rem" }}>
      <p style={{ fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: gold, marginBottom: "1rem" }}>— New Menu Item</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: "0.75rem", marginBottom: "0.75rem" }}>
        <div>
          <label style={{ display: "block", fontFamily: "monospace", fontSize: "0.55rem", letterSpacing: "0.12em", textTransform: "uppercase", color: muted, marginBottom: "0.35rem" }}>Item Name *</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Chicken Burger"
            style={{ width: "100%", background: night, border: `1px solid ${border}`, borderRadius: "0.625rem", padding: "0.625rem 0.75rem", color: cream, fontFamily: "'Lora', serif", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }} />
        </div>
        <div>
          <label style={{ display: "block", fontFamily: "monospace", fontSize: "0.55rem", letterSpacing: "0.12em", textTransform: "uppercase", color: muted, marginBottom: "0.35rem" }}>Price (Rs.) *</label>
          <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} type="number" min="0" step="1" placeholder="350"
            style={{ width: "100%", background: night, border: `1px solid ${border}`, borderRadius: "0.625rem", padding: "0.625rem 0.75rem", color: gold, fontFamily: "monospace", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }} />
        </div>
      </div>

      <div style={{ marginBottom: "0.75rem" }}>
        <label style={{ display: "block", fontFamily: "monospace", fontSize: "0.55rem", letterSpacing: "0.12em", textTransform: "uppercase", color: muted, marginBottom: "0.35rem" }}>Description</label>
        <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What's in it…" rows={2}
          style={{ width: "100%", background: night, border: `1px solid ${border}`, borderRadius: "0.625rem", padding: "0.625rem 0.75rem", color: cream, fontFamily: "'Lora', serif", fontSize: "0.85rem", outline: "none", resize: "none", boxSizing: "border-box" }} />
      </div>

      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.75rem", alignItems: "center" }}>
        <span style={{ fontFamily: "monospace", fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase", color: muted }}>Tags:</span>
        {DIETARY.map(t => <Tag key={t} label={t} active={form.dietaryTags.includes(t)} onClick={() => toggleTag(t)} />)}
        <Tag label="⭐ Featured" active={form.isFeatured} onClick={() => setForm(f => ({ ...f, isFeatured: !f.isFeatured }))} />
      </div>

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button onClick={() => mutation.mutate()} disabled={!form.name.trim() || !form.price || mutation.isPending}
          style={{ background: gold, color: night, border: "none", borderRadius: "3rem", padding: "0.625rem 1.5rem", fontFamily: "monospace", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, cursor: "pointer", opacity: (!form.name || !form.price) ? 0.5 : 1, display: "flex", alignItems: "center", gap: "0.375rem" }}>
          {mutation.isPending ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Plus size={13} />} Add Item
        </button>
        <button onClick={onClose} style={{ background: "transparent", color: muted, border: `1px solid ${border}`, borderRadius: "3rem", padding: "0.625rem 1rem", fontFamily: "monospace", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function MenuPage() {
  const { restaurantId } = useAuthStore();
  const qc = useQueryClient();
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [showCatForm, setShowCatForm] = useState(false);
  const [addingItemTo, setAddingItemTo] = useState<string | null>(null);
  const [catName, setCatName] = useState("");

  const { data: restaurant, isLoading } = useQuery({
    queryKey: ["menu", restaurantId],
    queryFn: () => restaurantApi.get(restaurantId!).then(r => r.data.data),
    enabled: !!restaurantId,
  });

  const createCatMutation = useMutation({
    mutationFn: () => restaurantApi.createCategory(restaurantId!, { name: catName }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["menu", restaurantId] });
      setCatName(""); setShowCatForm(false);
      toast.success("Category created");
    },
    onError: (e: any) => toast.error(e.response?.data?.error || "Failed"),
  });

  const deleteCatMutation = useMutation({
    mutationFn: (id: string) => restaurantApi.deleteCategory(restaurantId!, id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["menu", restaurantId] }); toast.success("Category deleted"); },
    onError: (e: any) => toast.error(e.response?.data?.error || "Failed to delete (items exist?)"),
  });

  const categories = restaurant?.menuCategories || [];
  const totalItems = categories.reduce((n: number, c: any) => n + (c.items?.length || 0), 0);

  return (
    <div style={{ fontFamily: "'Lora', serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <span style={{ fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: gold }}>— Menu</span>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "2rem", color: cream, margin: "0.25rem 0 0.25rem" }}>
            Menu Management
          </h1>
          <p style={{ color: muted, fontSize: "0.875rem", margin: 0 }}>{categories.length} categories · {totalItems} items</p>
        </div>
        <button onClick={() => setShowCatForm(true)} style={{
          background: gold, color: night, border: "none", borderRadius: "3rem",
          padding: "0.75rem 1.5rem", fontFamily: "monospace", fontSize: "0.65rem",
          letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700,
          cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem",
        }}>
          <Plus size={14} /> Add Category
        </button>
      </div>

      {/* New Category Form */}
      {showCatForm && (
        <div style={{ background: surface, borderRadius: "1rem", border: `1px solid ${gold}40`, padding: "1.25rem", marginBottom: "1.25rem" }}>
          <p style={{ fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: gold, margin: "0 0 0.75rem" }}>— New Category</p>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <input value={catName} onChange={e => setCatName(e.target.value)}
              placeholder="e.g. Starters, Mains, Desserts…"
              onKeyDown={e => e.key === "Enter" && catName.trim() && createCatMutation.mutate()}
              style={{ flex: 1, background: elevated, border: `1px solid ${border}`, borderRadius: "0.75rem", padding: "0.75rem 1rem", color: cream, fontFamily: "'Lora', serif", fontSize: "0.875rem", outline: "none" }}
              autoFocus />
            <button onClick={() => createCatMutation.mutate()} disabled={!catName.trim() || createCatMutation.isPending}
              style={{ background: gold, color: night, border: "none", borderRadius: "3rem", padding: "0.75rem 1.5rem", fontFamily: "monospace", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, cursor: "pointer", opacity: !catName.trim() ? 0.5 : 1 }}>
              {createCatMutation.isPending ? "Creating…" : "Create"}
            </button>
            <button onClick={() => { setShowCatForm(false); setCatName(""); }}
              style={{ background: elevated, color: muted, border: `1px solid ${border}`, borderRadius: "3rem", padding: "0.75rem 1rem", fontFamily: "monospace", fontSize: "0.65rem", cursor: "pointer" }}>
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
          <Loader2 size={32} color={gold} style={{ animation: "spin 1s linear infinite" }} />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && categories.length === 0 && (
        <div style={{ background: surface, borderRadius: "1.25rem", border: `1px solid ${border}`, padding: "3rem", textAlign: "center" }}>
          <UtensilsCrossed size={40} color={muted} style={{ margin: "0 auto 1rem" }} />
          <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", color: cream, fontSize: "1.25rem", margin: "0 0 0.5rem" }}>No menu yet</p>
          <p style={{ color: muted, fontSize: "0.875rem", marginBottom: "1.5rem" }}>Start by creating a category like "Starters" or "Mains"</p>
          <button onClick={() => setShowCatForm(true)} style={{ background: gold, color: night, border: "none", borderRadius: "3rem", padding: "0.75rem 2rem", fontFamily: "monospace", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, cursor: "pointer" }}>
            + Create First Category
          </button>
        </div>
      )}

      {/* Categories */}
      {!isLoading && categories.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {categories.map((cat: any) => {
            const isOpen = expandedCat === cat.id;
            const itemCount = cat.items?.length || 0;
            return (
              <div key={cat.id} style={{ background: surface, borderRadius: "1rem", border: `1px solid ${isOpen ? gold + "40" : border}`, overflow: "hidden", transition: "border-color 0.2s" }}>
                {/* Category Header */}
                <div
                  onClick={() => setExpandedCat(isOpen ? null : cat.id)}
                  style={{ display: "flex", alignItems: "center", padding: "1rem 1.25rem", cursor: "pointer", gap: "0.75rem" }}
                >
                  <span style={{ color: isOpen ? gold : muted, transition: "color 0.2s", flexShrink: 0 }}>
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </span>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", color: cream, fontSize: "1.05rem", flex: 1 }}>{cat.name}</span>
                  <span style={{ fontFamily: "monospace", fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase", color: muted, background: elevated, borderRadius: "3rem", padding: "0.2rem 0.6rem", flexShrink: 0 }}>
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                  </span>
                  <div style={{ display: "flex", gap: "0.375rem", flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => { setAddingItemTo(addingItemTo === cat.id ? null : cat.id); setExpandedCat(cat.id); }}
                      style={{ display: "flex", alignItems: "center", gap: "0.3rem", background: `${gold}15`, color: gold, border: `1px solid ${gold}30`, borderRadius: "3rem", padding: "0.3rem 0.75rem", fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
                      <Plus size={11} /> Add Item
                    </button>
                    <button
                      onClick={() => { if (confirm(`Delete category "${cat.name}"?`)) deleteCatMutation.mutate(cat.id); }}
                      style={{ background: "none", border: "none", cursor: "pointer", color: muted, padding: "0.3rem" }} title="Delete category">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Add Item Form */}
                {addingItemTo === cat.id && (
                  <AddItemForm catId={cat.id} restaurantId={restaurantId} qc={qc}
                    onClose={() => setAddingItemTo(null)} />
                )}

                {/* Items List */}
                {isOpen && itemCount === 0 && addingItemTo !== cat.id && (
                  <div style={{ padding: "1.5rem", textAlign: "center", borderTop: `1px solid ${border}` }}>
                    <p style={{ color: muted, fontSize: "0.8rem", fontFamily: "'Lora', serif" }}>No items yet. Click "Add Item" above.</p>
                  </div>
                )}

                {isOpen && itemCount > 0 && (
                  <div style={{ borderTop: `1px solid ${border}` }}>
                    {cat.items.map((item: any) => (
                      <ItemRow key={item.id} item={item} restaurantId={restaurantId} catId={cat.id} qc={qc} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
