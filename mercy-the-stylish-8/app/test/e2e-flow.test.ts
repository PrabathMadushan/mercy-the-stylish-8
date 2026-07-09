import { test } from "node:test";
import assert from "node:assert/strict";

test("MVP user flow steps are defined", () => {
  const flow = [
    "browse products",
    "add to cart",
    "sign in",
    "checkout with address",
    "stripe payment",
    "view order"
  ];
  assert.equal(flow.length, 6);
  assert.ok(flow.includes("stripe payment"));
});
