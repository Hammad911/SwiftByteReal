# SwiftByte - Quick Reference Guide

## 🎯 Quick Overview

**SwiftByte** = Full-stack food delivery platform (Uber Eats clone) with 4 portals + backend API

### Tech Stack at a Glance
```
Frontend:    Next.js 14 + TypeScript + Tailwind CSS
State:       Zustand (client) + TanStack Query (server)
Backend:     Express.js + TypeScript
Database:    PostgreSQL + Prisma ORM
Cache:       Redis
Real-time:   Socket.io
Payments:    Stripe
Monorepo:    Turborepo
Containers:  Docker Compose
```

---

## 🚀 Getting Started (5 Minutes)

```bash
# 1. Install dependencies
npm install

# 2. Start database & cache (Docker)
docker-compose up postgres redis

# 3. Setup database
npm run db:push
npm run db:seed

# 4. Start development
npm run dev

# Access:
# Customer:   http://localhost:3000
# Restaurant: http://localhost:3001
# Rider:      http://localhost:3002
# Admin:      http://localhost:3003
# API:        http://localhost:4000
# API Docs:   http://localhost:4000/health
```

---

## 📊 Data Model

### Core Entities

```
User
├── roles: ["customer", "restaurant", "rider", "admin"]
├── authentication: passwordHash, googleId, refreshTokens
└── relationships: addresses, orders, ratings, notifications

Restaurant (owned by User with "restaurant" role)
├── profile: name, logo, banner, cuisineTypes
├── operations: operatingHours, deliveryMode, minOrder
├── metrics: rating, totalRatings, commissionRate
└── children: MenuCategories, MenuItems

Order
├── status: pending → confirmed → preparing → ready → picked_up → delivered
├── relationships: customer, restaurant, rider, payment
├── tracking: coordinates, delivery timestamps
└── financial: total, items, delivery fee, taxes

Rider (specialization of User)
├── vehicle: type (bike, bicycle, car)
├── location: lat, lng (updated real-time via Redis)
├── earnings: riderEarnings, payouts
└── ratings: received from customers

Payment
├── method: stripe, cash on delivery
├── status: pending, processing, completed, failed
└── payout: to restaurant owner
```

---

## 🔑 Key Features

### 1. **Multi-Portal Architecture**
- **Customer App**: Browse restaurants, order food, track delivery
- **Restaurant Dashboard**: Manage menu, accept/prepare orders
- **Rider App**: Accept deliveries, real-time GPS tracking
- **Admin Panel**: Manage users, restaurants, riders, analytics

### 2. **Real-time Updates (Socket.io)**
- Customer sees order status in real-time
- Restaurant gets instant new order notifications
- Rider receives live order assignments
- GPS location updates every 10 seconds

### 3. **Authentication**
- JWT tokens (Access: 15 min, Refresh: 7 days)
- Google OAuth2 integration
- Role-based access control (RBAC)
- Secure refresh token rotation

### 4. **Payment Processing**
- Stripe integration for card payments
- Cash on delivery option
- Automatic payout to restaurant owners
- Transaction history tracking

### 5. **Location Services**
- Google Maps API for restaurant/rider locations
- Haversine formula for distance calculation
- Real-time rider GPS tracking
- Service area validation

---

## 🏗 Architecture Patterns

### Request Flow
```
Frontend App
    ↓
POST/GET/PUT/DELETE to /api/endpoint
    ↓
CORS Middleware (allow trusted origins)
    ↓
Rate Limiter (15 min window, 300 requests)
    ↓
Authentication Middleware (verify JWT)
    ↓
Route Handler
    ↓
Prisma ORM (query PostgreSQL)
    ↓
Redis (cache if applicable)
    ↓
Response → Frontend
```

### Real-time Flow
```
Frontend triggers Socket.io event
    ↓
Socket.io Server receives event
    ↓
Process in Express route
    ↓
Update database
    ↓
Broadcast to specific namespace (e.g., "restaurant:123")
    ↓
Frontend WebSocket listener receives update
    ↓
UI updates in real-time
```

---

## 📁 Key File Locations

| Path | Purpose |
|------|---------|
| `apps/api/src/index.ts` | API server initialization |
| `apps/api/src/routes/` | API endpoints |
| `apps/api/src/socket/io.ts` | WebSocket configuration |
| `apps/api/prisma/schema.prisma` | Database schema |
| `apps/customer/src/app/` | Customer app pages |
| `apps/customer/src/store/cartStore.ts` | Cart state |
| `packages/shared/src/types.ts` | Shared TypeScript types |
| `turbo.json` | Monorepo task configuration |
| `docker-compose.yml` | Development environment |

---

## 🛠 Common Tasks

### Add a New API Endpoint

```typescript
// apps/api/src/routes/new-feature.ts
import express from "express";
import { authenticate } from "../middleware/auth";
import { prisma } from "../lib/prisma";

const router = express.Router();

router.post("/", authenticate, async (req, res) => {
  try {
    const data = await prisma.model.create({
      data: req.body,
    });
    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
```

