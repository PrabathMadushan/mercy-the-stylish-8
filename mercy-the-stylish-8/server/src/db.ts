import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { Product, Order } from "./types.js";

// This is a small JSON-file datastore so the app runs with zero external
// dependencies out of the box. For real production use, swap the read/write
// functions below for a proper database (Postgres/Prisma is a natural fit -
// see README.md "Going to production").

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "..", "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

async function ensureFile(file: string, defaultData: unknown) {
  try {
    await fs.access(file);
  } catch {
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, JSON.stringify(defaultData, null, 2));
  }
}

const seedProducts: Product[] = [
  {
    id: "seed-1",
    name: "Floral Wrap Dress",
    price: 120000,
    category: "Dresses",
    imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600",
    description: "A breezy floral wrap dress, perfect for daytime events.",
    stock: 8,
    createdAt: new Date().toISOString()
  },
  {
    id: "seed-2",
    name: "Chic Denim Jacket",
    price: 95000,
    category: "Outerwear",
    imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600",
    description: "A classic denim jacket that pairs with everything.",
    stock: 5,
    createdAt: new Date().toISOString()
  }
];

export async function initDb() {
  await ensureFile(PRODUCTS_FILE, seedProducts);
  await ensureFile(ORDERS_FILE, []);
}

async function readJson<T>(file: string): Promise<T> {
  const raw = await fs.readFile(file, "utf-8");
  return JSON.parse(raw) as T;
}

async function writeJson<T>(file: string, data: T) {
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

export const productsDb = {
  all: () => readJson<Product[]>(PRODUCTS_FILE),
  find: async (id: string) => (await readJson<Product[]>(PRODUCTS_FILE)).find((p) => p.id === id),
  create: async (product: Product) => {
    const all = await readJson<Product[]>(PRODUCTS_FILE);
    all.push(product);
    await writeJson(PRODUCTS_FILE, all);
    return product;
  },
  update: async (id: string, patch: Partial<Product>) => {
    const all = await readJson<Product[]>(PRODUCTS_FILE);
    const idx = all.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...patch };
    await writeJson(PRODUCTS_FILE, all);
    return all[idx];
  },
  remove: async (id: string) => {
    const all = await readJson<Product[]>(PRODUCTS_FILE);
    const next = all.filter((p) => p.id !== id);
    await writeJson(PRODUCTS_FILE, next);
    return next.length !== all.length;
  }
};

export const ordersDb = {
  all: () => readJson<Order[]>(ORDERS_FILE),
  create: async (order: Order) => {
    const all = await readJson<Order[]>(ORDERS_FILE);
    all.push(order);
    await writeJson(ORDERS_FILE, all);
    return order;
  },
  update: async (id: string, patch: Partial<Order>) => {
    const all = await readJson<Order[]>(ORDERS_FILE);
    const idx = all.findIndex((o) => o.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...patch };
    await writeJson(ORDERS_FILE, all);
    return all[idx];
  }
};
