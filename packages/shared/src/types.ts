// ─── Enums ───────────────────────────────────────────────────────────────────

export type UserRole = "customer" | "restaurant" | "rider" | "admin";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "picked_up"
  | "delivered"
  | "cancelled";

export type DeliveryMode = "platform" | "self" | "pickup";

export type VoucherType = "percentage" | "flat";

export type TargetType = "restaurant" | "rider";

export type LoyaltyPointType = "earned" | "redeemed";

export type PayoutStatus = "pending" | "processing" | "paid" | "failed";

export type NotificationType =
  | "order_placed"
  | "order_confirmed"
  | "order_preparing"
  | "order_ready"
  | "order_picked_up"
  | "order_delivered"
  | "order_cancelled"
  | "promo"
  | "system";

// ─── Core Models ─────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  lat: number;
  lng: number;
  fullAddress: string;
}

export interface Restaurant {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  logo?: string;
  banner?: string;
  cuisineTypes: string[];
  isOpen: boolean;
  deliveryMode: DeliveryMode;
  minOrder: number;
  prepTime: number;
  commissionRate: number;
  deliveryFee: number;
  rating: number;
  totalRatings: number;
  address: string;
  lat: number;
  lng: number;
  operatingHours: OperatingHours[];
  isApproved: boolean;
  createdAt: string;
}

export interface OperatingHours {
  day: number; // 0 = Sunday, 6 = Saturday
  open: string; // HH:MM
  close: string; // HH:MM
  isClosed: boolean;
}

export interface MenuCategory {
  id: string;
  restaurantId: string;
  name: string;
  sortOrder: number;
  items?: MenuItem[];
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  photo?: string;
  price: number;
  isAvailable: boolean;
  dietaryTags: string[];
  isFeatured: boolean;
  modifierGroups?: ModifierGroup[];
}

export interface ModifierGroup {
  id: string;
  menuItemId: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  options: ModifierOption[];
}

export interface ModifierOption {
  id: string;
  groupId: string;
  name: string;
  extraCost: number;
}

export interface CartItem {
  menuItemId: string;
  menuItem: MenuItem;
  quantity: number;
  customisations: SelectedModifier[];
  specialInstructions?: string;
  itemTotal: number;
}

export interface SelectedModifier {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  extraCost: number;
}

export interface Order {
  id: string;
  customerId: string;
  customer?: User;
  restaurantId: string;
  restaurant?: Restaurant;
  riderId?: string;
  rider?: User;
  status: OrderStatus;
  items: OrderItemData[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  scheduledFor?: string;
  voucherCode?: string;
  paymentMethod: "card" | "cash";
  paymentIntentId?: string;
  isPaid: boolean;
  deliveryAddress: Address;
  customerNote?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemData {
  id: string;
  orderId: string;
  menuItemId: string;
  name: string;
  photo?: string;
  quantity: number;
  customisations: SelectedModifier[];
  price: number;
  specialInstructions?: string;
}

export interface Voucher {
  id: string;
  code: string;
  type: VoucherType;
  value: number;
  minOrder: number;
  validFrom: string;
  validTo: string;
  usageLimit: number;
  usedCount: number;
  restaurantId?: string;
  isActive: boolean;
}

export interface Delivery {
  id: string;
  orderId: string;
  riderId: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  proofPhoto?: string;
}

export interface Rating {
  id: string;
  orderId: string;
  raterId: string;
  targetId: string;
  targetType: TargetType;
  score: number;
  comment?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  orderId?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  orderId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  createdAt: string;
}

export interface RiderEarning {
  id: string;
  riderId: string;
  orderId: string;
  baseAmount: number;
  bonusAmount: number;
  total: number;
  settledAt?: string;
  createdAt: string;
}

export interface Payout {
  id: string;
  riderId: string;
  amount: number;
  status: PayoutStatus;
  requestedAt: string;
  paidAt?: string;
}

export interface LoyaltyPoint {
  id: string;
  userId: string;
  orderId?: string;
  points: number;
  type: LoyaltyPointType;
  createdAt: string;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Auth Types ───────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: UserRole;
}

// ─── Socket.io Event Types ────────────────────────────────────────────────────

export interface SocketEvents {
  order_status_changed: { orderId: string; status: OrderStatus; updatedAt: string };
  rider_location_update: { orderId: string; riderId: string; lat: number; lng: number };
  new_chat_message: ChatMessage;
  new_order_incoming: Order;
  order_assigned: { orderId: string; riderId: string };
  rider_accepted: { orderId: string; riderId: string };
  rider_declined: { orderId: string; riderId: string };
}

// ─── Filter / Query Types ─────────────────────────────────────────────────────

export interface RestaurantFilters {
  lat?: number;
  lng?: number;
  cuisine?: string;
  minRating?: number;
  maxDeliveryTime?: number;
  maxDeliveryFee?: number;
  dietary?: string[];
  search?: string;
  page?: number;
  limit?: number;
}

// ─── Analytics Types ──────────────────────────────────────────────────────────

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopItem {
  menuItemId: string;
  name: string;
  photo?: string;
  totalOrders: number;
  totalRevenue: number;
}

export interface PlatformAnalytics {
  gmv: number;
  totalOrders: number;
  activeUsers: number;
  activeRestaurants: number;
  activeRiders: number;
  ordersToday: number;
  revenueToday: number;
}
