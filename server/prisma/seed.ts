import "dotenv";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
async function main() {
  // Categories are household-owned, so global category seeding is not
  // appropriate. The application will call this logic when a household is
  // created.
  console.log("Database seed: no global records required.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
