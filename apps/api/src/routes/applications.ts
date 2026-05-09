import { Router, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticate, requireRole, AuthRequest } from "../middleware/auth";
import {
  sendRestaurantApplicationReceived,
  sendRestaurantApplicationApproved,
  sendRestaurantApplicationRejected,
  sendRestaurantApplicationMoreInfo,
  sendRiderApplicationReceived,
  sendRiderApplicationApproved,
  sendRiderApplicationRejected,
} from "../services/email";

const router = Router();

// ── Schemas ──────────────────────────────────────────────────────────────────

const restaurantAppSchema = z.object({
  restaurantName:  z.string().min(2).max(100),
  description:     z.string().min(10).max(1000),
  cuisineTypes:    z.array(z.string()).min(1),
  address:         z.string().min(5),
  city:            z.string().min(2),
  phone:           z.string().min(7),
  ownerName:       z.string().min(2),
  ownerCnic:       z.string().min(13).max(15),
  bankAccountName: z.string().min(2),
  bankAccountNo:   z.string().min(8),
  bankName:        z.string().min(2),
  logoUrl:         z.string().url().optional(),
  bannerUrl:       z.string().url().optional(),
  documents:       z.array(z.string()).optional(),
});

const riderAppSchema = z.object({
  fullName:    z.string().min(2),
  cnic:        z.string().min(13).max(15),
  phone:       z.string().min(7),
  vehicleType: z.enum(["bike", "bicycle", "car"]),
  vehicleNo:   z.string().min(3),
  licenseNo:   z.string().min(5),
  city:        z.string().min(2),
  documents:   z.array(z.string()).optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// RESTAURANT APPLICATIONS
// ─────────────────────────────────────────────────────────────────────────────

/** POST /applications/restaurant — submit a new restaurant application */
router.post("/restaurant", authenticate, async (req: AuthRequest, res: Response) => {
  const parsed = restaurantAppSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.errors[0].message, code: "VALIDATION_ERROR" });
    return;
  }

  try {
    // Check for existing pending/approved application
    const existing = await prisma.restaurantApplication.findFirst({
      where: { userId: req.user!.id, status: { in: ["pending", "approved"] } },
    });
    if (existing) {
      res.status(409).json({ success: false, error: "You already have an active application", code: "ALREADY_APPLIED" });
      return;
    }

    const app = await prisma.restaurantApplication.create({
      data: { userId: req.user!.id, ...parsed.data, documents: parsed.data.documents ?? [] },
    });

    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } });
    sendRestaurantApplicationReceived(user.email, user.name, parsed.data.restaurantName);

    // Notify admins
    const admins = await prisma.user.findMany({ where: { role: "admin" } });
    for (const admin of admins) {
      await prisma.notification.create({
        data: { userId: admin.id, type: "system", title: "New Restaurant Application", message: `${parsed.data.restaurantName} applied to join SwiftByte.` },
      });
    }

    res.status(201).json({ success: true, data: app });
  } catch {
    res.status(500).json({ success: false, error: "Failed to submit application", code: "SERVER_ERROR" });
  }
});

/** POST /applications/rider — submit a rider application */
router.post("/rider", authenticate, async (req: AuthRequest, res: Response) => {
  const parsed = riderAppSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.errors[0].message, code: "VALIDATION_ERROR" });
    return;
  }

  try {
    const existing = await prisma.riderApplication.findFirst({
      where: { userId: req.user!.id, status: { in: ["pending", "approved"] } },
    });
    if (existing) {
      res.status(409).json({ success: false, error: "You already have an active rider application", code: "ALREADY_APPLIED" });
      return;
    }

    const app = await prisma.riderApplication.create({
      data: { userId: req.user!.id, ...parsed.data, documents: parsed.data.documents ?? [] },
    });

    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } });
    sendRiderApplicationReceived(user.email, user.name);

    res.status(201).json({ success: true, data: app });
  } catch {
    res.status(500).json({ success: false, error: "Failed to submit application", code: "SERVER_ERROR" });
  }
});

