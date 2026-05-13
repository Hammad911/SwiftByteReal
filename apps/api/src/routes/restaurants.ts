import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { authenticate, requireRole, AuthRequest } from "../middleware/auth";
import { haversineDistance } from "../utils/haversine";

const router = Router();

/** Customer reviews for this restaurant owner (also mounted on app in index.ts for reliable routing). */
export async function handleRestaurantMineReviews(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { page = "1", limit = "20" } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const rest = await prisma.restaurant.findFirst({
      where: { ownerId: req.user!.id },
      select: { id: true, name: true, rating: true, totalRatings: true },
    });

    if (!rest) {
      res.status(404).json({ success: false, error: "No restaurant found for this account" });
      return;
    }

    const where = { targetId: req.user!.id, targetType: "restaurant" };

    const [reviews, total] = await Promise.all([
      prisma.rating.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
        include: {
          rater: { select: { id: true, name: true, avatar: true } },
          order: {
            select: {
              id: true,
              createdAt: true,
              total: true,
              status: true,
            },
          },
        },
      }),
      prisma.rating.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          avgRating: rest.rating,
          totalReviews: rest.totalRatings,
          restaurantName: rest.name,
        },
        data: reviews,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 0,
      },
    });
  } catch (err) {
    console.error("GET /restaurants/mine/reviews", err);
    res.status(500).json({ success: false, error: "Failed to fetch reviews" });
  }
}

// GET /restaurants/mine — get the restaurant owned by the logged-in user
router.get("/mine", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const restaurant = await prisma.restaurant.findFirst({
      where: { ownerId: req.user!.id },
      include: { operatingHours: true, menuCategories: { include: { items: true } } },
    });
    if (!restaurant) {
      res.status(404).json({ success: false, error: "No restaurant found for this account" });
      return;
    }
    res.json({ success: true, data: restaurant });
  } catch {
    res.status(500).json({ success: false, error: "Failed to fetch restaurant" });
  }
});

// POST /restaurants — register a new restaurant (pending approval)
router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const {
      name, description, phone, address, cuisineTypes,
      lat = 33.6844, lng = 73.0479, // default Islamabad coords
      deliveryFee = 2.99, minOrder = 10,
    } = req.body;

    if (!name || !address) {
      res.status(400).json({ success: false, error: "Name and address are required" });
      return;
    }

    // Check if user already has a restaurant
    const existing = await prisma.restaurant.findFirst({ where: { ownerId: req.user!.id } });
    if (existing) {
      res.status(409).json({ success: false, error: "You already have a registered restaurant" });
      return;
    }

    // Promote user to restaurant role
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { role: "restaurant" },
    });

    const restaurant = await prisma.restaurant.create({
      data: {
        ownerId: req.user!.id,
        name,
        description: description || "",
        phone: phone || "",
        address,
        cuisineTypes: Array.isArray(cuisineTypes) ? cuisineTypes : [cuisineTypes || "other"],
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        deliveryFee: parseFloat(deliveryFee),
        minOrder: parseFloat(minOrder),
        isApproved: false,
        isOpen: false,
      },
    });

    // Notify admins via notification
    try {
      const admins = await prisma.user.findMany({ where: { role: "admin" } });
      await Promise.all(
        admins.map((admin: any) =>
          prisma.notification.create({
            data: {
              userId: admin.id,
              type: "system" as any,
              title: "New Restaurant Application",
              message: `${name} has applied to join SwiftByte. Review and approve in the admin panel.`,
            },
          })
        )
      );
    } catch {}

    res.status(201).json({ success: true, data: restaurant });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to register restaurant" });
  }
});

