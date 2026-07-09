import { Router } from "express";
import { ordersDb, productsDb } from "../db.js";
import { requireAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../asyncHandler.js";
import type { AdminStats } from "../types.js";

const router = Router();

router.get(
  "/stats",
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const orders = await ordersDb.all();
    const paidStatuses = new Set(["paid", "confirmed", "shipped", "delivered"]);

    const stats: AdminStats = {
      totalOrders: orders.length,
      paidOrders: orders.filter((o) => paidStatuses.has(o.status)).length,
      pendingOrders: orders.filter((o) => o.status === "pending_payment").length,
      revenue: orders
        .filter((o) => paidStatuses.has(o.status))
        .reduce((sum, o) => sum + o.total, 0),
      lowStockCount: await productsDb.lowStock(3),
      productCount: await productsDb.count()
    };

    res.json(stats);
  })
);

export default router;
