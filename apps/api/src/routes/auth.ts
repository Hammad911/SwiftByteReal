import { Router, Request, Response } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { generateTokens, verifyRefreshToken } from "../utils/jwt";
import { authenticate, AuthRequest } from "../middleware/auth";
import { OAuth2Client } from "google-auth-library";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../services/email";

const router = Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Hash a token for safe DB storage */
function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/** If the user has an approved Rider row, ensure `rider` is present in `roles` (fixes rider portal after approval + "log in again"). */
async function ensureRiderRoleGranted(userId: string): Promise<void> {
  const rider = await prisma.rider.findUnique({
    where: { userId },
    select: { isApproved: true },
  });
  if (!rider?.isApproved) return;
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { roles: true },
  });
  if (!u) return;
  if (!u.roles.includes("rider")) {
    await prisma.user.update({
      where: { id: userId },
      data: { roles: [...u.roles, "rider"] },
    });
  }
}

/** Store a refresh token in DB (hashed) */
async function storeRefreshToken(userId: string, rawToken: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await prisma.refreshToken.create({
    data: { tokenHash: hashToken(rawToken), userId, expiresAt },
  });
}

/** Revoke all refresh tokens for a user (for security on password change etc.) */
async function revokeAllTokens(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true },
  });
}

/** Build token payload from a user, including their entity IDs */
async function buildTokenPayload(userId: string, activeRole: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, roles: true },
  });

  const payload: Record<string, unknown> = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: activeRole,
    roles: user.roles,
  };

  if (activeRole === "restaurant") {
    const r = await prisma.restaurant.findFirst({ where: { ownerId: userId }, select: { id: true } });
    if (r) payload.restaurantId = r.id;
  }

  if (activeRole === "rider") {
    const rid = await prisma.rider.findUnique({ where: { userId }, select: { id: true } });
    if (rid) payload.riderId = rid.id;
  }

  return payload;
}

// ─── Validation schemas ───────────────────────────────────────────────────────

const registerSchema = z.object({
  name:     z.string().min(2).max(80),
  email:    z.string().email(),
  password: z.string().min(8).max(128),
  phone:    z.string().optional(),
});

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
  role:     z.string().optional(),
});

// ─── POST /auth/register ─────────────────────────────────────────────────────
router.post("/register", async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.errors[0].message, code: "VALIDATION_ERROR" });
    return;
  }
  const { name, email, password, phone } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ success: false, error: "Email already registered", code: "EMAIL_TAKEN" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const emailVerifyToken = crypto.randomBytes(32).toString("hex");
    const emailVerifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const smtpConfigured = !!process.env.SMTP_USER && process.env.SMTP_USER !== "your-email@gmail.com";

    const user = await prisma.user.create({
      data: {
        name, email, passwordHash, phone,
        role: "customer",
        roles: ["customer"],
        // Auto-verify in dev (no SMTP); require email verification in prod
        isVerified: !smtpConfigured,
        emailVerifyToken: smtpConfigured ? hashToken(emailVerifyToken) : null,
        emailVerifyExpiry: smtpConfigured ? emailVerifyExpiry : null,
      },
    });

    if (smtpConfigured) {
      // Send verification email; user must verify before logging in
      sendVerificationEmail(email, name, emailVerifyToken);
      res.status(201).json({
        success: true,
        data: { message: "Account created. Please check your email to verify.", requiresVerification: true },
      });
      return;
    }

    // No SMTP → auto-verified, return tokens immediately
    const payload = await buildTokenPayload(user.id, "customer");
    const tokens = generateTokens(payload as any);
    await storeRefreshToken(user.id, tokens.refreshToken);

    res.status(201).json({
      success: true,
      data: {
        ...tokens,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, roles: user.roles, isVerified: true },
      },
    });
  } catch {
    res.status(500).json({ success: false, error: "Registration failed", code: "SERVER_ERROR" });
  }
});

// ─── GET /auth/verify-email ──────────────────────────────────────────────────
router.get("/verify-email", async (req: Request, res: Response) => {
  const { token } = req.query as { token?: string };
  if (!token) {
    res.status(400).json({ success: false, error: "Token required", code: "TOKEN_REQUIRED" });
    return;
  }

  try {
    const tokenHash = hashToken(token);
    const user = await prisma.user.findFirst({
      where: { emailVerifyToken: tokenHash, emailVerifyExpiry: { gte: new Date() } },
    });

    if (!user) {
      res.status(400).json({ success: false, error: "Invalid or expired token", code: "TOKEN_INVALID" });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, emailVerifyToken: null, emailVerifyExpiry: null },
    });

    const payload = await buildTokenPayload(user.id, user.role);
    const tokens = generateTokens(payload as any);
    await storeRefreshToken(user.id, tokens.refreshToken);

    res.json({ success: true, data: { message: "Email verified!", ...tokens, user: { id: user.id, name: user.name, email: user.email, role: user.role, roles: user.roles } } });
  } catch {
    res.status(500).json({ success: false, error: "Verification failed", code: "SERVER_ERROR" });
  }
});

