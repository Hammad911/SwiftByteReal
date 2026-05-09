# 🚀 SwiftByte — Full-Stack Food Delivery Platform

A production-ready Foodpanda/DoorDash clone built as a **Turborepo monorepo** with four separate portals, a shared backend API, real-time features, and a complete database with seed data.

---

## 📁 Project Structure

```
swiftbyte/
├── apps/
│   ├── customer/        # Customer ordering app        (Next.js 14, port 3000)
│   ├── restaurant/      # Restaurant dashboard         (Next.js 14, port 3001)
│   ├── rider/           # Rider delivery app           (Next.js 14, port 3002)
│   ├── admin/           # Admin panel                  (Next.js 14, port 3003)
│   └── api/             # Backend API                  (Express + Prisma, port 4000)
├── packages/
│   ├── shared/          # Shared types, utils, constants
│   └── ui/              # Shared UI utilities (cn helper)
├── docker-compose.yml
├── turbo.json
└── package.json
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| State | Zustand (client state), TanStack Query (server state) |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Cache | Redis (rider locations, sessions) |
| Real-time | Socket.io |
| Auth | JWT (access + refresh tokens), bcrypt |
| Payments | Stripe |
| Images | Cloudinary |
| Maps | Google Maps JavaScript API |
| Push Notifications | Firebase Cloud Messaging |
| SMS/Calls | Twilio |
| Charts | Recharts |
| Monorepo | Turborepo |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- npm 9+

### 1. Clone & Install

```bash
git clone <repo-url>
cd swiftbyte
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example apps/api/.env

# Edit with your credentials
nano apps/api/.env
```

### 3. Database Setup

```bash
# Push schema to PostgreSQL
npm run db:push

# Seed with mock data (10 restaurants, 20 customers, 5 riders)
npm run db:seed
```

### 4. Start Development Servers

```bash
# Start all apps simultaneously
npm run dev

# Or start individually:
cd apps/api && npm run dev       # API on :4000
cd apps/customer && npm run dev  # Customer on :3000
cd apps/restaurant && npm run dev # Restaurant on :3001
cd apps/rider && npm run dev     # Rider on :3002
cd apps/admin && npm run dev     # Admin on :3003
```

---

## 🐳 Docker Development

```bash
# Start everything with Docker Compose
docker-compose up -d

