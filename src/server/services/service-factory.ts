import { prisma } from "@/lib/prisma";
import { PrismaWorkoutRepository } from "@/server/repositories/prisma-workout-repository";
import { WorkoutService } from "@/server/services/workout-service";

export function createWorkoutService() {
  return new WorkoutService(new PrismaWorkoutRepository(prisma));
}
