import { Router, Request, Response } from "express";
import Stripe from "stripe";
import { prisma } from "../lib/prisma";
import { authenticate, requireRole, AuthRequest } from "../middleware/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2024-06-20",
});

const router = Router();

// POST /payments/intent — create Stripe payment intent
router.post("/intent", authenticate, requireRole("customer"), async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.body;

    const order = await prisma.order.findFirst({
      where: { id: orderId, customerId: req.user!.id },
    });

    if (!order) {
      res.status(404).json({ success: false, error: "Order not found" });
      return;
    }

    if (order.isPaid) {
      res.status(400).json({ success: false, error: "Order already paid" });
      return;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100), // cents
      currency: "usd",
      metadata: { orderId: order.id, customerId: req.user!.id },
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { paymentIntentId: paymentIntent.id },
    });

    res.json({
      success: true,
      data: { clientSecret: paymentIntent.client_secret },
    });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ success: false, error: "Failed to create payment intent" });
  }
});

// POST /payments/webhook — Stripe webhook handler
router.post("/webhook", async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch {
    res.status(400).json({ error: "Invalid webhook signature" });
    return;
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const orderId = paymentIntent.metadata.orderId;

    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: { isPaid: true, status: "confirmed" },
      });
    }
  }

  res.json({ received: true });
});

// GET /payments/history
router.get("/history", authenticate, requireRole("customer"), async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { customerId: req.user!.id, isPaid: true },
      select: {
        id: true,
        total: true,
        paymentMethod: true,
        paymentIntentId: true,
        createdAt: true,
        restaurant: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    res.json({ success: true, data: orders });
  } catch {
    res.status(500).json({ success: false, error: "Failed to fetch payment history" });
  }
});

export default router;
