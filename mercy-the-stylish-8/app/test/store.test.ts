import { test } from "node:test";
import assert from "node:assert/strict";
import { store } from "../src/store.js";
import type { Product } from "../src/types.js";

const sampleProduct: Product = {
  id: "p1",
  name: "Sample Dress",
  price: 100000,
  category: "Dresses",
  imageUrl: "",
  description: "",
  stock: 5,
  createdAt: new Date().toISOString()
};

test("addToCart adds a new item", () => {
  store.cart = [];
  store.addToCart(sampleProduct, 2);
  assert.equal(store.cart.length, 1);
  assert.equal(store.cart[0].quantity, 2);
});

test("addToCart increments quantity for an existing item", () => {
  store.cart = [];
  store.addToCart(sampleProduct, 1);
  store.addToCart(sampleProduct, 3);
  assert.equal(store.cart.length, 1);
  assert.equal(store.cart[0].quantity, 4);
});

test("cartTotal multiplies price by quantity across items", () => {
  store.cart = [];
  store.addToCart(sampleProduct, 3);
  assert.equal(store.cartTotal(), 300000);
});

test("removeFromCart removes the matching product", () => {
  store.cart = [];
  store.addToCart(sampleProduct, 1);
  store.removeFromCart(sampleProduct.id);
  assert.equal(store.cart.length, 0);
});

test("clearCart empties the cart", () => {
  store.cart = [];
  store.addToCart(sampleProduct, 2);
  store.clearCart();
  assert.equal(store.cart.length, 0);
  assert.equal(store.cartTotal(), 0);
});
