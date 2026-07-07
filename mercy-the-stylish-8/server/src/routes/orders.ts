import { Router } from "express";
import { v4 as uuid } from "uuid";
import { ordersDb, productsDb } from "../db.js";
import { requireAdmin, type AuthedRequest } from "../middleware/auth.js";
import { orderCreateSchema, orderStatusSchema, formatZodError } from "../validation.js";
import { asyncHandler } from "../asyncHandler.js";

const router = Router();

// Admins see every order; signed-in customers see only their own.
router.get(
  "/",
  asyncHandler(async (req: AuthedRequest, res) => {
    if (!req.user) return res.status(401).json({ error: "Sign in required" });
    const all = await ordersDb.all();
    const visible = req.user.isAdmin ? all : all.filter((o) => o.userEmail === req.user!.email);
    res.json(visible);
  })
);

router.post(
  "/",
  asyncHandler(async (req: AuthedRequest, res) => {
    if (!req.user) return res.status(401).json({ error: "Sign in required" });

    const parsed = orderCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: formatZodError(parsed.error) });
    }
    const { items, total, userEmail } = parsed.data;

    // Aggregate by productId first - if the same product appears more than
    // once in `items` (a duplicate line item), we must check/decrement the
    // TOTAL requested quantity, not each line independently. Checking each
    // line against the current (undecremented) stock would let duplicate
    // lines bypass the shortage check and push stock negative.
    const requestedByProduct = new Map<string, number>();
    for (const item of items) {
      requestedByProduct.set(item.productId, (requestedByProduct.get(item.productId) ?? 0) + item.quantity);
    }

    const shortages: string[] = [];
    for (const [productId, requestedQty] of requestedByProduct) {
      const product = await productsDb.find(productId);
      if (!product) {
        shortages.push(`One of the items in this order is no longer available`);
      } else if (product.stock < requestedQty) {
        shortages.push(`Only ${product.stock} left of ${product.name} (requested ${requestedQty})`);
      }
    }
    if (shortages.length) {
      return res.status(409).json({ error: shortages.join("; ") });
    }

    for (const [productId, requestedQty] of requestedByProduct) {
      const product = await productsDb.find(productId);
      if (product) {
        await productsDb.update(product.id, { stock: product.stock - requestedQty });
      }
    }

    const order = await ordersDb.create({
      id: uuid(),
      userEmail: userEmail || req.user.email,
      items,
      total,
      status: "pending",
      createdAt: new Date().toISOString()
    });
    res.status(201).json(order);
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
    const updated = await ordersDb.update(req.params.id, { status: parsed.data.status });
    if (!updated) return res.status(404).json({ error: "Order not found" });
    res.json(updated);
  })
);

export default router;
