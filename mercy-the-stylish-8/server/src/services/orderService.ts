import { productsDb } from "../db.js";
import { aggregateQuantities, calculateTotal } from "./stockUtils.js";

export { aggregateQuantities, calculateTotal };

export async function validateStock(items: { productId: string; quantity: number }[]) {
  const requestedByProduct = aggregateQuantities(items);
  const shortages: string[] = [];

  for (const [productId, requestedQty] of requestedByProduct) {
    const product = await productsDb.find(productId);
    if (!product) {
      shortages.push("One of the items in this order is no longer available");
    } else if (product.stock < requestedQty) {
      shortages.push(`Only ${product.stock} left of ${product.name} (requested ${requestedQty})`);
    }
  }

  return shortages;
}

export async function buildOrderItemsFromRequest(
  items: { productId: string; quantity: number }[]
) {
  const validated: { productId: string; name: string; price: number; quantity: number }[] = [];

  for (const item of items) {
    const product = await productsDb.find(item.productId);
    if (!product) {
      throw new Error(`Product ${item.productId} is no longer available`);
    }
    validated.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: item.quantity
    });
  }

  return validated;
}

export async function decrementStock(items: { productId: string; quantity: number }[]) {
  const requestedByProduct = aggregateQuantities(items);
  for (const [productId, requestedQty] of requestedByProduct) {
    const product = await productsDb.find(productId);
    if (product) {
      await productsDb.update(product.id, { stock: product.stock - requestedQty });
    }
  }
}

export async function restoreStock(items: { productId: string; quantity: number }[]) {
  const requestedByProduct = aggregateQuantities(items);
  for (const [productId, requestedQty] of requestedByProduct) {
    const product = await productsDb.find(productId);
    if (product) {
      await productsDb.update(product.id, { stock: product.stock + requestedQty });
    }
  }
}