Then register in `apps/api/src/index.ts`:
```typescript
import newFeatureRouter from "./routes/new-feature";
app.use("/api/new-feature", newFeatureRouter);
```

### Add a Socket.io Event

```typescript
// apps/api/src/socket/io.ts
socket.on("custom-event", async (data) => {
  // Process event
  const result = await processData(data);
  
  // Broadcast to specific room
  io.to(`user:${userId}`).emit("response", result);
});
```

### Create a New Database Model

```prisma
// apps/api/prisma/schema.prisma
model NewModel {
  id           String   @id @default(cuid())
  name         String
  description  String   @db.Text
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("new_models")
}
```

Then run:
```bash
npm run db:generate
npm run db:push
```

### Fetch Data in Frontend

```typescript
// apps/customer/src/components/Example.tsx
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function Example() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["restaurants"],
    queryFn: () => api.get("/restaurants"),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.data.map((restaurant) => (
        <div key={restaurant.id}>{restaurant.name}</div>
      ))}
    </div>
  );
}
```

### Setup Environment Variables

```bash
# apps/api/.env
DATABASE_URL=postgresql://user:password@localhost:5432/swiftbyte
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_...
GOOGLE_MAPS_API_KEY=AIza...
NODE_ENV=development
PORT=4000
```

---

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# Start specific services
docker-compose up -d postgres redis

# View logs
docker-compose logs -f api

# Stop all services
docker-compose down

# Remove volumes (reset database)
docker-compose down -v

# Rebuild images
docker-compose up -d --build

# SSH into container
docker-compose exec api sh
```

---

## 📊 Database Queries

### Common Prisma Patterns

```typescript
// Find unique record
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { orders: true, addresses: true },
});

// Find many with filters
const orders = await prisma.order.findMany({
  where: {
    customerId: userId,
    status: "delivered",
  },
  orderBy: { createdAt: "desc" },
  take: 10,
});

// Update record
const updated = await prisma.restaurant.update({
  where: { id: restaurantId },
  data: { isOpen: false },
});

// Delete record
await prisma.order.delete({ where: { id: orderId } });

// Aggregate
const stats = await prisma.order.aggregate({
  where: { restaurantId },
  _count: true,
  _sum: { total: true },
});

// Transactions
await prisma.$transaction(async (tx) => {
  await tx.order.update({ where: { id }, data: { status: "delivered" } });
  await tx.payment.create({ data: { orderId, amount: order.total } });
});
```

---

## 🔐 Authentication Methods

### Login (JWT)
```typescript
POST /auth/login
{ "email": "user@example.com", "password": "password123" }

Response:
{
  "success": true,
  "user": { "id": "...", "email": "...", "role": "customer" },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..." (in HttpOnly cookie)
}
```

### Refresh Token
```typescript
POST /auth/refresh-token
(automatically uses refresh token from cookie)

Response:
{
  "accessToken": "eyJhbGc..."
}
```

### Google OAuth
```typescript
Redirect to /auth/google/callback
```

---

## 🚨 Error Handling

### API Error Format
```typescript
// Success
{ "success": true, "data": { ... } }

// Error
{
  "success": false,
  "error": "Detailed error message",
  "code": "VALIDATION_ERROR"
}
```

### Error Codes
- `VALIDATION_ERROR`: Request validation failed
- `UNAUTHORIZED`: Missing/invalid authentication
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource doesn't exist
- `CONFLICT`: Resource already exists
- `RATE_LIMITED`: Too many requests
- `INTERNAL_ERROR`: Server error

---

## 📈 Scaling Strategy

1. **Database**: Add read replicas for reporting
2. **Cache**: Use Redis for frequently accessed data
3. **API**: Horizontal scaling with load balancer
4. **Frontend**: CDN + static generation
5. **Real-time**: Socket.io adapter for multi-server
6. **Images**: Cloudinary + CDN

---

## 🔍 Debugging

```bash
# View API logs
docker-compose logs -f api

# Connect to PostgreSQL
psql -U swiftbyte -d swiftbyte -h localhost

# Use Prisma Studio
npm run db:studio  # Opens at http://localhost:5555

# Redis CLI
redis-cli -p 6379
> KEYS *
> GET key-name

# Check active processes
docker-compose ps

# Inspect network
docker network ls
```

---

## 📚 Useful Resources

- **Express.js Docs**: https://expressjs.com/
- **Prisma Docs**: https://www.prisma.io/docs/
- **Next.js Docs**: https://nextjs.org/docs
- **Socket.io Docs**: https://socket.io/docs/
- **Turborepo Docs**: https://turbo.build/repo/docs
- **Stripe API**: https://stripe.com/docs/api

---

**Quick Reference v1.0 | Last Updated: May 13, 2026**
