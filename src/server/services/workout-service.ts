import type { SessionFilters, WorkoutSessionInput } from "@/domain/types";
import { workoutSessionSchema } from "@/domain/validation";
import type { WorkoutRepository } from "@/server/repositories/workout-repository";

export class WorkoutService {
  constructor(private readonly repository: WorkoutRepository) {}

  bootstrapData() {
    return this.repository.ensureSeedData();
  }

  getDashboardData() {
    return this.repository.listAllSessions();
  }

  getSessions(filters?: SessionFilters) {
    return this.repository.listSessions(filters);
  }

  getSessionById(id: string) {
    return this.repository.getSessionById(id);
  }

  getExercises() {
    return this.repository.listExercises();
  }

  getExerciseById(id: string) {
    return this.repository.getExerciseById(id);
  }

  createSession(payload: WorkoutSessionInput) {
    const parsed = workoutSessionSchema.parse(payload);
    return this.repository.createSession(parsed);
  }

  updateSession(id: string, payload: WorkoutSessionInput) {
    const parsed = workoutSessionSchema.parse(payload);
    return this.repository.updateSession(id, parsed);
  }

  deleteSession(id: string) {
    return this.repository.deleteSession(id);
  }
}
