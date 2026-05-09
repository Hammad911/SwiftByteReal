import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { authenticate, requireRole, AuthRequest } from "../middleware/auth";
import { haversineDistance, estimateDeliveryTime } from "../utils/haversine";
import { getRiderLocation } from "../lib/redis";
import { getIO } from "../socket/io";

const router = Router();

// POST /orders — create new order
router.post("/", authenticate, requireRole("customer"), async (req: AuthRequest, res: Response) => {
  try {
    const {
      restaurantId,
      addressId,
      items,
      paymentMethod = "cash",
      voucherCode,
      scheduledFor,
      customerNote,
    } = req.body;

    if (!restaurantId || !addressId || !items?.length) {
      res.status(400).json({ success: false, error: "Missing required fields" });
      return;
    }

    // Validate restaurant
    const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
    if (!restaurant?.isOpen) {
      res.status(400).json({ success: false, error: "Restaurant is not accepting orders" });
      return;
    }

    // Validate address belongs to user
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: req.user!.id },
    });
    if (!address) {
      res.status(400).json({ success: false, error: "Invalid address" });
      return;
    }

    // Calculate items total
    let subtotal = 0;
    const orderItems: any[] = [];
    for (const item of items) {
      const menuItem = await prisma.menuItem.findUnique({ where: { id: item.menuItemId } });
      if (!menuItem || !menuItem.isAvailable) {
        res.status(400).json({ success: false, error: `Item ${item.menuItemId} is not available` });
        return;
      }
      const customisationsCost = (item.customisations || []).reduce(
        (sum: number, c: any) => sum + (c.extraCost || 0),
        0
      );
      const itemPrice = (menuItem.price + customisationsCost) * item.quantity;
      subtotal += itemPrice;
      orderItems.push({
        menuItemId: menuItem.id,
        name: menuItem.name,
        photo: menuItem.photo,
        quantity: item.quantity,
        price: menuItem.price + customisationsCost,
        customisations: item.customisations || [],
        specialInstructions: item.specialInstructions,
      });
    }

    // Validate minimum order
    if (subtotal < restaurant.minOrder) {
      res.status(400).json({
        success: false,
        error: `Minimum order is $${restaurant.minOrder}`,
      });
      return;
    }

    // Calculate delivery fee
    const distance = haversineDistance(address.lat, address.lng, restaurant.lat, restaurant.lng);
    const deliveryFee = restaurant.deliveryFee + distance * 0.3;

    // Apply voucher
    let discount = 0;
    if (voucherCode) {
      const voucher = await prisma.voucher.findFirst({
        where: {
          code: voucherCode.toUpperCase(),
          isActive: true,
          validFrom: { lte: new Date() },
          validTo: { gte: new Date() },
          minOrder: { lte: subtotal },
        },
      });
      if (voucher && voucher.usedCount < voucher.usageLimit) {
        discount =
          voucher.type === "percentage"
            ? (subtotal * voucher.value) / 100
            : Math.min(voucher.value, subtotal);
        await prisma.voucher.update({
          where: { id: voucher.id },
          data: { usedCount: { increment: 1 } },
        });
      }
    }

    const total = Math.max(0, subtotal + deliveryFee - discount);
    const estimatedMinutes = estimateDeliveryTime(distance, restaurant.prepTime);
    const estimatedDelivery = new Date(Date.now() + estimatedMinutes * 60 * 1000);

    // Create order
    const order = await prisma.order.create({
      data: {
        customerId: req.user!.id,
        restaurantId,
        addressId,
        status: "pending",
        subtotal,
        deliveryFee: parseFloat(deliveryFee.toFixed(2)),
        discount,
        total: parseFloat(total.toFixed(2)),
        paymentMethod,
        voucherCode,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        customerNote,
        estimatedDelivery,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
        customer: { select: { id: true, name: true, phone: true } },
        restaurant: { select: { id: true, name: true, logo: true } },
        address: true,
      },
    });

    // Notify restaurant via socket
    try {
      const io = getIO();
      io.to(`restaurant:${restaurantId}`).emit("new_order_incoming", order);
    } catch {}

    // Award loyalty points
    await prisma.loyaltyPoint.create({
      data: {
        userId: req.user!.id,
        orderId: order.id,
        points: Math.floor(total),
        type: "earned",
      },
    });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to create order" });
  }
});

