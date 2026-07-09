import { Router } from "express";
import { ordersDb } from "../db.js";
import { requireAdmin, requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { orderStatusSchema, formatZodError } from "../validation.js";
import { asyncHandler } from "../asyncHandler.js";
import { restoreStock } from "../services/orderService.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const all = await ordersDb.all();
    const visible = req.user!.isAdmin ? all : all.filter((o) => o.userEmail === req.user!.email);
    res.json(visible);
  })
);

router.get(
  "/:id",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const order = await ordersDb.find(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (!req.user!.isAdmin && order.userEmail !== req.user!.email) {
      return res.status(403).json({ error: "You do not have access to this order" });
    }
    res.json(order);
  })
);

router.put(
  "/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const parsed = orderStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: formatZodError(parsed.error) });
    }

    const existing = await ordersDb.find(req.params.id);
    if (!existing) return res.status(404).json({ error: "Order not found" });

    const newStatus = parsed.data.status;
    const wasPaid =
      existing.status === "paid" ||
      existing.status === "confirmed" ||
      existing.status === "shipped" ||
      existing.status === "delivered";

    if (newStatus === "cancelled" && wasPaid) {
      await restoreStock(existing.items);
    }

    const updated = await ordersDb.update(req.params.id, { status: newStatus });
    res.json(updated);
  })
);

export default router;
