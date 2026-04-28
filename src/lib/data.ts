import type { SessionFilters, WorkoutSessionInput } from "@/domain/types";
import { createWorkoutService } from "@/server/services/service-factory";

const workoutService = createWorkoutService();

export function bootstrapData() {
  return workoutService.bootstrapData();
}

export function getDashboardData() {
  return workoutService.getDashboardData();
}

export function getSessions(filters?: SessionFilters) {
  return workoutService.getSessions(filters);
}

export function getSessionById(id: string) {
  return workoutService.getSessionById(id);
}

export function getExercises() {
  return workoutService.getExercises();
}

export function getExerciseById(id: string) {
  return workoutService.getExerciseById(id);
}

export function createSession(payload: WorkoutSessionInput) {
  return workoutService.createSession(payload);
}

export function updateSession(id: string, payload: WorkoutSessionInput, loggedBy?: string | null) {
  return workoutService.updateSession(id, payload, loggedBy);
}

export function deleteSession(id: string) {
  return workoutService.deleteSession(id);
}
