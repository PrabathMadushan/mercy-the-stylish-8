import { Router } from "express";
import { v4 as uuid } from "uuid";
import { productsDb } from "../db.js";
import { requireAdmin, type AuthedRequest } from "../middleware/auth.js";
import { productCreateSchema, productUpdateSchema, formatZodError } from "../validation.js";
import { asyncHandler } from "../asyncHandler.js";

const router = Router();

// GET /api/products?category=Dresses&search=floral
router.get(
  "/",
  asyncHandler(async (req, res) => {
    let products = await productsDb.all();

    const category = typeof req.query.category === "string" ? req.query.category.trim().toLowerCase() : "";
    const search = typeof req.query.search === "string" ? req.query.search.trim().toLowerCase() : "";

    if (category && category !== "all") {
      products = products.filter((p) => p.category.toLowerCase() === category);
    }
    if (search) {
      products = products.filter(
        (p) => p.name.toLowerCase().includes(search) || p.description.toLowerCase().includes(search)
      );
    }

    res.json(products);
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
    // Only apply keys that were actually provided - guards against any key
    // coming through as an explicit `undefined` overwriting existing data.
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
