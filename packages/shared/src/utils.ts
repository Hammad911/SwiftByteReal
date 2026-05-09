// ─── Haversine Distance Formula ──────────────────────────────────────────────

export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// ─── Currency Formatting ──────────────────────────────────────────────────────

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

// ─── Date Formatting ──────────────────────────────────────────────────────────

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function timeAgo(date: string | Date): string {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

// ─── Order Utils ──────────────────────────────────────────────────────────────

export function calculateOrderTotal(
  subtotal: number,
  deliveryFee: number,
  discount: number
): number {
  return Math.max(0, subtotal + deliveryFee - discount);
}

export function calculateLoyaltyPoints(total: number): number {
  return Math.floor(total); // 1 point per $1
}

export function pointsToDiscount(points: number): number {
  return points * 0.01; // 100 points = $1
}

// ─── Validation Utils ─────────────────────────────────────────────────────────

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  return /^\+?[\d\s\-()]{10,15}$/.test(phone);
}

// ─── String Utils ─────────────────────────────────────────────────────────────

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

// ─── Order Status Utils ───────────────────────────────────────────────────────

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Order Placed",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready for Pickup",
  picked_up: "Picked Up",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: "yellow",
  confirmed: "blue",
  preparing: "orange",
  ready: "purple",
  picked_up: "indigo",
  delivered: "green",
  cancelled: "red",
};

export function getNextOrderStatus(current: string): string | null {
  const flow = ["pending", "confirmed", "preparing", "ready", "picked_up", "delivered"];
  const idx = flow.indexOf(current);
  if (idx === -1 || idx === flow.length - 1) return null;
  return flow[idx + 1];
}

// ─── Dietary Tag Colors ───────────────────────────────────────────────────────

export const DIETARY_TAG_COLORS: Record<string, { bg: string; text: string }> = {
  vegan: { bg: "bg-green-100", text: "text-green-700" },
  vegetarian: { bg: "bg-lime-100", text: "text-lime-700" },
  halal: { bg: "bg-emerald-100", text: "text-emerald-700" },
  "gluten-free": { bg: "bg-yellow-100", text: "text-yellow-700" },
  spicy: { bg: "bg-red-100", text: "text-red-700" },
  "nut-free": { bg: "bg-orange-100", text: "text-orange-700" },
};

// ─── Cuisine Categories ───────────────────────────────────────────────────────

export const CUISINE_CATEGORIES = [
  { name: "Burgers", icon: "🍔", slug: "burgers" },
  { name: "Pizza", icon: "🍕", slug: "pizza" },
  { name: "Sushi", icon: "🍱", slug: "sushi" },
  { name: "Chinese", icon: "🥡", slug: "chinese" },
  { name: "Indian", icon: "🍛", slug: "indian" },
  { name: "Mexican", icon: "🌮", slug: "mexican" },
  { name: "Thai", icon: "🍜", slug: "thai" },
  { name: "Italian", icon: "🍝", slug: "italian" },
  { name: "Desserts", icon: "🧁", slug: "desserts" },
  { name: "Healthy", icon: "🥗", slug: "healthy" },
  { name: "Breakfast", icon: "🍳", slug: "breakfast" },
  { name: "Chicken", icon: "🍗", slug: "chicken" },
];
