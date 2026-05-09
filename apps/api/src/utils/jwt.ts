import jwt from "jsonwebtoken";
import crypto from "crypto";

/** Single source of truth for access-token signing/verification (must match middleware + socket) */
export const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "dev-access-secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "dev-refresh-secret";
const ACCESS_EXPIRY = "15m";

interface TokenPayload {
  id: string;
  email: string;
  role: string;
  name: string;
  [key: string]: unknown;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY });
}

/** Refresh tokens are opaque UUIDs, not JWTs — stored hashed in DB */
export function generateRawRefreshToken(): string {
  return crypto.randomUUID();
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
}

/** @deprecated Only for backward compatibility */
export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
}

export function generateTokens(payload: TokenPayload): {
  accessToken: string;
  refreshToken: string;
} {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRawRefreshToken(),
  };
}
