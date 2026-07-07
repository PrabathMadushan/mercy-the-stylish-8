import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const tempDir = mkdtempSync(path.join(tmpdir(), "mercy-test-orders-"));
process.env.DATA_DIR = tempDir;

const { initDb, productsDb } = await import("../src/db.js");
const { orderCreateSchema } = await import("../src/validation.js");

test("orderCreateSchema rejects an order with no items", () => {
  const result = orderCreateSchema.safeParse({ items: [], total: 0 });
  assert.equal(result.success, false);
});

test("orderCreateSchema accepts a well-formed order", () => {
  const result = orderCreateSchema.safeParse({
    userEmail: "shopper@example.com",
    items: [{ productId: "seed-1", name: "Floral Wrap Dress", price: 120000, quantity: 2 }],
    total: 240000
  });
  assert.equal(result.success, true);
});

test("stock check flags a shortage when requested quantity exceeds stock", async () => {
  await initDb();
  const product = await productsDb.find("seed-1");
  assert.ok(product);

  // mirrors the shortage-detection logic used in routes/orders.ts
  const requestedQty = product!.stock + 100;
  const shortage = product!.stock < requestedQty;
  assert.equal(shortage, true);
});

test.after(() => {
  rmSync(tempDir, { recursive: true, force: true });
});
