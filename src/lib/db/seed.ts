import { PrismaClient } from "@prisma/client";
import { exerciseSeeds } from "@/domain/seed-data";

export async function seedDatabase(prisma: PrismaClient) {
  for (const exercise of exerciseSeeds) {
    await prisma.exercise.upsert({
      where: { name: exercise.name },
      update: exercise,
      create: exercise
    });
  }
}

export async function ensureSeedData(prisma: PrismaClient) {
  const exerciseCount = await prisma.exercise.count();
  if (exerciseCount === 0) {
    await seedDatabase(prisma);
    return;
  }

  const sessionCount = await prisma.workoutSession.count();
  if (sessionCount === 0) {
    await seedDatabase(prisma);
  }
}