# Run database migration + seed
docker-compose exec api npm run db:push
docker-compose exec api npm run db:seed
```

---

## 🔐 Demo Login Credentials

All accounts use password: **`Password123!`**

| Role | Email | Portal |
|------|-------|--------|
| Admin | admin@swiftbyte.com | localhost:3003 |
| Customer | alice@example.com | localhost:3000 |
| Restaurant | owner1@swiftbyte.com | localhost:3001 |
| Rider | marcus@rider.com | localhost:3002 |

### Promo Codes
| Code | Discount |
|------|---------|
| `WELCOME20` | 20% off (min $15) |
| `FLAT5OFF` | $5 off (min $25) |
| `FREESHIP` | Free delivery (min $20) |

---

## 📱 App Features

### Customer App (`/apps/customer`)
- ✅ JWT authentication + Google OAuth
- ✅ Hero search with restaurant/cuisine discovery
- ✅ Filter sidebar: cuisine, rating, dietary, delivery time
- ✅ Restaurant cards with rating, delivery time, fee
- ✅ Promotional carousel (auto-scrolling banners)
- ✅ Restaurant page with categorized menu
- ✅ Item customisation modal (size, extras, instructions)
- ✅ Floating cart drawer with quantity management
- ✅ Checkout with address selector, payment method, voucher
- ✅ Scheduled delivery toggle
- ✅ Live order tracking with status stepper
- ✅ Real-time rider location via Socket.io
- ✅ Post-order rating (restaurant + rider, 1-5 stars)
- ✅ Loyalty points balance & earning
- ✅ Order history
- ✅ Profile management

### Restaurant Dashboard (`/apps/restaurant`)
- ✅ Secure login with JWT
- ✅ Store open/closed toggle
- ✅ Incoming orders with sound alerts
- ✅ Accept/reject orders with real-time Socket.io
- ✅ Status flow: Accept → Preparing → Ready
- ✅ Menu category & item CRUD
- ✅ Item availability toggle (sold out/available)
- ✅ Revenue & orders analytics with Recharts
- ✅ Top selling items list
- ✅ Order history table

### Rider App (`/apps/rider`)
- ✅ Rider login with approval check
- ✅ Online/Offline toggle
- ✅ Real-time location broadcasting every 10s
- ✅ Active delivery flow: Navigate → Pick Up → Deliver
- ✅ Today's earnings card
- ✅ Weekly/monthly earnings breakdown
- ✅ Delivery history
- ✅ Payout request
- ✅ Peak hours bonus indicator

### Admin Panel (`/apps/admin`)
- ✅ Platform analytics (GMV, users, orders, revenue)
- ✅ Approve/suspend restaurants
- ✅ Approve/suspend riders
- ✅ Commission rate configuration per restaurant
- ✅ All-orders management with status filters
- ✅ Voucher/promo code management (create, deactivate)
- ✅ User management

---

## 🗄 Database Schema

The Prisma schema includes 18 models:

```
User, Address, Restaurant, OperatingHours, MenuCategory, MenuItem,
ModifierGroup, ModifierOption, Order, OrderItem, Voucher, Delivery,
Rider, Rating, Notification, ChatMessage, RiderEarning, Payout,
LoyaltyPoint, Promotion
```

---

## 🔌 API Endpoints

### Auth
- `POST /auth/register` — Create account
- `POST /auth/login` — Sign in, returns JWT tokens
- `POST /auth/refresh` — Refresh access token
- `GET /auth/me` — Get current user profile
- `PATCH /auth/profile` — Update profile

### Restaurants
- `GET /restaurants` — Search with filters (lat, lng, cuisine, rating, delivery time)
- `GET /restaurants/:id` — Full restaurant detail with menu
- `PATCH /restaurants/:id` — Update restaurant (owner)
- `GET /restaurants/:id/analytics` — Revenue & order analytics

### Orders
- `POST /orders` — Create order (auto loyalty points, voucher validation)
- `GET /orders` — List orders (role-based: customer/restaurant/rider)
- `GET /orders/:id` — Order detail
- `PATCH /orders/:id/status` — Update status + Socket.io emit
- `GET /orders/:id/tracking` — Live rider location from Redis
- `POST /orders/:id/rate` — Rate restaurant + rider

### Riders
- `GET /riders/nearby` — Find available riders within radius (Haversine)
- `POST /riders/location` — Broadcast rider location (stored in Redis)
- `PATCH /riders/availability` — Toggle online/offline
- `GET /riders/me` — Rider profile + earnings
- `POST /riders/payout` — Request withdrawal

### Payments
- `POST /payments/intent` — Create Stripe payment intent
- `POST /payments/webhook` — Stripe webhook handler

### Vouchers
- `POST /vouchers/validate` — Validate code + return discount amount

### Admin
- `GET /admin/analytics` — Platform-wide metrics
- `GET /admin/users` — User management
- `PATCH /admin/users/:id/suspend` — Suspend/activate user
- `GET /admin/restaurants` — Restaurant management
- `PATCH /admin/restaurants/:id/approve` — Approve/suspend restaurant
- `PATCH /admin/restaurants/:id/commission` — Set commission rate
- `GET /admin/riders` — Rider management
- `PATCH /admin/riders/:id/approve` — Approve/suspend rider

---

## ⚡ Socket.io Events

**Rooms:**
- `order:{orderId}` — joined by customer, restaurant, rider, admin
- `restaurant:{restaurantId}` — for restaurant new order alerts
- `rider:{userId}` — for rider order assignment alerts

**Events:**
- `order_status_changed` — Order status update
- `rider_location_update` — Live rider GPS coordinates
- `new_chat_message` — Support chat message
- `new_order_incoming` — Restaurant new order notification
- `order_assigned` — Rider assignment notification

---

## 🌱 Seed Data

The seed script creates:
- **1 admin** account
- **20 customers** with home addresses
- **10 restaurants** with full menus (50+ items total):
  - Burger Republic, Pizza Palazzo, Sushi Sakura, Spice Garden
  - Dragon Palace, Taco Fiesta, Green Bowl, The Breakfast Club
  - Thai Orchid, Sweet Temptations
- **5 riders** with different vehicle types
- **3 voucher codes**: WELCOME20, FLAT5OFF, FREESHIP
- **5 completed sample orders** with loyalty points
- **5 restaurant promotions**

---

## 🚢 Deployment

### Frontend (Vercel)
```bash
# Deploy each app to Vercel
cd apps/customer && vercel --prod
cd apps/restaurant && vercel --prod
cd apps/rider && vercel --prod
cd apps/admin && vercel --prod
```

### Backend (Railway / Render)
```bash
# Push to Railway
railway up --service api

# Set environment variables in Railway dashboard
```

---

## 📜 Environment Variables

See `.env.example` for all required variables:
- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — Token secrets
- `STRIPE_SECRET_KEY` — Stripe payments
- `CLOUDINARY_*` — Image uploads
- `GOOGLE_MAPS_API_KEY` — Maps & directions
- `TWILIO_*` — SMS/masked calls
- `FIREBASE_*` — Push notifications

---

Built with ❤️ by SwiftByte
