import { test } from "node:test";
import assert from "node:assert/strict";
import { checkoutSessionSchema } from "../src/validation.js";

test("checkout session requires customer details and items", () => {
  const result = checkoutSessionSchema.safeParse({
    items: [{ productId: "p1", quantity: 1 }],
    customerName: "Jane",
    customerPhone: "+256700000000",
    shippingAddress: "Plot 12, Kampala"
  });
  assert.equal(result.success, true);
});

test("checkout session rejects empty address", () => {
  const result = checkoutSessionSchema.safeParse({
    items: [{ productId: "p1", quantity: 1 }],
    customerName: "Jane",
    customerPhone: "+256700000000",
    shippingAddress: ""
  });
  assert.equal(result.success, false);
});
