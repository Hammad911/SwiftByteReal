# SwiftByte - Complete Project Architecture Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Initialization Process](#initialization-process)
6. [How It Works](#how-it-works)
7. [Deployment Guide](#deployment-guide)

---

## 🎯 Project Overview

**SwiftByte** is a production-ready, full-stack food delivery platform (similar to Foodpanda/DoorDash/Uber Eats) built as a **monorepo** using Turborepo. It features four separate portals with real-time updates, payment integration, and a comprehensive backend API.

### Key Features
- ✅ **Multi-portal System**: Customer ordering, Restaurant dashboard, Rider delivery app, Admin panel
- ✅ **Real-time Updates**: WebSocket integration for live order tracking
- ✅ **Payment Processing**: Stripe integration
- ✅ **Authentication**: JWT + OAuth (Google)
- ✅ **Location Services**: Google Maps integration for delivery tracking
- ✅ **Notifications**: Firebase Cloud Messaging + Twilio SMS
- ✅ **Image Management**: Cloudinary CDN
- ✅ **Database**: PostgreSQL with Prisma ORM
- ✅ **Caching**: Redis for session management and rider locations

---

## 🏗 Architecture

### Monorepo Structure (Turborepo)

```
swiftbyte/
├── apps/                          # Production applications
│   ├── api/                       # Express.js backend (port 4000)
│   ├── customer/                  # Next.js customer app (port 3000)
│   ├── restaurant/                # Next.js restaurant dashboard (port 3001)
│   ├── rider/                     # Next.js rider app (port 3002)
│   └── admin/                     # Next.js admin panel (port 3003)
├── packages/                      # Shared code
│   ├── shared/                    # Types, utilities, constants
│   └── ui/                        # Shared UI components (tailwind CN helper)
├── docker-compose.yml             # Full stack orchestration
├── turbo.json                     # Monorepo configuration
└── package.json                   # Root configuration
```

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer (Frontend)               │
├──────────────────┬──────────────┬──────────┬────────────┤
│  Customer App    │ Restaurant   │ Rider    │   Admin    │
│  (Next.js)       │ Dashboard    │ App      │   Panel    │
│  Port: 3000      │ (Next.js)    │ (Next.js)│ (Next.js)  │
│                  │ Port: 3001   │ Port:    │ Port: 3003 │
│                  │              │ 3002     │            │
└──────────────────┴──────────────┴──────────┴────────────┘
                         ↓ (HTTP/WebSocket)
┌─────────────────────────────────────────────────────────┐
│              API Gateway (Express.js)                    │
│                    Port: 4000                            │
│  - Authentication & Authorization                       │
│  - Business Logic                                        │
│  - WebSocket Server (Socket.io)                          │
│  - Rate Limiting & Validation                            │
│  - File Upload (Cloudinary)                              │
└─────────────┬────────────────────────────┬──────────────┘
              │                            │
      ┌───────┴────────┐          ┌────────┴──────────┐
      ↓                ↓          ↓                   ↓
 ┌─────────────┐ ┌──────────┐ ┌────────┐ ┌──────────────┐
 │ PostgreSQL  │ │  Redis   │ │Stripe  │ │   Firebase   │
 │ (Prisma ORM)│ │ (Cache & │ │(Payment)│ │ (Push Notif) │
 │ Port: 5432  │ │ Sessions)│ │         │ │              │
 │             │ │ Port:    │ │         │ │              │
 │ - Users     │ │ 6379     │ │         │ │              │
 │ - Orders    │ │          │ │         │ │              │
 │ - Restaurants│ │         │ │         │ │              │
 │ - Riders    │ │         │ │         │ │              │
 │ - Payments  │ │         │ │         │ │              │
 └─────────────┘ └──────────┘ └────────┘ └──────────────┘
```

### Data Flow Example: Order Placement

```
1. Customer clicks "Place Order"
   ↓
2. Customer App sends POST /orders to API (JWT authenticated)
   ↓
3. API validates order with Prisma ORM → PostgreSQL
   ↓
4. API emits Socket.io event: "order:created" to restaurant
   ↓
5. Restaurant App receives real-time notification
   ↓
6. Restaurant confirms order
   ↓
7. API emits "order:confirmed" to customer & assigned rider
   ↓
8. Rider App shows new order with pickup location (Google Maps)
   ↓
9. Rider updates status → Order status flows to all participants via WebSocket
   ↓
10. Order delivered → Payment processed via Stripe → Notification sent
```

---

## 🛠 Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Frontend** | Next.js 14 (App Router) | Server-side rendering, static generation |
| | TypeScript | Type-safe JavaScript |
| | Tailwind CSS | Utility-first styling |
| | Zustand | Client state management |
| | TanStack Query | Server state & caching |
| | React Hook Form | Form management |
| | Socket.io Client | Real-time updates |
| **Backend** | Node.js 20 | JavaScript runtime |
| | Express.js | HTTP server framework |
| | TypeScript | Type-safe JavaScript |
| **Database** | PostgreSQL 16 | Primary datastore |
| | Prisma ORM | Database abstraction |
| **Cache/Session** | Redis 7 | Session storage, rider locations |
| **Authentication** | JWT | Stateless authentication |
| | OAuth 2.0 (Google) | Social login |
| | bcryptjs | Password hashing |
| **Real-time** | Socket.io 4.7 | WebSocket server |
| **Payments** | Stripe | Payment processing |
| **Media** | Cloudinary | Image CDN & optimization |
| **Notifications** | Firebase Cloud Messaging | Push notifications |
| | Twilio | SMS & voice calls |
| | Nodemailer | Email delivery |
| **Maps** | Google Maps JavaScript API | Location services |
| **Monorepo** | Turborepo 2.0 | Task orchestration & caching |
| **Containerization** | Docker | Application containers |
| | Docker Compose | Multi-container orchestration |
| **Validation** | Zod | Runtime schema validation |
| **Logging** | Winston | Structured logging |
| **Security** | Helmet | HTTP security headers |
| | CORS | Cross-origin protection |
| | Rate Limiting | DOS protection |

---

## 📁 Project Structure Detailed

### Root Configuration Files

```
package.json          # Workspace root, defines Turborepo dependencies
turbo.json            # Monorepo task orchestration & caching
docker-compose.yml    # Development environment setup
tsconfig.json         # TypeScript base configuration
```

### `apps/api` - Backend Express Server

```
apps/api/
├── Dockerfile                 # Multi-stage build for production
├── package.json               # Dependencies (Express, Prisma, etc.)
├── tsconfig.json              # TypeScript config
├── prisma/
│   ├── schema.prisma          # Database schema (Users, Orders, etc.)
│   └── seed.ts                # Seed script with mock data
└── src/
    ├── index.ts               # Server initialization
    ├── middleware/
    │   ├── auth.ts            # JWT authentication middleware
    │   └── errorHandler.ts    # Global error handling
    ├── routes/
    │   ├── auth.ts            # Login, register, OAuth
    │   ├── restaurants.ts      # Restaurant CRUD & reviews
    │   ├── orders.ts          # Order management
    │   ├── riders.ts          # Rider management & earnings
    │   ├── payments.ts        # Payment processing (Stripe)
    │   ├── notifications.ts   # Push notifications
    │   ├── admin.ts           # Admin operations
    │   ├── addresses.ts       # User addresses
    │   ├── upload.ts          # File upload to Cloudinary
    │   └── vouchers.ts        # Discount codes
    ├── services/
    │   ├── email.ts           # Email delivery via Nodemailer
    │   └── [other services]
    ├── socket/
    │   └── io.ts              # WebSocket event handlers
    ├── utils/
    │   ├── jwt.ts             # JWT token generation
    │   ├── haversine.ts       # Distance calculation
    │   └── [other utils]
    └── lib/
        ├── prisma.ts          # Prisma client instance
        └── redis.ts           # Redis client instance
```

### `apps/customer` - Customer Frontend (Next.js)

```
apps/customer/
├── Dockerfile
├── package.json
├── tsconfig.json
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── page.tsx           # Home page
│   │   ├── globals.css        # Global styles
│   │   ├── auth/              # Login/signup pages
│   │   └── (main)/            # Protected routes group
│   │       ├── home/
│   │       ├── restaurants/   # Restaurant listing & details
│   │       ├── order/         # Order tracking
│   │       └── profile/       # User profile
│   ├── components/
│   │   ├── Providers.tsx      # Context providers (Auth, Query, Toast)
│   │   ├── auth/              # Auth-related components
│   │   ├── cart/              # Shopping cart components
│   │   ├── home/              # Home page components
│   │   ├── restaurant/        # Restaurant components
│   │   └── layout/            # Navigation, footer
│   ├── lib/
│   │   ├── api.ts             # Axios instance with interceptors
│   │   ├── restaurantData.ts  # Mock restaurant data
│   │   └── foodImages.ts      # Food image URLs
│   └── store/
│       ├── authStore.ts       # Zustand auth state
│       └── cartStore.ts       # Zustand cart state
└── public/                    # Static assets
```

### `apps/restaurant` - Restaurant Dashboard (Next.js)

```
apps/restaurant/
├── src/
│   ├── app/
│   │   ├── login/
│   │   └── dashboard/         # Restaurant analytics & order management
│   ├── components/
│   │   ├── layout/
│   │   └── [business components]
│   ├── lib/
│   │   └── api.ts
│   └── store/
│       └── authStore.ts
```

### `apps/rider` - Rider Delivery App (Next.js)

```
apps/rider/
├── src/
│   ├── app/
│   │   ├── login/
│   │   ├── dashboard/         # Active orders map
│   │   ├── earnings/          # Earnings dashboard
│   │   ├── history/           # Delivery history
│   │   └── profile/           # Rider profile
│   ├── components/
│   │   └── Providers.tsx
│   ├── lib/
│   │   └── api.ts
│   └── store/
│       └── authStore.ts
```

### `apps/admin` - Admin Panel (Next.js)

```
apps/admin/
├── src/
│   ├── app/
│   │   ├── login/
│   │   └── dashboard/         # Admin controls
│   ├── components/
│   └── store/
```

### `packages/shared` - Shared Code

```
packages/shared/
├── src/
│   ├── types.ts               # TypeScript interfaces (User, Order, Restaurant)
│   ├── constants.ts           # Enums, configurations
│   ├── utils.ts               # Helper functions
│   └── index.ts               # Exports
```

### `packages/ui` - Shared UI

```
packages/ui/
├── src/
│   ├── cn.ts                  # Tailwind class name merger
│   └── index.ts
```

---

## 🚀 Initialization Process

### Step 1: Installation

```bash
# Clone repository
git clone <repo-url>
cd swiftbyte

# Install dependencies for all workspaces
npm install
```

Turborepo reads `package.json` workspaces configuration and installs:
- Root dependencies (Turbo, TypeScript, Prettier)
- All app dependencies (Next.js, Express, Prisma)
- All package dependencies (Shared types, UI utilities)

### Step 2: Environment Configuration

Create `.env` file in `apps/api/`:

```bash
# Database
DATABASE_URL=postgresql://swiftbyte:swiftbyte_dev_password@localhost:5432/swiftbyte

# Redis
REDIS_URL=redis://localhost:6379

# JWT Secrets (use random strings in production)
JWT_ACCESS_SECRET=swiftbyte-access-secret-dev
JWT_REFRESH_SECRET=swiftbyte-refresh-secret-dev

# Server Config
PORT=4000
NODE_ENV=development

# CORS Origins
CLIENT_URL=http://localhost:3000
RESTAURANT_URL=http://localhost:3001
RIDER_URL=http://localhost:3002
ADMIN_URL=http://localhost:3003

# External Services (optional in dev)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
GOOGLE_MAPS_API_KEY=AIza...
CLOUDINARY_NAME=...
CLOUDINARY_KEY=...
CLOUDINARY_SECRET=...
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Step 3: Database Setup

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to PostgreSQL
npm run db:push

# Seed database with mock data
npm run db:seed
```

What happens:
1. **db:generate**: Compiles Prisma schema to TypeScript types
2. **db:push**: Creates tables in PostgreSQL
3. **db:seed**: Inserts 10 restaurants, 20 customers, 5 riders, sample orders

### Step 4: Start Development Environment

#### Option A: Using Docker Compose (Recommended)

```bash
docker-compose up -d

# Services will be available at:
# API: http://localhost:4000
# Customer: http://localhost:3000
# Restaurant: http://localhost:3001
# Rider: http://localhost:3002
# Admin: http://localhost:3003
# PostgreSQL: localhost:5432
# Redis: localhost:6379
```

#### Option B: Local Development

```bash
# Terminal 1: Start PostgreSQL & Redis (using Docker)
docker-compose up postgres redis

# Terminal 2: Start all apps with Turborepo
npm run dev

# Individual start (if needed):
cd apps/api && npm run dev       # Port 4000
cd apps/customer && npm run dev  # Port 3000
cd apps/restaurant && npm run dev # Port 3001
cd apps/rider && npm run dev     # Port 3002
cd apps/admin && npm run dev     # Port 3003
```

### Step 5: Verify Setup

- **API Health**: `curl http://localhost:4000/health`
- **Customer App**: Open `http://localhost:3000`
- **Prisma Studio**: `npm run db:studio` (visual database browser)

---

## 🔄 How It Works

### Authentication Flow

```
User Login
    ↓
POST /auth/login (email, password)
    ↓
API validates against PostgreSQL
    ↓
Generates JWT Access Token (15 min) + Refresh Token (7 days)
    ↓
Stores refresh token hash in Redis (for validation)
    ↓
Returns tokens to frontend
    ↓
Frontend stores:
  - Access Token: Memory (lost on refresh) or localStorage
  - Refresh Token: HttpOnly Cookie (secure)
    ↓
Subsequent requests include Authorization: Bearer {accessToken}
    ↓
API middleware validates token
    ↓
On access token expiry: POST /auth/refresh-token
    ↓
API generates new access token using refresh token from Redis
```

### Real-time Order Tracking

```
Restaurant receives order:
  1. API emits "order:created" via Socket.io to restaurant namespace
  2. Restaurant App updates UI instantly

Restaurant confirms order:
  1. API emits "order:confirmed" to customer & rider namespaces
  2. Both apps receive real-time notification

Rider picks up order:
  1. API broadcasts "order:picked_up" with rider's current location
  2. GPS updates via Socket.io every 10 seconds
  3. Customer sees live delivery tracking on Google Map

Order delivered:
  1. API emits "order:delivered"
  2. Triggers payment processing with Stripe
  3. Sends push notification via Firebase
```

### Database Schema Highlights

#### Users Table
- Multiple roles per user (customer can also be restaurant owner/rider)
- JWT refresh tokens stored
- Email verification & password reset tokens

#### Orders Table
- Tracks complete lifecycle (pending → confirmed → preparing → ready → picked_up → delivered)
- Contains rider assignment & delivery metadata
- Integration with payments

#### Restaurants Table
- Operating hours per day
- Delivery mode configuration (platform delivery, self-delivery, pickup)
- Commission rate for platform

#### Riders Table
- Current location (lat/long)
- Earnings & payout status
- Vehicle type & ratings

### Caching Strategy

**Redis Usage**:
- **Rider Locations**: Expire after 1 minute for real-time tracking
- **Session Storage**: Refresh tokens & user sessions (TTL = 7 days)
- **Rate Limiting**: Track login attempts per email
- **Lookup Tables**: Cache restaurant menus & operating hours

### Payment Processing

```
Customer initiates payment
    ↓
Frontend creates Stripe payment intent with order ID
    ↓
Customer completes payment in Stripe modal
    ↓
Stripe webhook (POST /payments/webhook) called
    ↓
API verifies webhook signature
    ↓
Updates order status to "paid" in PostgreSQL
    ↓
Emits Socket.io event to restaurant
    ↓
Initiates payout to restaurant (processed by background job)
```

---

## 🐳 Deployment Guide

### Prerequisites
- Docker & Docker Compose
- AWS account (or hosting provider)
- PostgreSQL managed service (AWS RDS, Azure Database)
- Redis managed service (AWS ElastiCache, Upstash)
- Environment variables configured

### Production Environment Setup

#### 1. Database Setup (AWS RDS Example)

```bash
# Create RDS PostgreSQL instance
# - Engine: PostgreSQL 16
# - DB instance: production
# - Username: swiftbyte_prod
# - Storage: 100GB SSD

# Update environment:
DATABASE_URL=postgresql://swiftbyte_prod:password@swiftbyte.xxxxx.us-east-1.rds.amazonaws.com:5432/swiftbyte_prod
NODE_ENV=production

# Run migrations:
npm run db:push
```

#### 2. Redis Setup (AWS ElastiCache Example)

```bash
# Create Redis cluster (6.x)
# - Node type: cache.t3.medium
# - Automatic failover: enabled

REDIS_URL=redis://swiftbyte.xxxxx.ng.0001.use1.cache.amazonaws.com:6379
```

#### 3. Deployment to AWS ECS/Fargate

##### Build Images

```bash
# Build API image
docker build -f apps/api/Dockerfile -t swiftbyte-api:latest .
docker tag swiftbyte-api:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/swiftbyte-api:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/swiftbyte-api:latest

# Build frontend images similarly
docker build -f apps/customer/Dockerfile -t swiftbyte-customer:latest .
docker build -f apps/restaurant/Dockerfile -t swiftbyte-restaurant:latest .
docker build -f apps/rider/Dockerfile -t swiftbyte-rider:latest .
docker build -f apps/admin/Dockerfile -t swiftbyte-admin:latest .
```

##### Create ECS Task Definitions

```json
{
  "family": "swiftbyte-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "api",
      "image": "123456789.dkr.ecr.us-east-1.amazonaws.com/swiftbyte-api:latest",
      "portMappings": [
        {
          "containerPort": 4000,
          "hostPort": 4000
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "4000"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:..."
        },
        {
          "name": "REDIS_URL",
          "valueFrom": "arn:aws:secretsmanager:..."
        }
      ]
    }
  ]
}
```

##### Create ECS Service

```bash
# API Service
aws ecs create-service \
  --cluster swiftbyte-prod \
  --service-name swiftbyte-api \
  --task-definition swiftbyte-api \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx]}"

# Customer Service
aws ecs create-service \
  --cluster swiftbyte-prod \
  --service-name swiftbyte-customer \
  --task-definition swiftbyte-customer \
  --desired-count 2 \
  --launch-type FARGATE
  # ...and so on for other apps
```

#### 4. Setup API Gateway & Load Balancer

```bash
# Create Application Load Balancer
aws elbv2 create-load-balancer \
  --name swiftbyte-alb \
  --subnets subnet-xxx subnet-yyy \
  --security-groups sg-xxx

# Create target groups
aws elbv2 create-target-group \
  --name swiftbyte-api \
  --protocol HTTP \
  --port 4000 \
  --vpc-id vpc-xxx

# Create listener & routing rules
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:... \
  --protocol HTTP \
  --port 80
```

#### 5. Setup CloudFront CDN

```bash
# Create CloudFront distribution for API & assets
aws cloudfront create-distribution \
  --origin-domain-name swiftbyte-alb.us-east-1.elb.amazonaws.com
```

#### 6. Environment Variables (AWS Secrets Manager)

```bash
# Store secrets
aws secretsmanager create-secret \
  --name swiftbyte/prod/db-url \
  --secret-string "postgresql://..."

aws secretsmanager create-secret \
  --name swiftbyte/prod/jwt-access-secret \
  --secret-string "super-random-secret"

aws secretsmanager create-secret \
  --name swiftbyte/prod/jwt-refresh-secret \
  --secret-string "super-random-secret"

aws secretsmanager create-secret \
  --name swiftbyte/prod/stripe-secret-key \
  --secret-string "sk_live_..."
```

#### 7. CI/CD Pipeline (GitHub Actions Example)

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

env:
  AWS_REGION: us-east-1
  ECR_REGISTRY: 123456789.dkr.ecr.us-east-1.amazonaws.com

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Login to Amazon ECR
        run: aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY
      
      - name: Build and push API image
        run: |
          docker build -f apps/api/Dockerfile -t $ECR_REGISTRY/swiftbyte-api:latest .
          docker push $ECR_REGISTRY/swiftbyte-api:latest
      
      - name: Update ECS service
        run: |
          aws ecs update-service \
            --cluster swiftbyte-prod \
            --service swiftbyte-api \
            --force-new-deployment
```

#### 8. Monitoring & Logging

```bash
# Setup CloudWatch
aws logs create-log-group --log-group-name /ecs/swiftbyte-api
aws logs put-retention-policy --log-group-name /ecs/swiftbyte-api --retention-in-days 30

# Setup CloudWatch Alarms
aws cloudwatch put-metric-alarm \
  --alarm-name swiftbyte-api-cpu \
  --alarm-description "Alert if CPU > 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold
```

#### 9. Database Backups

```bash
# Enable automated backups on RDS
aws rds modify-db-instance \
  --db-instance-identifier swiftbyte \
  --backup-retention-period 30 \
  --preferred-backup-window "03:00-04:00" \
  --apply-immediately
```

### Deployment Checklist

- [ ] Environment variables secured in AWS Secrets Manager
- [ ] Database migrations applied
- [ ] Redis cache configured
- [ ] SSL/TLS certificates configured
- [ ] CDN setup for static assets
- [ ] Database backups automated
- [ ] Monitoring & alerting setup
- [ ] Load balancer health checks configured
- [ ] Auto-scaling policies configured
- [ ] CI/CD pipeline configured
- [ ] Staging environment tested
- [ ] Rollback plan documented

### Rollback Procedure

```bash
# Rollback to previous API deployment
aws ecs update-service \
  --cluster swiftbyte-prod \
  --service swiftbyte-api \
  --task-definition swiftbyte-api:3 \
  --force-new-deployment

# Monitor rollback
aws ecs describe-services \
  --cluster swiftbyte-prod \
  --services swiftbyte-api
```

### Performance Optimization

1. **Database**: Add indexes on frequently queried columns (userId, restaurantId, status)
2. **Redis**: Implement cache warming for popular restaurants
3. **Frontend**: Enable Next.js Image Optimization & ISR
4. **API**: Implement request/response compression
5. **API**: Use connection pooling for PostgreSQL
6. **CDN**: Cache static assets with long expiry

---

## 🔐 Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **CORS**: Whitelist only trusted origins
3. **Rate Limiting**: Protect auth endpoints
4. **HTTPS**: Always use SSL/TLS in production
5. **SQL Injection**: Use Prisma parameterized queries
6. **JWT**: Rotate secrets periodically
7. **Passwords**: Minimum 12 characters, bcryptjs with salt rounds 10
8. **API Keys**: Rotate Stripe, Cloudinary, Firebase keys quarterly
9. **Database**: Enable SSL, restrict access to private subnet
10. **Secrets**: Use AWS Secrets Manager, never commit them

---

## 📞 Support Commands

```bash
# Development
npm run dev              # Start all apps
npm run build            # Build all apps
npm run type-check       # Type check all apps
npm run lint             # Lint all apps

# Database
npm run db:generate      # Generate Prisma Client
npm run db:push          # Sync schema to database
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio (visual DB browser)

# Docker
docker-compose up        # Start full stack
docker-compose down      # Stop full stack
docker-compose logs -f   # View logs
```

---

**Document Version**: 1.0  
**Last Updated**: May 13, 2026  
**Project**: SwiftByte Food Delivery Platform
