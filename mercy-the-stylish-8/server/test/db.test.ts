import { test } from "node:test";
import assert from "node:assert/strict";
import { aggregateQuantities, calculateTotal } from "../src/services/stockUtils.js";

test("aggregateQuantities sums duplicate product lines", () => {
  const totals = aggregateQuantities([
    { productId: "X", quantity: 3 },
    { productId: "X", quantity: 3 }
  ]);
  assert.equal(totals.get("X"), 6);
});

test("calculateTotal multiplies price by quantity", () => {
  const total = calculateTotal([
    { price: 100000, quantity: 2 },
    { price: 50000, quantity: 1 }
  ]);
  assert.equal(total, 250000);
});
