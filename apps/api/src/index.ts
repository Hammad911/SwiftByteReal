import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import { initSocket } from "./socket/io";
import { errorHandler, notFound } from "./middleware/errorHandler";

import { authenticate } from "./middleware/auth";
import authRouter from "./routes/auth";
import restaurantsRouter, { handleRestaurantMineReviews } from "./routes/restaurants";
import ordersRouter from "./routes/orders";
import ridersRouter from "./routes/riders";
import paymentsRouter from "./routes/payments";
import vouchersRouter from "./routes/vouchers";
import notificationsRouter from "./routes/notifications";
import addressesRouter from "./routes/addresses";
import adminRouter from "./routes/admin";
import uploadRouter from "./routes/upload";
import applicationsRouter from "./routes/applications";

const app = express();
const httpServer = http.createServer(app);

// Railway sits behind a proxy, so Express must trust forwarded headers for IP-based middleware.
app.set("trust proxy", 1);

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:3000",
  process.env.RESTAURANT_URL || "http://localhost:3001",
  process.env.RIDER_URL || "http://localhost:3002",
  process.env.ADMIN_URL || "http://localhost:3003",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ─── Security & Parsing ───────────────────────────────────────────────────────
app.use(helmet());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === "development" ? "dev" : "combined"));
app.use(cookieParser());

// Stripe webhook needs raw body
app.use("/payments/webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, error: "Too many requests", code: "RATE_LIMITED" },
  standardHeaders: true,
  legacyHeaders: false,
});

const isDev = process.env.NODE_ENV !== "production";

const authLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 100 : 5,
  message: { success: false, error: "Too many login attempts. Try again in 15 minutes.", code: "RATE_LIMITED" },
  keyGenerator: (req) => req.ip + req.body?.email,
  skip: () => isDev,
});

const authRegisterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDev ? 100 : 3,
  message: { success: false, error: "Too many registration attempts. Try again in 1 hour.", code: "RATE_LIMITED" },
  skip: () => isDev,
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDev ? 100 : 3,
  message: { success: false, error: "Too many requests. Try again in 1 hour.", code: "RATE_LIMITED" },
  keyGenerator: (req) => req.ip + req.body?.email,
  skip: () => isDev,
});

app.use(globalLimiter);
app.use("/auth/login", authLoginLimiter);
app.use("/auth/register", authRegisterLimiter);
app.use("/auth/forgot-password", forgotPasswordLimiter);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), version: "1.0.0" });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/auth", authRouter);
// Explicit path so GET /restaurants/mine/reviews always matches (nested route was 404ing in some runs)
app.get("/restaurants/mine/reviews", authenticate, handleRestaurantMineReviews);
app.use("/restaurants", restaurantsRouter);
app.use("/orders", ordersRouter);
app.use("/riders", ridersRouter);
app.use("/payments", paymentsRouter);
app.use("/vouchers", vouchersRouter);
app.use("/notifications", notificationsRouter);
app.use("/addresses", addressesRouter);
app.use("/admin", adminRouter);
app.use("/upload", uploadRouter);
app.use("/applications", applicationsRouter);

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Socket.io ────────────────────────────────────────────────────────────────
initSocket(httpServer);

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || "4000");
httpServer.listen(PORT, () => {
  console.log(`\n🚀 SwiftByte API running on http://localhost:${PORT}`);
  console.log(`📡 Socket.io ready`);
  console.log(`🗄️  Database: ${process.env.DATABASE_URL?.split("@")[1] || "connected"}\n`);
});

export default app;
