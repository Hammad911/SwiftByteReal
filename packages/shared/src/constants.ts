export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

export const LOYALTY_POINTS_PER_DOLLAR = 1;
export const LOYALTY_POINTS_TO_DOLLAR = 100; // 100 points = $1

export const RIDER_SEARCH_RADIUS_KM = 5;
export const RIDER_LOCATION_PING_INTERVAL_MS = 10000; // 10 seconds

export const ORDER_AUTO_DECLINE_TIMEOUT_MS = 30000; // 30 seconds

export const MAX_GROUP_ORDER_MEMBERS = 10;

export const PLATFORM_COMMISSION_RATE = 0.15; // 15%

export const DELIVERY_BASE_FEE = 2.99;
export const DELIVERY_PER_KM_FEE = 0.5;
export const MAX_DELIVERY_RADIUS_KM = 20;

export const PAGINATION_LIMIT = 20;

export const JWT_ACCESS_EXPIRY = "15m";
export const JWT_REFRESH_EXPIRY = "7d";

export const DIETARY_TAGS = [
  "vegan",
  "vegetarian",
  "halal",
  "gluten-free",
  "spicy",
  "nut-free",
  "dairy-free",
];

export const VEHICLE_TYPES = ["bicycle", "motorcycle", "car", "scooter"];

export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP"];

export const IMAGE_MAX_SIZE_MB = 5;
export const IMAGE_ALLOWED_FORMATS = ["jpg", "jpeg", "png", "webp"];
