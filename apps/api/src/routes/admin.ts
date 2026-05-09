import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { authenticate, requireRole, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /admin/analytics
router.get("/analytics", authenticate, requireRole("admin"), async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);

    const [
      totalUsers,
      totalRestaurants,
      totalRiders,
      totalOrders,
      ordersToday,
      revenueToday,
      weeklyRevenue,
      pendingRestaurants,
      pendingRiders,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "customer" } }),
      prisma.restaurant.count({ where: { isApproved: true } }),
      prisma.rider.count({ where: { isApproved: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.order.aggregate({
        where: { createdAt: { gte: today }, status: { not: "cancelled" } },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: { createdAt: { gte: weekAgo }, status: { not: "cancelled" } },
        _sum: { total: true },
      }),
      prisma.restaurant.count({ where: { isApproved: false } }),
      prisma.rider.count({ where: { isApproved: false } }),
    ]);

    // Top restaurants
    const topRestaurants = await prisma.order.groupBy({
      by: ["restaurantId"],
      where: { createdAt: { gte: weekAgo }, status: { not: "cancelled" } },
      _sum: { total: true },
      _count: { id: true },
      orderBy: { _sum: { total: "desc" } },
      take: 5,
    });

    const topRestaurantDetails = await Promise.all(
      topRestaurants.map(async (r) => {
        const restaurant = await prisma.restaurant.findUnique({
          where: { id: r.restaurantId },
          select: { id: true, name: true, logo: true },
        });
        return { ...restaurant, revenue: r._sum.total, orders: r._count.id };
      })
    );

    // Orders by status
    const ordersByStatus = await prisma.order.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalRestaurants,
        totalRiders,
        totalOrders,
        ordersToday,
        revenueToday: revenueToday._sum.total || 0,
        gmv: weeklyRevenue._sum.total || 0,
        pendingRestaurants,
        pendingRiders,
        topRestaurants: topRestaurantDetails,
        ordersByStatus,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to fetch analytics" });
  }
});

// GET /admin/users
router.get("/users", authenticate, requireRole("admin"), async (req: AuthRequest, res: Response) => {
  try {
    const { role, search, page = "1", limit = "20" } = req.query as Record<string, string>;
    const where: any = {};
    if (role) where.role = role;
    if (search) where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true, phone: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ success: true, data: { data: users, total } });
  } catch {
    res.status(500).json({ success: false, error: "Failed to fetch users" });
  }
});

// PATCH /admin/users/:id/suspend
router.patch("/users/:id/suspend", authenticate, requireRole("admin"), async (req: AuthRequest, res: Response) => {
  try {
    const { isSuspended } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: !isSuspended },
    });
    res.json({ success: true, data: user });
  } catch {
    res.status(500).json({ success: false, error: "Failed to update user status" });
  }
});

// GET /admin/restaurants
router.get("/restaurants", authenticate, requireRole("admin"), async (req: AuthRequest, res: Response) => {
  try {
    const { approved, page = "1", limit = "20" } = req.query as Record<string, string>;
    const where: any = {};
    if (approved !== undefined) where.isApproved = approved === "true";

    const [restaurants, total] = await Promise.all([
      prisma.restaurant.findMany({
        where,
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        include: { owner: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.restaurant.count({ where }),
    ]);

    res.json({ success: true, data: { data: restaurants, total } });
  } catch {
    res.status(500).json({ success: false, error: "Failed to fetch restaurants" });
  }
});

// PATCH /admin/restaurants/:id/approve
router.patch("/restaurants/:id/approve", authenticate, requireRole("admin"), async (req: AuthRequest, res: Response) => {
  try {
    const { isApproved } = req.body;
    const restaurant = await prisma.restaurant.update({
      where: { id: req.params.id },
      data: { isApproved, isOpen: isApproved ? true : false },
      include: { owner: { select: { id: true, name: true } } },
    });

    // Notify the restaurant owner
    try {
      await prisma.notification.create({
        data: {
          userId: (restaurant as any).owner.id,
          type: "system" as any,
          title: isApproved ? "🎉 Restaurant Approved!" : "Restaurant Application Update",
          message: isApproved
            ? `Your restaurant "${restaurant.name}" has been approved! You can now start receiving orders.`
            : `Your restaurant "${restaurant.name}" application has been put on hold. Contact support for details.`,
        },
      });
    } catch {}

    res.json({ success: true, data: restaurant });
  } catch {
    res.status(500).json({ success: false, error: "Failed to update restaurant" });
  }
});

// PATCH /admin/restaurants/:id/commission
router.patch("/restaurants/:id/commission", authenticate, requireRole("admin"), async (req: AuthRequest, res: Response) => {
  try {
    const { commissionRate } = req.body;
    const restaurant = await prisma.restaurant.update({
      where: { id: req.params.id },
      data: { commissionRate },
    });
    res.json({ success: true, data: restaurant });
  } catch {
    res.status(500).json({ success: false, error: "Failed to update commission" });
  }
});

// GET /admin/riders
router.get("/riders", authenticate, requireRole("admin"), async (req: AuthRequest, res: Response) => {
  try {
    const { approved, page = "1", limit = "20" } = req.query as Record<string, string>;
    const where: any = {};
    if (approved !== undefined) where.isApproved = approved === "true";

    const [riders, total] = await Promise.all([
      prisma.rider.findMany({
        where,
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        include: { user: { select: { name: true, email: true, phone: true } } },
        orderBy: { user: { createdAt: "desc" } },
      }),
      prisma.rider.count({ where }),
    ]);

    res.json({ success: true, data: { data: riders, total } });
  } catch {
    res.status(500).json({ success: false, error: "Failed to fetch riders" });
  }
});

// PATCH /admin/riders/:id/approve
router.patch("/riders/:id/approve", authenticate, requireRole("admin"), async (req: AuthRequest, res: Response) => {
  try {
    const { isApproved } = req.body;
    const rider = await prisma.rider.update({
      where: { id: req.params.id },
      data: { isApproved },
    });
    res.json({ success: true, data: rider });
  } catch {
    res.status(500).json({ success: false, error: "Failed to update rider" });
  }
});

// GET /admin/orders
router.get("/orders", authenticate, requireRole("admin"), async (req: AuthRequest, res: Response) => {
  try {
    const { status, page = "1", limit = "20" } = req.query as Record<string, string>;
    const where: any = {};
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        include: {
          customer: { select: { name: true, email: true } },
          restaurant: { select: { name: true } },
          rider: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({ success: true, data: { data: orders, total } });
  } catch {
    res.status(500).json({ success: false, error: "Failed to fetch orders" });
  }
});

export default router;