/** GET /applications/my — user's own applications */
router.get("/my", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const [restaurant, rider] = await Promise.all([
      prisma.restaurantApplication.findFirst({
        where: { userId: req.user!.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.riderApplication.findFirst({
        where: { userId: req.user!.id },
        orderBy: { createdAt: "desc" },
      }),
    ]);
    res.json({ success: true, data: { restaurant, rider } });
  } catch {
    res.status(500).json({ success: false, error: "Failed to fetch applications", code: "SERVER_ERROR" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — RESTAURANT APPLICATIONS
// ─────────────────────────────────────────────────────────────────────────────

/** GET /applications/admin/restaurant — list all applications */
router.get("/admin/restaurant", authenticate, requireRole("admin"), async (req: AuthRequest, res: Response) => {
  const { status, page = "1", limit = "20" } = req.query as Record<string, string>;
  const where: any = {};
  if (status) where.status = status;

  const pageNum = parseInt(page), limitNum = parseInt(limit);
  const [apps, total] = await Promise.all([
    prisma.restaurantApplication.findMany({
      where,
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.restaurantApplication.count({ where }),
  ]);
  res.json({ success: true, data: { data: apps, total, page: pageNum, totalPages: Math.ceil(total / limitNum) } });
});

/** GET /applications/admin/restaurant/:id */
router.get("/admin/restaurant/:id", authenticate, requireRole("admin"), async (req: AuthRequest, res: Response) => {
  const app = await prisma.restaurantApplication.findUnique({
    where: { id: req.params.id },
    include: { user: { select: { name: true, email: true, phone: true } } },
  });
  if (!app) { res.status(404).json({ success: false, error: "Application not found", code: "NOT_FOUND" }); return; }
  res.json({ success: true, data: app });
});

/** PATCH /applications/admin/restaurant/:id/approve */
router.patch("/admin/restaurant/:id/approve", authenticate, requireRole("admin"), async (req: AuthRequest, res: Response) => {
  try {
    const app = await prisma.restaurantApplication.findUnique({
      where: { id: req.params.id },
      include: { user: true },
    });
    if (!app) { res.status(404).json({ success: false, error: "Not found", code: "NOT_FOUND" }); return; }
    if (app.status === "approved") { res.status(409).json({ success: false, error: "Already approved", code: "ALREADY_APPROVED" }); return; }

    // Update application
    await prisma.restaurantApplication.update({
      where: { id: app.id },
      data: { status: "approved", reviewedBy: req.user!.id, reviewedAt: new Date() },
    });

    // Create restaurant record (if not exists)
    let restaurant = await prisma.restaurant.findFirst({ where: { ownerId: app.userId } });
    if (!restaurant) {
      restaurant = await prisma.restaurant.create({
        data: {
          ownerId: app.userId,
          name: app.restaurantName,
          description: app.description,
          cuisineTypes: app.cuisineTypes,
          address: `${app.address}, ${app.city}`,
          lat: 33.6844, lng: 73.0479,  // default coords — owner can update
          logo: app.logoUrl,
          banner: app.bannerUrl,
          isApproved: true,
          isOpen: true,
        },
      });
    } else {
      await prisma.restaurant.update({ where: { id: restaurant.id }, data: { isApproved: true, isOpen: true } });
    }

    // Grant restaurant role to user
    const user = await prisma.user.findUniqueOrThrow({ where: { id: app.userId } });
    const updatedRoles = user.roles.includes("restaurant") ? user.roles : [...user.roles, "restaurant"];
    await prisma.user.update({ where: { id: app.userId }, data: { roles: updatedRoles } });

    // Notify
    await prisma.notification.create({
      data: { userId: app.userId, type: "system", title: "Restaurant Approved! 🎉", message: `${app.restaurantName} is now live on SwiftByte!` },
    });
    sendRestaurantApplicationApproved(app.user.email, app.user.name, app.restaurantName);

    res.json({ success: true, data: { message: "Approved", restaurantId: restaurant.id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to approve", code: "SERVER_ERROR" });
  }
});

/** PATCH /applications/admin/restaurant/:id/reject */
router.patch("/admin/restaurant/:id/reject", authenticate, requireRole("admin"), async (req: AuthRequest, res: Response) => {
  const { adminNote } = req.body;
  if (!adminNote) { res.status(400).json({ success: false, error: "Rejection reason (adminNote) required", code: "VALIDATION_ERROR" }); return; }

  try {
    const app = await prisma.restaurantApplication.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { name: true, email: true } } },
    });
    if (!app) { res.status(404).json({ success: false, error: "Not found", code: "NOT_FOUND" }); return; }

    await prisma.restaurantApplication.update({
      where: { id: app.id },
      data: { status: "rejected", adminNote, reviewedBy: req.user!.id, reviewedAt: new Date() },
    });

    sendRestaurantApplicationRejected(app.user.email, app.user.name, app.restaurantName, adminNote);
    res.json({ success: true, data: { message: "Rejected" } });
  } catch {
    res.status(500).json({ success: false, error: "Failed to reject", code: "SERVER_ERROR" });
  }
});

/** PATCH /applications/admin/restaurant/:id/request-info */
router.patch("/admin/restaurant/:id/request-info", authenticate, requireRole("admin"), async (req: AuthRequest, res: Response) => {
  const { adminNote } = req.body;
  if (!adminNote) { res.status(400).json({ success: false, error: "Questions required in adminNote", code: "VALIDATION_ERROR" }); return; }

  try {
    const app = await prisma.restaurantApplication.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { name: true, email: true } } },
    });
    if (!app) { res.status(404).json({ success: false, error: "Not found", code: "NOT_FOUND" }); return; }

    await prisma.restaurantApplication.update({
      where: { id: app.id },
      data: { status: "more_info_required", adminNote },
    });

    sendRestaurantApplicationMoreInfo(app.user.email, app.user.name, app.restaurantName, adminNote);
    res.json({ success: true, data: { message: "More info requested" } });
  } catch {
    res.status(500).json({ success: false, error: "Failed to update", code: "SERVER_ERROR" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — RIDER APPLICATIONS
// ─────────────────────────────────────────────────────────────────────────────

/** GET /applications/admin/rider */
router.get("/admin/rider", authenticate, requireRole("admin"), async (req: AuthRequest, res: Response) => {
  const { status, page = "1", limit = "20" } = req.query as Record<string, string>;
  const where: any = {};
  if (status) where.status = status;

  const [apps, total] = await Promise.all([
    prisma.riderApplication.findMany({
      where,
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.riderApplication.count({ where }),
  ]);
  res.json({ success: true, data: { data: apps, total } });
});

/** PATCH /applications/admin/rider/:id/approve */
router.patch("/admin/rider/:id/approve", authenticate, requireRole("admin"), async (req: AuthRequest, res: Response) => {
  try {
    const app = await prisma.riderApplication.findUnique({
      where: { id: req.params.id },
      include: { user: true },
    });
    if (!app) { res.status(404).json({ success: false, error: "Not found", code: "NOT_FOUND" }); return; }

    await prisma.riderApplication.update({
      where: { id: app.id },
      data: { status: "approved", reviewedAt: new Date() },
    });

    // Create rider record
    const existingRider = await prisma.rider.findUnique({ where: { userId: app.userId } });
    if (!existingRider) {
      await prisma.rider.create({
        data: {
          userId: app.userId,
          vehicleType: app.vehicleType,
          isApproved: true,
          rating: 5.0,
        },
      });
    }

    // Grant rider role
    const user = await prisma.user.findUniqueOrThrow({ where: { id: app.userId } });
    const updatedRoles = user.roles.includes("rider") ? user.roles : [...user.roles, "rider"];
    await prisma.user.update({ where: { id: app.userId }, data: { roles: updatedRoles } });

    await prisma.notification.create({
      data: { userId: app.userId, type: "system", title: "Rider Application Approved! 🛵", message: "You're now a SwiftByte delivery rider. Start earning today!" },
    });
    sendRiderApplicationApproved(app.user.email, app.user.name);

    res.json({ success: true, data: { message: "Rider approved" } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to approve", code: "SERVER_ERROR" });
  }
});

/** PATCH /applications/admin/rider/:id/reject */
router.patch("/admin/rider/:id/reject", authenticate, requireRole("admin"), async (req: AuthRequest, res: Response) => {
  const { adminNote } = req.body;
  if (!adminNote) { res.status(400).json({ success: false, error: "Rejection reason required", code: "VALIDATION_ERROR" }); return; }

  try {
    const app = await prisma.riderApplication.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { name: true, email: true } } },
    });
    if (!app) { res.status(404).json({ success: false, error: "Not found", code: "NOT_FOUND" }); return; }

    await prisma.riderApplication.update({ where: { id: app.id }, data: { status: "rejected", adminNote, reviewedAt: new Date() } });
    sendRiderApplicationRejected(app.user.email, app.user.name, adminNote);
    res.json({ success: true, data: { message: "Rejected" } });
  } catch {
    res.status(500).json({ success: false, error: "Failed to reject", code: "SERVER_ERROR" });
  }
});

export default router;
