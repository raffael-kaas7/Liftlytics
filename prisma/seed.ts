import { PrismaClient } from "@prisma/client";
import { seedDatabase } from "../src/lib/db/seed";

const prisma = new PrismaClient();

async function main() {
  await seedDatabase(prisma);
}

main()
  .catch(async (error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
