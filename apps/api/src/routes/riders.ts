import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { authenticate, requireRole, AuthRequest } from "../middleware/auth";
import { setRiderLocation, getRiderLocation, setRiderOnline, setRiderOffline, getOnlineRiders } from "../lib/redis";
import { haversineDistance } from "../utils/haversine";
import { getIO } from "../socket/io";

const router = Router();

// GET /riders/nearby — find riders within radius
router.get("/nearby", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { lat, lng, radius = "5" } = req.query as Record<string, string>;
    if (!lat || !lng) {
      res.status(400).json({ success: false, error: "lat and lng required" });
      return;
    }

    const onlineRiderIds = await getOnlineRiders();
    const riders = await prisma.rider.findMany({
      where: { userId: { in: onlineRiderIds }, isApproved: true },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const maxRadius = parseFloat(radius);

    const nearbyRiders = (
      await Promise.all(
        riders.map(async (rider: any) => {
          const location = await getRiderLocation(rider.userId);
          if (!location) return null;
          const distance = haversineDistance(userLat, userLng, location.lat, location.lng);
          if (distance > maxRadius) return null;
          return { ...rider, location, distance };
        })
      )
    ).filter(Boolean);

    res.json({ success: true, data: nearbyRiders });
  } catch {
    res.status(500).json({ success: false, error: "Failed to find nearby riders" });
  }
});

// POST /riders/location — rider sends location ping
router.post("/location", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== "rider" && req.user!.role !== "admin") {
      res.status(403).json({ success: false, error: "Insufficient permissions" });
      return;
    }
    if (req.user!.role === "admin") {
      res.json({ success: true });
      return;
    }

    const { lat, lng, orderId } = req.body;
    if (!lat || !lng) {
      res.status(400).json({ success: false, error: "lat and lng required" });
      return;
    }

    await setRiderLocation(req.user!.id, lat, lng);

    // Emit to active order room if applicable
    if (orderId) {
      try {
        const io = getIO();
        io.to(`order:${orderId}`).emit("rider_location_update", {
          orderId,
          riderId: req.user!.id,
          lat,
          lng,
        });
      } catch {}
    }

    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, error: "Failed to update location" });
  }
});

// PATCH /riders/availability
router.patch("/availability", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== "rider" && req.user!.role !== "admin") {
      res.status(403).json({ success: false, error: "Insufficient permissions" });
      return;
    }

    const { isOnline } = req.body;
    if (typeof isOnline !== "boolean") {
      res.status(400).json({ success: false, error: "isOnline boolean required" });
      return;
    }

    if (req.user!.role === "admin") {
      res.json({ success: true, data: { isOnline } });
      return;
    }

    await prisma.rider.upsert({
      where: { userId: req.user!.id },
      create: {
        userId: req.user!.id,
        isOnline,
        isApproved: true,
      },
      update: { isOnline },
    });

    if (isOnline) {
      await setRiderOnline(req.user!.id);
    } else {
      await setRiderOffline(req.user!.id);
    }

    res.json({ success: true, data: { isOnline } });
  } catch {
    res.status(500).json({ success: false, error: "Failed to update availability" });
  }
});

// GET /riders/me — rider profile with stats
router.get("/me", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role === "admin") {
      res.json({
        success: true,
        data: {
          vehicleType: "bike",
          rating: 5,
          isOnline: false,
          earnings: { today: 0, week: 0, month: 0 },
          totalDeliveries: 0,
        },
      });
      return;
    }
    if (req.user!.role !== "rider") {
      res.status(403).json({ success: false, error: "Insufficient permissions" });
      return;
    }

    const rider = await prisma.rider.findUnique({
      where: { userId: req.user!.id },
      include: { user: { select: { id: true, name: true, email: true, phone: true, avatar: true } } },
    });

    if (!rider) {
      res.status(404).json({ success: false, error: "Rider profile not found" });
      return;
    }

    // Earnings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 7);
    const monthStart = new Date(today);
    monthStart.setDate(1);

    const [todayEarnings, weekEarnings, monthEarnings, totalDeliveries] = await Promise.all([
      prisma.riderEarning.aggregate({ where: { riderId: req.user!.id, createdAt: { gte: today } }, _sum: { baseAmount: true, bonusAmount: true } }),
      prisma.riderEarning.aggregate({ where: { riderId: req.user!.id, createdAt: { gte: weekStart } }, _sum: { baseAmount: true, bonusAmount: true } }),
      prisma.riderEarning.aggregate({ where: { riderId: req.user!.id, createdAt: { gte: monthStart } }, _sum: { baseAmount: true, bonusAmount: true } }),
      prisma.order.count({ where: { riderId: req.user!.id, status: "delivered" } }),
    ]);

    res.json({
      success: true,
      data: {
        ...rider,
        earnings: {
          today: (todayEarnings._sum.baseAmount || 0) + (todayEarnings._sum.bonusAmount || 0),
          week: (weekEarnings._sum.baseAmount || 0) + (weekEarnings._sum.bonusAmount || 0),
          month: (monthEarnings._sum.baseAmount || 0) + (monthEarnings._sum.bonusAmount || 0),
        },
        totalDeliveries,
      },
    });
  } catch {
    res.status(500).json({ success: false, error: "Failed to fetch rider profile" });
  }
});

// GET /riders/earnings — earnings history
router.get("/earnings", authenticate, requireRole("rider"), async (req: AuthRequest, res: Response) => {
  try {
    const { page = "1", limit = "20" } = req.query as Record<string, string>;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const earnings = await prisma.riderEarning.findMany({
      where: { riderId: req.user!.id },
      include: {
        order: {
          select: {
            id: true,
            createdAt: true,
            restaurant: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    });

    res.json({ success: true, data: earnings });
  } catch {
    res.status(500).json({ success: false, error: "Failed to fetch earnings" });
  }
});

// POST /riders/payout — request payout
router.post("/payout", authenticate, requireRole("rider"), async (req: AuthRequest, res: Response) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      res.status(400).json({ success: false, error: "Valid amount required" });
      return;
    }

    const payout = await prisma.payout.create({
      data: { riderId: req.user!.id, amount, status: "pending" },
    });
    res.status(201).json({ success: true, data: payout });
  } catch {
    res.status(500).json({ success: false, error: "Failed to request payout" });
  }
});

// POST /riders/delivery/proof — upload proof of delivery
router.post("/delivery/proof", authenticate, requireRole("rider"), async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, proofPhoto } = req.body;
    const delivery = await prisma.delivery.update({
      where: { orderId },
      data: { proofPhoto },
    });
    res.json({ success: true, data: delivery });
  } catch {
    res.status(500).json({ success: false, error: "Failed to upload proof" });
  }
});

export default router;
