import { test } from "node:test";
import assert from "node:assert/strict";
import { aggregateQuantities } from "../src/services/stockUtils.js";

test("duplicate line items for the same product are summed", () => {
  const totals = aggregateQuantities([
    { productId: "X", quantity: 3 },
    { productId: "X", quantity: 3 }
  ]);
  assert.equal(totals.get("X"), 6);
});