// GET /restaurants — public search with filters
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const {
      lat,
      lng,
      cuisine,
      minRating,
      maxDeliveryTime,
      search,
      dietary,
      page = "1",
      limit = "20",
    } = req.query as Record<string, string>;

    const where: any = { isApproved: true, isSuspended: false };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { cuisineTypes: { has: search.toLowerCase() } },
      ];
    }

    if (cuisine) {
      where.cuisineTypes = { has: cuisine.toLowerCase() };
    }

    if (minRating) {
      where.rating = { gte: parseFloat(minRating) };
    }

    if (maxDeliveryTime) {
      where.prepTime = { lte: parseInt(maxDeliveryTime) };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [restaurants, total] = await Promise.all([
      prisma.restaurant.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          operatingHours: true,
          menuItems: {
            where: { isFeatured: true },
            take: 3,
            select: { id: true, name: true, photo: true, price: true },
          },
        },
        orderBy: { rating: "desc" },
      }),
      prisma.restaurant.count({ where }),
    ]);

    let result = restaurants;

    // Sort by distance if coordinates provided
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);

      result = restaurants
        .map((r: any) => ({
          ...r,
          distance: haversineDistance(userLat, userLng, r.lat, r.lng),
        }))
        .sort((a: any, b: any) => (a as any).distance - (b as any).distance);
    }

    res.json({
      success: true,
      data: {
        data: result,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch restaurants" });
  }
});

// GET /restaurants/:id — public restaurant detail
router.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: req.params.id },
      include: {
        operatingHours: { orderBy: { day: "asc" } },
        menuCategories: {
          orderBy: { sortOrder: "asc" },
          include: {
            items: {
              where: { isAvailable: true },
              orderBy: { sortOrder: "asc" },
              include: {
                modifierGroups: {
                  include: { options: true },
                },
              },
            },
          },
        },
        promotions: { where: { isActive: true, validTo: { gte: new Date() } } },
      },
    });

    if (!restaurant) {
      res.status(404).json({ success: false, error: "Restaurant not found" });
      return;
    }

    res.json({ success: true, data: restaurant });
  } catch {
    res.status(500).json({ success: false, error: "Failed to fetch restaurant" });
  }
});

// PATCH /restaurants/:id — restaurant owner update
router.patch("/:id", authenticate, requireRole("restaurant", "admin"), async (req: AuthRequest, res: Response) => {
  try {
    const restaurant = await prisma.restaurant.findUnique({ where: { id: req.params.id } });
    if (!restaurant) {
      res.status(404).json({ success: false, error: "Not found" });
      return;
    }

    if (req.user!.role === "restaurant" && restaurant.ownerId !== req.user!.id) {
      res.status(403).json({ success: false, error: "Forbidden" });
      return;
    }

    const allowed = ["name", "description", "logo", "banner", "cuisineTypes", "isOpen", "deliveryMode", "minOrder", "prepTime", "deliveryFee", "address", "lat", "lng"];
    const data: any = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) data[key] = req.body[key];
    }

    const updated = await prisma.restaurant.update({
      where: { id: req.params.id },
      data,
    });
    res.json({ success: true, data: updated });
  } catch {
    res.status(500).json({ success: false, error: "Failed to update restaurant" });
  }
});

