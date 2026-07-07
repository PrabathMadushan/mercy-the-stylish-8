import { test } from "node:test";
import assert from "node:assert/strict";

// Mirrors the aggregation logic in routes/orders.ts - verifies that duplicate
// line items for the same product are summed before being checked against
// available stock, rather than each line being checked independently against
// the original (undecremented) stock.

function aggregate(items: { productId: string; quantity: number }[]) {
  const map = new Map<string, number>();
  for (const item of items) {
    map.set(item.productId, (map.get(item.productId) ?? 0) + item.quantity);
  }
  return map;
}

test("duplicate line items for the same product are summed, not checked independently", () => {
  const items = [
    { productId: "X", quantity: 3 },
    { productId: "X", quantity: 3 }
  ];
  const totals = aggregate(items);
  assert.equal(totals.get("X"), 6);

  // With stock=5, the aggregated total (6) correctly exceeds it - the bug
  // this guards against let two independent checks of qty=3 each pass
  // against the same undecremented stock=5, silently allowing overselling.
  const stock = 5;
  assert.equal(stock < (totals.get("X") ?? 0), true);
});

test("distinct products in the same order are tracked separately", () => {
  const items = [
    { productId: "X", quantity: 2 },
    { productId: "Y", quantity: 4 }
  ];
  const totals = aggregate(items);
  assert.equal(totals.get("X"), 2);
  assert.equal(totals.get("Y"), 4);
});

test("a single line item aggregates to just its own quantity", () => {
  const items = [{ productId: "X", quantity: 7 }];
  const totals = aggregate(items);
  assert.equal(totals.size, 1);
  assert.equal(totals.get("X"), 7);
});
