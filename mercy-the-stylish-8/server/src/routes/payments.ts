import { Router } from "express";
import { v4 as uuid } from "uuid";
import { ordersDb } from "../db.js";
import { env } from "../config/env.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { checkoutSessionSchema, formatZodError } from "../validation.js";
import { asyncHandler } from "../asyncHandler.js";
import {
  buildOrderItemsFromRequest,
  calculateTotal,
  validateStock
} from "../services/orderService.js";
import { getStripe, isStripeConfigured } from "../services/stripeService.js";

const router = Router();

router.post(
  "/create-checkout-session",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    if (!isStripeConfigured()) {
      return res.status(503).json({ error: "Stripe is not configured on this server" });
    }

    const parsed = checkoutSessionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: formatZodError(parsed.error) });
    }

    const { items, customerName, customerPhone, shippingAddress } = parsed.data;
    const shortages = await validateStock(items);
    if (shortages.length) {
      return res.status(409).json({ error: shortages.join("; ") });
    }

    const orderItems = await buildOrderItemsFromRequest(items);
    const total = calculateTotal(orderItems);
    const orderId = uuid();

    const order = await ordersDb.create({
      id: orderId,
      userEmail: req.user!.email,
      customerName,
      customerPhone,
      shippingAddress,
      items: orderItems,
      total,
      status: "pending_payment",
      createdAt: new Date().toISOString()
    });

    const stripe = getStripe()!;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${env.FRONTEND_URL}/checkout/success?orderId=${orderId}`,
      cancel_url: `${env.FRONTEND_URL}/checkout/cancel?orderId=${orderId}`,
      customer_email: req.user!.email,
      metadata: { orderId },
      line_items: orderItems.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "ugx",
          unit_amount: item.price,
          product_data: { name: item.name }
        }
      }))
    });

    await ordersDb.update(orderId, { stripeSessionId: session.id });

    res.json({ url: session.url, orderId: order.id });
  })
);

export default router;
