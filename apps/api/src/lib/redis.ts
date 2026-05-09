import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const redis = new Redis(redisUrl, {
  lazyConnect: true,
  enableOfflineQueue: false,
  retryStrategy: (times) => {
    if (times > 3) return null;
    return Math.min(times * 200, 2000);
  },
});

redis.on("error", (err) => {
  if (process.env.NODE_ENV !== "test") {
    console.warn("Redis connection error (non-fatal):", err.message);
  }
});

// ─── Rider Location ───────────────────────────────────────────────────────────

const RIDER_LOCATION_TTL = 30; // seconds

export async function setRiderLocation(
  riderId: string,
  lat: number,
  lng: number
): Promise<void> {
  try {
    await redis.setex(`rider:location:${riderId}`, RIDER_LOCATION_TTL, JSON.stringify({ lat, lng, updatedAt: new Date().toISOString() }));
  } catch {}
}

export async function getRiderLocation(
  riderId: string
): Promise<{ lat: number; lng: number; updatedAt: string } | null> {
  try {
    const data = await redis.get(`rider:location:${riderId}`);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function setRiderOnline(riderId: string): Promise<void> {
  try {
    await redis.sadd("riders:online", riderId);
  } catch {}
}

export async function setRiderOffline(riderId: string): Promise<void> {
  try {
    await redis.srem("riders:online", riderId);
    await redis.del(`rider:location:${riderId}`);
  } catch {}
}

export async function getOnlineRiders(): Promise<string[]> {
  try {
    return await redis.smembers("riders:online");
  } catch {
    return [];
  }
}

// ─── Session Cache ────────────────────────────────────────────────────────────

export async function setSession(key: string, value: unknown, ttl = 3600): Promise<void> {
  try {
    await redis.setex(`session:${key}`, ttl, JSON.stringify(value));
  } catch {}
}

export async function getSession<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(`session:${key}`);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function deleteSession(key: string): Promise<void> {
  try {
    await redis.del(`session:${key}`);
  } catch {}
}
