import { endOfDay, startOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";
import { ensureSeedData } from "@/lib/db/seed";
import type { WorkoutSessionPayload } from "@/lib/validation";

export async function bootstrapData() {
  await ensureSeedData(prisma);
}

export async function getDashboardData() {
  await bootstrapData();

  const sessions = await prisma.workoutSession.findMany({
    orderBy: { date: "desc" },
    include: {
      entries: {
        include: {
          exercise: true,
          sets: {
            orderBy: { setNumber: "asc" }
          }
        }
      }
    }
  });

  return sessions;
}

export async function getSessions(filters?: {
  exercise?: string;
  from?: string;
  to?: string;
}) {
  await bootstrapData();

  const sessions = await prisma.workoutSession.findMany({
    where: {
      date:
        filters?.from || filters?.to
          ? {
              gte: filters.from ? startOfDay(new Date(filters.from)) : undefined,
              lte: filters.to ? endOfDay(new Date(filters.to)) : undefined
            }
          : undefined,
      entries: filters?.exercise
        ? {
            some: {
              exercise: {
                name: {
                  contains: filters.exercise
                }
              }
            }
          }
        : undefined
    },
    orderBy: { date: "desc" },
    include: {
      entries: {
        orderBy: { orderIndex: "asc" },
        include: {
          exercise: true,
          sets: {
            orderBy: { setNumber: "asc" }
          }
        }
      }
    }
  });

  return sessions;
}

export async function getSessionById(id: string) {
  await bootstrapData();
  return prisma.workoutSession.findUnique({
    where: { id },
    include: {
      entries: {
        orderBy: { orderIndex: "asc" },
        include: {
          exercise: true,
          sets: {
            orderBy: { setNumber: "asc" }
          }
        }
      }
    }
  });
}

export async function getExercises() {
  await bootstrapData();
  return prisma.exercise.findMany({
    orderBy: [{ name: "asc" }]
  });
}

export async function getExerciseById(id: string) {
  await bootstrapData();
  return prisma.exercise.findUnique({
    where: { id },
    include: {
      entries: {
        orderBy: [{ session: { date: "desc" } }],
        include: {
          session: true,
          sets: {
            orderBy: { setNumber: "asc" }
          }
        }
      }
    }
  });
}

export async function createSession(payload: WorkoutSessionPayload) {
  return prisma.$transaction(async (tx) => {
    const session = await tx.workoutSession.create({
      data: {
        date: new Date(payload.date),
        notes: payload.notes || undefined
      }
    });

    for (const exercise of payload.exercises.sort((a, b) => a.orderIndex - b.orderIndex)) {
      const exerciseId = exercise.exerciseId
        ? exercise.exerciseId
        : (
            await tx.exercise.upsert({
              where: { name: exercise.exerciseName! },
              update: {
                category: exercise.category || undefined,
                isCompound: exercise.isCompound ?? false
              },
              create: {
                name: exercise.exerciseName!,
                category: exercise.category || undefined,
                isCompound: exercise.isCompound ?? false
              }
            })
          ).id;

      await tx.exerciseEntry.create({
        data: {
          sessionId: session.id,
          exerciseId,
          notes: exercise.notes || undefined,
          orderIndex: exercise.orderIndex,
          sets: {
            create: exercise.sets.map((set, setIndex) => ({
              setNumber: setIndex + 1,
              reps: set.reps,
              weight: set.weight,
              notes: set.notes || undefined,
              isWarmup: set.isWarmup ?? false
            }))
          }
        }
      });
    }

    return session;
  });
}

export async function updateSession(id: string, payload: WorkoutSessionPayload) {
  return prisma.$transaction(async (tx) => {
    await tx.exerciseSet.deleteMany({
      where: {
        exerciseEntry: {
          sessionId: id
        }
      }
    });

    await tx.exerciseEntry.deleteMany({
      where: { sessionId: id }
    });

    await tx.workoutSession.update({
      where: { id },
      data: {
        date: new Date(payload.date),
        notes: payload.notes || undefined
      }
    });

    for (const exercise of payload.exercises.sort((a, b) => a.orderIndex - b.orderIndex)) {
      const exerciseId = exercise.exerciseId
        ? exercise.exerciseId
        : (
            await tx.exercise.upsert({
              where: { name: exercise.exerciseName! },
              update: {
                category: exercise.category || undefined,
                isCompound: exercise.isCompound ?? false
              },
              create: {
                name: exercise.exerciseName!,
                category: exercise.category || undefined,
                isCompound: exercise.isCompound ?? false
              }
            })
          ).id;

      await tx.exerciseEntry.create({
        data: {
          sessionId: id,
          exerciseId,
          notes: exercise.notes || undefined,
          orderIndex: exercise.orderIndex,
          sets: {
            create: exercise.sets.map((set, setIndex) => ({
              setNumber: setIndex + 1,
              reps: set.reps,
              weight: set.weight,
              notes: set.notes || undefined,
              isWarmup: set.isWarmup ?? false
            }))
          }
        }
      });
    }
  });
}

export async function deleteSession(id: string) {
  await prisma.workoutSession.delete({
    where: { id }
  });
}
