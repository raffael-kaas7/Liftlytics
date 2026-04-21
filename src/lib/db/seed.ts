import { PrismaClient } from "@prisma/client";
import { exerciseSeeds, getSampleSessions } from "@/domain/seed-data";

export async function seedDatabase(prisma: PrismaClient) {
  for (const exercise of exerciseSeeds) {
    await prisma.exercise.upsert({
      where: { name: exercise.name },
      update: exercise,
      create: exercise
    });
  }

  const existingSessions = await prisma.workoutSession.count();
  if (existingSessions > 0) {
    return;
  }

  const exercises = await prisma.exercise.findMany();
  const byName = new Map(exercises.map((exercise) => [exercise.name, exercise]));

  for (const session of getSampleSessions()) {
    await prisma.workoutSession.create({
      data: {
        date: session.date,
        notes: session.notes,
        entries: {
          create: session.exercises.map((exercise, exerciseIndex) => ({
            orderIndex: exerciseIndex,
            notes: exercise.notes,
            exerciseId: byName.get(exercise.name)!.id,
            sets: {
              create: exercise.sets.map((set, setIndex) => ({
                setNumber: setIndex + 1,
                reps: set.reps,
                weight: set.weight,
                notes: set.notes,
                isWarmup: set.isWarmup ?? false
              }))
            }
          }))
        }
      }
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
