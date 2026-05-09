import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const addresses = await prisma.address.findMany({ where: { userId: req.user!.id } });
    res.json({ success: true, data: addresses });
  } catch {
    res.status(500).json({ success: false, error: "Failed to fetch addresses" });
  }
});

router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { label, lat, lng, fullAddress, isDefault } = req.body;

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user!.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: { userId: req.user!.id, label, lat, lng, fullAddress, isDefault: isDefault || false },
    });
    res.status(201).json({ success: true, data: address });
  } catch {
    res.status(500).json({ success: false, error: "Failed to add address" });
  }
});

router.patch("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { label, lat, lng, fullAddress, isDefault } = req.body;

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user!.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id: req.params.id, userId: req.user!.id } as any,
      data: { label, lat, lng, fullAddress, isDefault },
    });
    res.json({ success: true, data: address });
  } catch {
    res.status(500).json({ success: false, error: "Failed to update address" });
  }
});

router.delete("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.address.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Address deleted" });
  } catch {
    res.status(500).json({ success: false, error: "Failed to delete address" });
  }
});

export default router;