// GET /orders — list orders (role-based)
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { status, page = "1", limit = "20" } = req.query as Record<string, string>;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let where: any = {};
    if (req.user!.role === "customer") where.customerId = req.user!.id;
    else if (req.user!.role === "rider") {
      const riderScope = {
        OR: [
          { riderId: req.user!.id },
          { AND: [{ status: "ready" as const }, { riderId: null }] },
        ],
      };
      if (status) {
        where.AND = [riderScope, { status }];
      } else {
        Object.assign(where, riderScope);
      }
    } else if (req.user!.role === "restaurant") {
      const restaurant = await prisma.restaurant.findFirst({ where: { ownerId: req.user!.id } });
      if (restaurant) where.restaurantId = restaurant.id;
    }
    if (status && req.user!.role !== "rider") where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          items: true,
          customer: { select: { id: true, name: true, phone: true, avatar: true } },
          restaurant: { select: { id: true, name: true, logo: true } },
          rider: { select: { id: true, name: true, phone: true, avatar: true } },
          address: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      success: true,
      data: { data: orders, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    });
  } catch {
    res.status(500).json({ success: false, error: "Failed to fetch orders" });
  }
});

// POST /orders/:id/claim — rider assigns themselves to an unassigned ready order
router.post("/:id/claim", authenticate, requireRole("rider", "admin"), async (req: AuthRequest, res: Response) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) {
      res.status(404).json({ success: false, error: "Order not found" });
      return;
    }
    if (order.status !== "ready" || order.riderId) {
      res.status(400).json({ success: false, error: "This order is not open for claiming" });
      return;
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { riderId: req.user!.id },
      include: {
        items: true,
        customer: { select: { id: true, name: true } },
        restaurant: { select: { id: true, name: true, address: true } },
        rider: { select: { id: true, name: true } },
        address: true,
      },
    });

    try {
      const io = getIO();
      const payload = {
        orderId: order.id,
        restaurantName: updated.restaurant?.name,
        restaurantAddress: updated.restaurant?.address,
      };
      io.to(`user:${req.user!.id}`).emit("order_food_ready", payload);
      io.to(`rider:${req.user!.id}`).emit("order_food_ready", payload);
      io.to(`order:${order.id}`).emit("order_status_changed", {
        orderId: order.id,
        status: "ready",
        assignedRiderId: req.user!.id,
        updatedAt: new Date().toISOString(),
      });
    } catch {}

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("POST /orders/:id/claim", err);
    res.status(500).json({ success: false, error: "Failed to claim order" });
  }
});

// GET /orders/:id
router.get("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: true,
        customer: { select: { id: true, name: true, phone: true, avatar: true } },
        restaurant: { select: { id: true, name: true, logo: true, address: true } },
        rider: { select: { id: true, name: true, phone: true, avatar: true } },
        address: true,
      },
    });

    if (!order) {
      res.status(404).json({ success: false, error: "Order not found" });
      return;
    }

    const u = req.user!;
    if (u.role !== "admin") {
      if (u.role === "customer" && order.customerId !== u.id) {
        res.status(403).json({ success: false, error: "Forbidden" });
        return;
      }
      if (u.role === "rider") {
        const assignedToMe = order.riderId === u.id;
        const openPickupPool = order.status === "ready" && !order.riderId;
        if (!assignedToMe && !openPickupPool) {
          res.status(403).json({ success: false, error: "Forbidden" });
          return;
        }
      }
      if (u.role === "restaurant") {
        const rest = await prisma.restaurant.findFirst({ where: { ownerId: u.id } });
        if (!rest || rest.id !== order.restaurantId) {
          res.status(403).json({ success: false, error: "Forbidden" });
          return;
        }
      }
    }

    res.json({ success: true, data: order });
  } catch (err) {
    console.error("GET /orders/:id", err);
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: "Failed to fetch order", detail: process.env.NODE_ENV === "development" ? msg : undefined });
  }
});