// ─── POST /auth/login ────────────────────────────────────────────────────────
router.post("/login", async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.errors[0].message, code: "VALIDATION_ERROR" });
    return;
  }
  const { email, password, role } = parsed.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      res.status(401).json({ success: false, error: "Invalid credentials", code: "INVALID_CREDENTIALS" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ success: false, error: "Invalid credentials", code: "INVALID_CREDENTIALS" });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ success: false, error: "Account suspended. Contact support.", code: "ACCOUNT_SUSPENDED" });
      return;
    }

    if (!user.isVerified) {
      res.status(403).json({ success: false, error: "Please verify your email before logging in.", code: "EMAIL_NOT_VERIFIED" });
      return;
    }

    await ensureRiderRoleGranted(user.id);
    let dbUser = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      select: { id: true, name: true, email: true, role: true, roles: true, avatar: true, isVerified: true },
    });

    // Determine active role — requested role must be in user's roles array
    let activeRole = role || dbUser.role;
    if (!dbUser.roles.includes(activeRole)) {
      activeRole = dbUser.role; // fall back to primary
    }

    await prisma.user.update({ where: { id: user.id }, data: { role: activeRole as any } });
    dbUser = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      select: { id: true, name: true, email: true, role: true, roles: true, avatar: true, isVerified: true },
    });

    const payload = await buildTokenPayload(user.id, activeRole);
    const tokens = generateTokens(payload as any);
    await storeRefreshToken(user.id, tokens.refreshToken);

    res.json({
      success: true,
      data: {
        ...tokens,
        user: {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          role: activeRole,
          roles: dbUser.roles,
          avatar: dbUser.avatar,
          isVerified: dbUser.isVerified,
        },
      },
    });
  } catch {
    res.status(500).json({ success: false, error: "Login failed", code: "SERVER_ERROR" });
  }
});

// ─── POST /auth/logout ───────────────────────────────────────────────────────
router.post("/logout", authenticate, async (req: AuthRequest, res: Response) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await prisma.refreshToken.updateMany({
      where: { tokenHash: hashToken(refreshToken), userId: req.user!.id },
      data: { revoked: true },
    });
  }
  res.json({ success: true, data: { message: "Logged out" } });
});

// ─── POST /auth/refresh ──────────────────────────────────────────────────────
router.post("/refresh", async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(400).json({ success: false, error: "Refresh token required", code: "TOKEN_REQUIRED" });
    return;
  }

  try {
    const tokenHash = hashToken(refreshToken);
    const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });

    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      res.status(401).json({ success: false, error: "Invalid or expired refresh token", code: "TOKEN_INVALID" });
      return;
    }

    await ensureRiderRoleGranted(stored.userId);
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: stored.userId },
      select: { id: true, email: true, name: true, role: true, roles: true },
    });

    // Rotate: revoke old, issue new
    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });

    const payload = await buildTokenPayload(user.id, user.role);
    const tokens = generateTokens(payload as any);
    await storeRefreshToken(user.id, tokens.refreshToken);

    res.json({ success: true, data: tokens });
  } catch {
    res.status(500).json({ success: false, error: "Token refresh failed", code: "SERVER_ERROR" });
  }
});

// ─── POST /auth/forgot-password ──────────────────────────────────────────────
router.post("/forgot-password", async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ success: false, error: "Email required", code: "VALIDATION_ERROR" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    // Always return success to prevent email enumeration
    if (user && user.passwordHash) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: hashToken(rawToken),
          passwordResetExpiry: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
      });
      sendPasswordResetEmail(email, user.name, rawToken);
    }
    res.json({ success: true, data: { message: "If that email exists, a reset link has been sent." } });
  } catch {
    res.status(500).json({ success: false, error: "Failed to process request", code: "SERVER_ERROR" });
  }
});

// ─── POST /auth/reset-password ───────────────────────────────────────────────
router.post("/reset-password", async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword || newPassword.length < 8) {
    res.status(400).json({ success: false, error: "Valid token and password (8+ chars) required", code: "VALIDATION_ERROR" });
    return;
  }

  try {
    const user = await prisma.user.findFirst({
      where: { passwordResetToken: hashToken(token), passwordResetExpiry: { gte: new Date() } },
    });

    if (!user) {
      res.status(400).json({ success: false, error: "Invalid or expired reset token", code: "TOKEN_INVALID" });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, passwordResetToken: null, passwordResetExpiry: null },
    });
    await revokeAllTokens(user.id);

    res.json({ success: true, data: { message: "Password reset successfully. Please log in." } });
  } catch {
    res.status(500).json({ success: false, error: "Failed to reset password", code: "SERVER_ERROR" });
  }
});