// GET /restaurants/:id/analytics
router.get("/:id/analytics", authenticate, requireRole("restaurant", "admin"), async (req: AuthRequest, res: Response) => {
  try {
    const { period = "weekly" } = req.query as Record<string, string>;

    const now = new Date();
    const startDate = new Date();
    if (period === "daily") startDate.setDate(now.getDate() - 7);
    else if (period === "weekly") startDate.setDate(now.getDate() - 28);
    else startDate.setMonth(now.getMonth() - 12);

    const orders = await prisma.order.findMany({
      where: {
        restaurantId: req.params.id,
        createdAt: { gte: startDate },
        status: { not: "cancelled" },
      },
      include: { items: true },
    });

    // Revenue by date
    const revenueMap = new Map<string, { revenue: number; orders: number }>();
    for (const order of orders) {
      const dateKey = order.createdAt.toISOString().split("T")[0];
      const existing = revenueMap.get(dateKey) || { revenue: 0, orders: 0 };
      existing.revenue += order.total;
      existing.orders += 1;
      revenueMap.set(dateKey, existing);
    }

    const revenueData = Array.from(revenueMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Top items
    const itemCounts = new Map<string, { name: string; photo: string | null; count: number; revenue: number }>();
    for (const order of orders) {
      for (const item of order.items) {
        const existing = itemCounts.get(item.menuItemId) || { name: item.name, photo: item.photo, count: 0, revenue: 0 };
        existing.count += item.quantity;
        existing.revenue += item.price * item.quantity;
        itemCounts.set(item.menuItemId, existing);
      }
    }

    const topItems = Array.from(itemCounts.entries())
      .map(([id, data]: [string, any]) => ({ menuItemId: id, ...data }))
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 10);

    const totalRevenue = orders.reduce((sum: number, o: any) => sum + o.total, 0);
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
    const cancelledOrders = await prisma.order.count({
      where: { restaurantId: req.params.id, status: "cancelled", createdAt: { gte: startDate } },
    });

    res.json({
      success: true,
      data: {
        revenueData,
        topItems,
        summary: {
          totalRevenue,
          totalOrders: orders.length,
          cancelledOrders,
          avgOrderValue,
          cancellationRate: orders.length > 0 ? (cancelledOrders / (orders.length + cancelledOrders)) * 100 : 0,
        },
      },
    });
  } catch {
    res.status(500).json({ success: false, error: "Failed to fetch analytics" });
  }
});

// ─── Menu Categories ──────────────────────────────────────────────────────────

router.post("/:id/categories", authenticate, requireRole("restaurant"), async (req: AuthRequest, res: Response) => {
  try {
    const { name, sortOrder } = req.body;
    const category = await prisma.menuCategory.create({
      data: { restaurantId: req.params.id, name, sortOrder },
    });
    res.status(201).json({ success: true, data: category });
  } catch {
    res.status(500).json({ success: false, error: "Failed to create category" });
  }
});

router.patch("/:id/categories/:catId", authenticate, requireRole("restaurant"), async (req: AuthRequest, res: Response) => {
  try {
    const category = await prisma.menuCategory.update({
      where: { id: req.params.catId },
      data: { name: req.body.name, sortOrder: req.body.sortOrder },
    });
    res.json({ success: true, data: category });
  } catch {
    res.status(500).json({ success: false, error: "Failed to update category" });
  }
});

router.delete("/:id/categories/:catId", authenticate, requireRole("restaurant"), async (req: AuthRequest, res: Response) => {
  try {
    await prisma.menuCategory.delete({ where: { id: req.params.catId } });
    res.json({ success: true, message: "Category deleted" });
  } catch {
    res.status(500).json({ success: false, error: "Failed to delete category" });
  }
});

// ─── Menu Items ───────────────────────────────────────────────────────────────

router.post("/:id/items", authenticate, requireRole("restaurant"), async (req: AuthRequest, res: Response) => {
  try {
    const { categoryId, name, description, photo, price, isAvailable, dietaryTags, isFeatured } = req.body;
    const item = await prisma.menuItem.create({
      data: { restaurantId: req.params.id, categoryId, name, description, photo, price, isAvailable, dietaryTags, isFeatured },
    });
    res.status(201).json({ success: true, data: item });
  } catch {
    res.status(500).json({ success: false, error: "Failed to create item" });
  }
});

router.patch("/:id/items/:itemId", authenticate, requireRole("restaurant"), async (req: AuthRequest, res: Response) => {
  try {
    const item = await prisma.menuItem.update({
      where: { id: req.params.itemId },
      data: req.body,
    });
    res.json({ success: true, data: item });
  } catch {
    res.status(500).json({ success: false, error: "Failed to update item" });
  }
});

router.delete("/:id/items/:itemId", authenticate, requireRole("restaurant"), async (req: AuthRequest, res: Response) => {
  try {
    await prisma.menuItem.delete({ where: { id: req.params.itemId } });
    res.json({ success: true, message: "Item deleted" });
  } catch {
    res.status(500).json({ success: false, error: "Failed to delete item" });
  }
});

export default router;
