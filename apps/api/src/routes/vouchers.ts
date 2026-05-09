import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { authenticate, requireRole, AuthRequest } from "../middleware/auth";

const router = Router();

// POST /vouchers/validate
router.post("/validate", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      res.status(400).json({ success: false, error: "Voucher code required" });
      return;
    }

    const voucher = await prisma.voucher.findFirst({
      where: {
        code: code.toUpperCase(),
        isActive: true,
        validFrom: { lte: new Date() },
        validTo: { gte: new Date() },
      },
    });

    if (!voucher) {
      res.status(404).json({ success: false, error: "Invalid or expired voucher code" });
      return;
    }

    if (voucher.usedCount >= voucher.usageLimit) {
      res.status(400).json({ success: false, error: "Voucher usage limit reached" });
      return;
    }

    if (subtotal && subtotal < voucher.minOrder) {
      res.status(400).json({
        success: false,
        error: `Minimum order of $${voucher.minOrder} required for this voucher`,
      });
      return;
    }

    const discount =
      voucher.type === "percentage"
        ? (subtotal * voucher.value) / 100
        : Math.min(voucher.value, subtotal || voucher.value);

    res.json({
      success: true,
      data: {
        code: voucher.code,
        type: voucher.type,
        value: voucher.value,
        discount: parseFloat(discount.toFixed(2)),
        minOrder: voucher.minOrder,
      },
    });
  } catch {
    res.status(500).json({ success: false, error: "Failed to validate voucher" });
  }
});

// GET /vouchers — admin list all
router.get("/", authenticate, requireRole("admin"), async (req: AuthRequest, res: Response) => {
  try {
    const vouchers = await prisma.voucher.findMany({ orderBy: { createdAt: "desc" } });
    res.json({ success: true, data: vouchers });
  } catch {
    res.status(500).json({ success: false, error: "Failed to fetch vouchers" });
  }
});

// POST /vouchers — admin create
router.post("/", authenticate, requireRole("admin"), async (req: AuthRequest, res: Response) => {
  try {
    const { code, type, value, minOrder, validFrom, validTo, usageLimit, restaurantId } = req.body;
    const voucher = await prisma.voucher.create({
      data: {
        code: code.toUpperCase(),
        type,
        value,
        minOrder: minOrder || 0,
        validFrom: new Date(validFrom),
        validTo: new Date(validTo),
        usageLimit: usageLimit || 100,
        restaurantId,
      },
    });
    res.status(201).json({ success: true, data: voucher });
  } catch {
    res.status(500).json({ success: false, error: "Failed to create voucher" });
  }
});

// DELETE /vouchers/:id
router.delete("/:id", authenticate, requireRole("admin"), async (req: AuthRequest, res: Response) => {
  try {
    await prisma.voucher.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ success: true, message: "Voucher deactivated" });
  } catch {
    res.status(500).json({ success: false, error: "Failed to deactivate voucher" });
  }
});

export default router;
