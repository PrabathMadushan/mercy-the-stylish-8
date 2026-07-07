import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

// Point the store at a throwaway temp directory before importing db.ts,
// since it reads DATA_DIR at module load time.
const tempDir = mkdtempSync(path.join(tmpdir(), "mercy-test-"));
process.env.DATA_DIR = tempDir;

const { initDb, productsDb, ordersDb } = await import("../src/db.js");

test("initDb seeds two starter products", async () => {
  await initDb();
  const products = await productsDb.all();
  assert.equal(products.length, 2);
});

test("creating a product adds it to the list", async () => {
  await initDb();
  const created = await productsDb.create({
    id: "test-1",
    name: "Test Blouse",
    price: 50000,
    category: "Tops",
    imageUrl: "",
    description: "A test product",
    stock: 3,
    createdAt: new Date().toISOString()
  });
  const found = await productsDb.find(created.id);
  assert.equal(found?.name, "Test Blouse");
});

test("updating a product's stock persists", async () => {
  const updated = await productsDb.update("test-1", { stock: 1 });
  assert.equal(updated?.stock, 1);
});

test("deleting a product removes it", async () => {
  const ok = await productsDb.remove("test-1");
  assert.equal(ok, true);
  const found = await productsDb.find("test-1");
  assert.equal(found, undefined);
});

test("creating an order stores it", async () => {
  const order = await ordersDb.create({
    id: "order-1",
    userEmail: "shopper@example.com",
    items: [{ productId: "seed-1", name: "Floral Wrap Dress", price: 120000, quantity: 1 }],
    total: 120000,
    status: "pending",
    createdAt: new Date().toISOString()
  });
  const all = await ordersDb.all();
  assert.equal(all.some((o) => o.id === order.id), true);
});

test.after(() => {
  rmSync(tempDir, { recursive: true, force: true });
});
