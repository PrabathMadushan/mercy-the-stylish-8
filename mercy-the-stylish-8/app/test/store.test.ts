import { test } from "node:test";
import assert from "node:assert/strict";

const sampleProduct = {
  id: "p1",
  name: "Sample Dress",
  price: 100000,
  category: "Dresses",
  imageUrl: "",
  description: "",
  stock: 5,
  createdAt: new Date().toISOString()
};

function cartTotal(items: { product: typeof sampleProduct; quantity: number }[]) {
  return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}

test("cart total multiplies price by quantity", () => {
  const items = [{ product: sampleProduct, quantity: 3 }];
  assert.equal(cartTotal(items), 300000);
});

test("cart count sums quantities", () => {
  const items = [
    { product: sampleProduct, quantity: 2 },
    { product: { ...sampleProduct, id: "p2" }, quantity: 1 }
  ];
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  assert.equal(count, 3);
});
