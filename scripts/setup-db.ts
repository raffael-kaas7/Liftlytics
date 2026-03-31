import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";
import { seedDatabase } from "../src/lib/db/seed";

const prisma = new PrismaClient();

async function main() {
  const migrationPath = join(process.cwd(), "prisma/migrations/202603312140_init/migration.sql");
  const sql = readFileSync(migrationPath, "utf8");
  const statements = sql
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  await prisma.$executeRawUnsafe("PRAGMA foreign_keys = ON");

  for (const statement of statements) {
    const sqlToRun = statement.replace(/^--.*$/gm, "").trim();
    if (sqlToRun) {
      await prisma.$executeRawUnsafe(sqlToRun);
    }
  }

  await seedDatabase(prisma);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
