import { Router } from "express";
import type { Request, Response } from "express";
import { ordersDb } from "../db.js";
import { env } from "../config/env.js";
import { decrementStock } from "../services/orderService.js";
import { getStripe } from "../services/stripeService.js";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const stripe = getStripe();
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
    return res.status(503).json({ error: "Stripe webhook is not configured" });
  }

  const sig = req.headers["stripe-signature"];
  if (!sig || typeof sig !== "string") {
    return res.status(400).json({ error: "Missing stripe-signature header" });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    console.error("Stripe webhook signature error:", message);
    return res.status(400).json({ error: `Webhook Error: ${message}` });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    if (!orderId) {
      console.error("Stripe session missing orderId metadata");
      return res.json({ received: true });
    }

    const order = await ordersDb.find(orderId);
    if (!order) {
      console.error("Order not found for Stripe session:", orderId);
      return res.json({ received: true });
    }

    if (order.status === "pending_payment") {
      await decrementStock(order.items);
      await ordersDb.update(orderId, { status: "paid", stripeSessionId: session.id });
      console.log("Order paid:", orderId);
    }
  }

  res.json({ received: true });
});

export default router;