// PATCH /orders/:id/status
router.patch("/:id/status", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { status, prepTime, rejectReason } = req.body;
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) {
      res.status(404).json({ success: false, error: "Order not found" });
      return;
    }

    const actor = req.user!;
    if (actor.role === "customer") {
      res.status(403).json({ success: false, error: "Customers cannot change order status" });
      return;
    }
    if (actor.role === "rider") {
      if (order.riderId !== actor.id) {
        res.status(403).json({ success: false, error: "You are not assigned to this order" });
        return;
      }
      if (!["picked_up", "delivered"].includes(status)) {
        res.status(403).json({ success: false, error: "Invalid status update for rider" });
        return;
      }
    }
    if (actor.role === "restaurant") {
      const rest = await prisma.restaurant.findFirst({ where: { ownerId: actor.id } });
      if (!rest || rest.id !== order.restaurantId) {
        res.status(403).json({ success: false, error: "Not your restaurant order" });
        return;
      }
    } else if (actor.role !== "rider" && actor.role !== "admin") {
      res.status(403).json({ success: false, error: "Forbidden" });
      return;
    }

    await prisma.order.update({
      where: { id: req.params.id },
      data: { status, updatedAt: new Date() },
    });

    const riderTableId =
      order.riderId != null
        ? (
            await prisma.rider.findUnique({
              where: { userId: order.riderId },
              select: { id: true },
            })
          )?.id
        : null;

    // Handle delivery record (Delivery.riderId references Rider.id, not User.id)
    if (status === "picked_up" && riderTableId) {
      await prisma.delivery.upsert({
        where: { orderId: order.id },
        create: { orderId: order.id, riderId: riderTableId, pickedUpAt: new Date() },
        update: { pickedUpAt: new Date() },
      });
    } else if (status === "delivered" && riderTableId) {
      await prisma.delivery.upsert({
        where: { orderId: order.id },
        create: { orderId: order.id, riderId: riderTableId, deliveredAt: new Date() },
        update: { deliveredAt: new Date() },
      });

      if (order.riderId) {
        await prisma.riderEarning.upsert({
          where: { orderId: order.id },
          create: { riderId: order.riderId, orderId: order.id, baseAmount: 3.5, bonusAmount: 0 },
          update: {},
        });
      }
    }

    // Emit socket event — all approved riders hear "ready" (claim is optional)
    try {
      const io = getIO();

      if (status === "ready") {
        const o = await prisma.order.findUnique({
          where: { id: order.id },
          include: { restaurant: { select: { name: true, address: true } } },
        });
        const approvedRiders = await prisma.rider.findMany({
          where: { isApproved: true },
          select: { userId: true },
        });
        const payload = {
          orderId: order.id,
          restaurantName: o?.restaurant?.name,
          restaurantAddress: o?.restaurant?.address,
          requiresClaim: !o?.riderId,
        };
        for (const { userId } of approvedRiders) {
          io.to(`user:${userId}`).emit("order_food_ready", payload);
          io.to(`rider:${userId}`).emit("order_food_ready", payload);
        }
      }

      io.to(`order:${order.id}`).emit("order_status_changed", {
        orderId: order.id,
        status,
        updatedAt: new Date().toISOString(),
      });

      await prisma.notification.create({
        data: {
          userId: order.customerId,
          type: `order_${status}` as any,
          title: "Order Update",
          message: `Your order status is: ${status.replace(/_/g, " ")}`,
          orderId: order.id,
        },
      });
    } catch {}

    const finalOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        customer: { select: { id: true, name: true } },
        restaurant: { select: { id: true, name: true } },
        rider: { select: { id: true, name: true } },
        items: true,
        address: true,
      },
    });

    res.json({ success: true, data: finalOrder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to update order status" });
  }
});

