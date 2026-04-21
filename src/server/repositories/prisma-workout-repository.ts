import { endOfDay, startOfDay } from "date-fns";
import type { PrismaClient } from "@prisma/client";
import type {
  Exercise,
  ExerciseDetail,
  SessionFilters,
  WorkoutSession,
  WorkoutSessionInput
} from "@/domain/types";
import { ensureSeedData } from "@/lib/db/seed";
import type { WorkoutRepository } from "./workout-repository";

export class PrismaWorkoutRepository implements WorkoutRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async ensureSeedData() {
    await ensureSeedData(this.prisma);
  }

  async listAllSessions(): Promise<WorkoutSession[]> {
    await this.ensureSeedData();
    return this.prisma.workoutSession.findMany({
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
  }

  async listSessions(filters?: SessionFilters): Promise<WorkoutSession[]> {
    await this.ensureSeedData();

    return this.prisma.workoutSession.findMany({
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
  }

  async getSessionById(id: string): Promise<WorkoutSession | null> {
    await this.ensureSeedData();
    return this.prisma.workoutSession.findUnique({
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

  async listExercises(): Promise<Exercise[]> {
    await this.ensureSeedData();
    return this.prisma.exercise.findMany({
      orderBy: [{ name: "asc" }]
    });
  }

  async getExerciseById(id: string): Promise<ExerciseDetail | null> {
    await this.ensureSeedData();
    return this.prisma.exercise.findUnique({
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

  async createSession(payload: WorkoutSessionInput): Promise<{ id: string }> {
    const session = await this.prisma.$transaction(async (tx) => {
      const createdSession = await tx.workoutSession.create({
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
            sessionId: createdSession.id,
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

      return createdSession;
    });

    return { id: session.id };
  }

  async updateSession(id: string, payload: WorkoutSessionInput): Promise<{ id: string }> {
    await this.prisma.$transaction(async (tx) => {
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

    return { id };
  }

  async deleteSession(id: string): Promise<void> {
    await this.prisma.workoutSession.delete({
      where: { id }
    });
  }
}
