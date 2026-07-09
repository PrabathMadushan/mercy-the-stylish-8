import type { OrderStatus, Prisma } from "./generated/prisma/client.js";
import { prisma, warmDbConnection } from "./lib/prisma.js";
import { seedProducts } from "./data/seedProducts.js";
import type { Product, Order, OrderItem } from "./types.js";

function mapProduct(p: {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl: string;
  description: string;
  stock: number;
  createdAt: Date;
}): Product {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    category: p.category,
    imageUrl: p.imageUrl,
    description: p.description,
    stock: p.stock,
    createdAt: p.createdAt.toISOString()
  };
}

function mapOrder(o: {
  id: string;
  userEmail: string;
  customerName: string | null;
  customerPhone: string | null;
  shippingAddress: string | null;
  total: number;
  status: OrderStatus;
  stripeSessionId: string | null;
  createdAt: Date;
  items: { productId: string; name: string; price: number; quantity: number }[];
}): Order {
  return {
    id: o.id,
    userEmail: o.userEmail,
    customerName: o.customerName ?? undefined,
    customerPhone: o.customerPhone ?? undefined,
    shippingAddress: o.shippingAddress ?? undefined,
    total: o.total,
    status: o.status,
    stripeSessionId: o.stripeSessionId ?? undefined,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((i) => ({
      productId: i.productId,
      name: i.name,
      price: i.price,
      quantity: i.quantity
    }))
  };
}

export async function initDb() {
  await warmDbConnection();
  const count = await prisma.product.count();
  if (count === 0) {
    await prisma.product.createMany({ data: seedProducts });
  }
}

function buildProductWhere(filters?: { category?: string; search?: string }): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {};

  const category = filters?.category?.trim();
  if (category && category.toLowerCase() !== "all") {
    where.category = { equals: category, mode: "insensitive" };
  }

  const search = filters?.search?.trim();
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } }
    ];
  }

  return where;
}

export const productsDb = {
  list: async (filters?: { category?: string; search?: string; page?: number; limit?: number }) => {
    const page = Math.max(1, filters?.page ?? 1);
    const limit = Math.min(50, Math.max(1, filters?.limit ?? 20));
    const where = buildProductWhere(filters);

    const [rows, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.product.count({ where })
    ]);

    return {
      items: rows.map(mapProduct),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit))
    };
  },
  all: async () => {
    const rows = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map(mapProduct);
  },
  find: async (id: string) => {
    const row = await prisma.product.findUnique({ where: { id } });
    return row ? mapProduct(row) : undefined;
  },
  create: async (product: Product) => {
    const row = await prisma.product.create({
      data: {
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        imageUrl: product.imageUrl,
        description: product.description,
        stock: product.stock,
        createdAt: new Date(product.createdAt)
      }
    });
    return mapProduct(row);
  },
  update: async (id: string, patch: Partial<Product>) => {
    try {
      const row = await prisma.product.update({
        where: { id },
        data: {
          ...(patch.name !== undefined && { name: patch.name }),
          ...(patch.price !== undefined && { price: patch.price }),
          ...(patch.category !== undefined && { category: patch.category }),
          ...(patch.imageUrl !== undefined && { imageUrl: patch.imageUrl }),
          ...(patch.description !== undefined && { description: patch.description }),
          ...(patch.stock !== undefined && { stock: patch.stock })
        }
      });
      return mapProduct(row);
    } catch {
      return null;
    }
  },
  remove: async (id: string) => {
    try {
      await prisma.product.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  },
  count: () => prisma.product.count(),
  lowStock: (threshold = 3) =>
    prisma.product.count({ where: { stock: { lte: threshold } } })
};

export const ordersDb = {
  all: async () => {
    const rows = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" }
    });
    return rows.map((o) =>
      mapOrder({
        ...o,
        items: o.items.map((i) => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          quantity: i.quantity
        }))
      })
    );
  },
  find: async (id: string) => {
    const row = await prisma.order.findUnique({ include: { items: true }, where: { id } });
    if (!row) return null;
    return mapOrder({
      ...row,
      items: row.items.map((i) => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity
      }))
    });
  },
  findByStripeSession: async (stripeSessionId: string) => {
    const row = await prisma.order.findUnique({
      include: { items: true },
      where: { stripeSessionId }
    });
    if (!row) return null;
    return mapOrder({
      ...row,
      items: row.items.map((i) => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity
      }))
    });
  },
  create: async (order: Order) => {
    const row = await prisma.order.create({
      data: {
        id: order.id,
        userEmail: order.userEmail,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        shippingAddress: order.shippingAddress,
        total: order.total,
        status: order.status,
        stripeSessionId: order.stripeSessionId,
        createdAt: new Date(order.createdAt),
        items: {
          create: order.items.map((item: OrderItem) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          }))
        }
      },
      include: { items: true }
    });
    return mapOrder({
      ...row,
      items: row.items.map((i) => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity
      }))
    });
  },
  update: async (id: string, patch: Partial<Order>) => {
    try {
      const row = await prisma.order.update({
        where: { id },
        data: {
          ...(patch.status !== undefined && { status: patch.status }),
          ...(patch.stripeSessionId !== undefined && { stripeSessionId: patch.stripeSessionId })
        },
        include: { items: true }
      });
      return mapOrder({
        ...row,
        items: row.items.map((i) => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          quantity: i.quantity
        }))
      });
    } catch {
      return null;
    }
  }
};
