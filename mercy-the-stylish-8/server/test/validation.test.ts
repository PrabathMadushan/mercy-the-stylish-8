import { test } from "node:test";
import assert from "node:assert/strict";
import { productCreateSchema, productUpdateSchema } from "../src/validation.js";

test("an empty category string falls back to the default instead of failing validation", () => {
  const result = productCreateSchema.safeParse({
    name: "Test Dress",
    price: 50000,
    category: "", // e.g. an unfilled form field - this used to be rejected
    imageUrl: "",
    description: "",
    stock: 5
  });
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.category, "Uncategorized");
    assert.equal(result.data.imageUrl, "");
    assert.equal(result.data.description, "");
  }
});

test("a real category value is kept and trimmed, not overwritten by the default", () => {
  const result = productCreateSchema.safeParse({
    name: "Test Dress",
    price: 50000,
    category: "  Dresses  ",
    stock: 5
  });
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.category, "Dresses");
  }
});

test("an omitted category (key entirely missing) also falls back to the default", () => {
  const result = productCreateSchema.safeParse({
    name: "Test Dress",
    price: 50000,
    stock: 5
  });
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.category, "Uncategorized");
  }
});

test("required fields (name, price) are still rejected when missing - no default masks them", () => {
  const result = productCreateSchema.safeParse({ category: "Dresses" });
  assert.equal(result.success, false);
});

test("partial update schema accepts a sparse patch without requiring every field", () => {
  const result = productUpdateSchema.safeParse({ stock: 3 });
  assert.equal(result.success, true);
});
