import { Router } from "express";
import { v4 as uuid } from "uuid";
import { productsDb } from "../db.js";
import { requireAdmin, type AuthedRequest } from "../middleware/auth.js";
import { productCreateSchema, productUpdateSchema, formatZodError } from "../validation.js";
import { asyncHandler } from "../asyncHandler.js";
import type { PaginatedProducts } from "../types.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const category = typeof req.query.category === "string" ? req.query.category.trim() : "";
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const page = Math.max(1, parseInt(String(req.query.page || "1"), 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || "20"), 10) || 20));

    const result: PaginatedProducts = await productsDb.list({
      category: category || undefined,
      search: search || undefined,
      page,
      limit
    });
    res.json(result);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const product = await productsDb.find(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  })
);

router.post(
  "/",
  requireAdmin,
  asyncHandler(async (req: AuthedRequest, res) => {
    const parsed = productCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: formatZodError(parsed.error) });
    }
    const product = await productsDb.create({
      id: uuid(),
      createdAt: new Date().toISOString(),
      ...parsed.data
    });
    res.status(201).json(product);
  })
);

router.put(
  "/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const parsed = productUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: formatZodError(parsed.error) });
    }
    const patch = Object.fromEntries(Object.entries(parsed.data).filter(([, v]) => v !== undefined));
    const updated = await productsDb.update(req.params.id, patch);
    if (!updated) return res.status(404).json({ error: "Product not found" });
    res.json(updated);
  })
);

router.delete(
  "/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const ok = await productsDb.remove(req.params.id);
    if (!ok) return res.status(404).json({ error: "Product not found" });
    res.json({ success: true });
  })
);

export default router;