// GET /orders/:id/tracking
router.get("/:id/tracking", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { address: true, restaurant: true },
    });
    if (!order) {
      res.status(404).json({ success: false, error: "Order not found" });
      return;
    }

    const ut = req.user!;
    if (ut.role !== "admin") {
      if (ut.role === "customer" && order.customerId !== ut.id) {
        res.status(403).json({ success: false, error: "Forbidden" });
        return;
      }
      if (ut.role === "rider") {
        const assignedToMe = order.riderId === ut.id;
        const openPool = order.status === "ready" && !order.riderId;
        if (!assignedToMe && !openPool) {
          res.status(403).json({ success: false, error: "Forbidden" });
          return;
        }
      }
      if (ut.role === "restaurant") {
        const rest = await prisma.restaurant.findFirst({ where: { ownerId: ut.id } });
        if (!rest || rest.id !== order.restaurantId) {
          res.status(403).json({ success: false, error: "Forbidden" });
          return;
        }
      }
    }

    let riderLocation = null;
    if (order.riderId) {
      riderLocation = await getRiderLocation(order.riderId);
    }

    res.json({
      success: true,
      data: {
        orderId: order.id,
        status: order.status,
        estimatedDelivery: order.estimatedDelivery,
        riderLocation,
        deliveryAddress: order.address,
        restaurantLocation: { lat: order.restaurant.lat, lng: order.restaurant.lng },
      },
    });
  } catch {
    res.status(500).json({ success: false, error: "Failed to fetch tracking" });
  }
});

// POST /orders/:id/rate
router.post("/:id/rate", authenticate, requireRole("customer"), async (req: AuthRequest, res: Response) => {
  try {
    const { restaurantScore, restaurantComment, riderScore, riderComment } = req.body;
    const order = await prisma.order.findUnique({
      where: { id: req.params.id, customerId: req.user!.id, status: "delivered" },
      include: { restaurant: { include: { owner: true } } },
    });

    if (!order) {
      res.status(404).json({ success: false, error: "Order not found or not eligible for rating" });
      return;
    }

    const ratings: any[] = [];

    if (restaurantScore) {
      const rating = await prisma.rating.create({
        data: {
          orderId: order.id,
          raterId: req.user!.id,
          targetId: order.restaurant.ownerId,
          targetType: "restaurant",
          score: restaurantScore,
          comment: restaurantComment,
        },
      });
      ratings.push(rating);

      // Update restaurant rating
      const allRatings = await prisma.rating.aggregate({
        where: { targetId: order.restaurant.ownerId, targetType: "restaurant" },
        _avg: { score: true },
        _count: { score: true },
      });
      await prisma.restaurant.update({
        where: { id: order.restaurantId },
        data: {
          rating: allRatings._avg.score || 0,
          totalRatings: allRatings._count.score,
        },
      });
    }

    if (riderScore && order.riderId) {
      const rating = await prisma.rating.create({
        data: {
          orderId: order.id,
          raterId: req.user!.id,
          targetId: order.riderId,
          targetType: "rider",
          score: riderScore,
          comment: riderComment,
        },
      });
      ratings.push(rating);

      // Update rider rating
      const riderRatings = await prisma.rating.aggregate({
        where: { targetId: order.riderId, targetType: "rider" },
        _avg: { score: true },
        _count: { score: true },
      });
      await prisma.rider.update({
        where: { userId: order.riderId },
        data: {
          rating: riderRatings._avg.score || 5,
          totalRatings: riderRatings._count.score,
        },
      });
    }

    res.json({ success: true, data: ratings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to submit rating" });
  }
});

export default router;
