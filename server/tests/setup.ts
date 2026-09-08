import "dotenv/config";
import { beforeAll, afterAll, afterEach } from "vitest";
import { prisma } from "../src/db/prisma.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set.");
}

if (!process.env.DATABASE_URL.includes("_test")) {
  throw new Error(
    "Refusing to run tests: DATABASE_URL must point to a database whose name contains '_test'."
  );
}

process.env.NODE_ENV = "test";

beforeAll(async () => {
  await prisma.$connect();
});

afterEach(async () => {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "transactions",
      "categories",
      "accounts",
      "household_members",
      "households",
      "users"
    RESTART IDENTITY CASCADE;
  `);
});

afterAll(async () => {
  await prisma.$disconnect();
});