// ─── POST /auth/switch-role ──────────────────────────────────────────────────
router.post("/switch-role", authenticate, async (req: AuthRequest, res: Response) => {
  const { role } = req.body;
  if (!role) {
    res.status(400).json({ success: false, error: "Role required", code: "VALIDATION_ERROR" });
    return;
  }

  try {
    await ensureRiderRoleGranted(req.user!.id);
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } });

    if (!user.roles.includes(role)) {
      res.status(403).json({ success: false, error: `You don't have the ${role} role`, code: "ROLE_NOT_GRANTED" });
      return;
    }

    // Update active role
    await prisma.user.update({ where: { id: user.id }, data: { role: role as any } });

    const payload = await buildTokenPayload(user.id, role);
    const tokens = generateTokens(payload as any);
    await storeRefreshToken(user.id, tokens.refreshToken);

    res.json({
      success: true,
      data: {
        ...tokens,
        activeRole: role,
        user: { id: user.id, name: user.name, email: user.email, role, roles: user.roles },
      },
    });
  } catch {
    res.status(500).json({ success: false, error: "Role switch failed", code: "SERVER_ERROR" });
  }
});

// ─── POST /auth/google ───────────────────────────────────────────────────────
router.post("/google", async (req: Request, res: Response) => {
  const { idToken } = req.body;
  if (!idToken) {
    res.status(400).json({ success: false, error: "idToken required", code: "VALIDATION_ERROR" });
    return;
  }

  try {
    const ticket = await googleClient.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
    const gp = ticket.getPayload();
    if (!gp?.email) {
      res.status(400).json({ success: false, error: "Invalid Google token", code: "TOKEN_INVALID" });
      return;
    }

    const { email, name, picture, sub: googleId } = gp;
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: name || email.split("@")[0],
          email, avatar: picture, googleId,
          role: "customer", roles: ["customer"],
          isVerified: true, passwordHash: "",
        },
      });
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId, avatar: picture ?? user.avatar, isVerified: true },
      });
    }

    if (!user.isActive) {
      res.status(403).json({ success: false, error: "Account suspended", code: "ACCOUNT_SUSPENDED" });
      return;
    }

    const payload = await buildTokenPayload(user.id, user.role);
    const tokens = generateTokens(payload as any);
    await storeRefreshToken(user.id, tokens.refreshToken);

    res.json({
      success: true,
      data: {
        ...tokens,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, roles: user.roles, avatar: user.avatar, isVerified: user.isVerified },
      },
    });
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(500).json({ success: false, error: "Google authentication failed", code: "SERVER_ERROR" });
  }
});

// ─── GET /auth/me ────────────────────────────────────────────────────────────
router.get("/me", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, name: true, email: true, role: true, roles: true, phone: true, avatar: true, isVerified: true, createdAt: true, addresses: true },
    });
    if (!user) { res.status(404).json({ success: false, error: "User not found", code: "NOT_FOUND" }); return; }

    const points = await prisma.loyaltyPoint.aggregate({ where: { userId: user.id }, _sum: { points: true } });
    res.json({ success: true, data: { ...user, loyaltyBalance: points._sum.points || 0 } });
  } catch {
    res.status(500).json({ success: false, error: "Failed to fetch user", code: "SERVER_ERROR" });
  }
});

// ─── PATCH /auth/profile ─────────────────────────────────────────────────────
router.patch("/profile", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { name, phone, avatar },
      select: { id: true, name: true, email: true, role: true, roles: true, phone: true, avatar: true },
    });
    res.json({ success: true, data: user });
  } catch {
    res.status(500).json({ success: false, error: "Failed to update profile", code: "SERVER_ERROR" });
  }
});

// ─── POST /auth/change-password ──────────────────────────────────────────────
router.post("/change-password", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      res.status(400).json({ success: false, error: "New password must be at least 8 characters", code: "VALIDATION_ERROR" });
      return;
    }
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user?.passwordHash) {
      res.status(400).json({ success: false, error: "Cannot change password for OAuth accounts", code: "OAUTH_ACCOUNT" });
      return;
    }
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      res.status(401).json({ success: false, error: "Current password is incorrect", code: "INVALID_CREDENTIALS" });
      return;
    }
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    await revokeAllTokens(user.id);
    res.json({ success: true, data: { message: "Password changed. Please log in again." } });
  } catch {
    res.status(500).json({ success: false, error: "Failed to change password", code: "SERVER_ERROR" });
  }
});

export default router;
