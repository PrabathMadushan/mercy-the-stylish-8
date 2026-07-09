import { PrismaClient } from "../src/generated/prisma/client.js";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  for (const product of seedProducts) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: product,
      create: product
    });
  }
  console.log(`Seeded ${seedProducts.length} products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
