import type {
  Exercise,
  ExerciseDetail,
  SessionFilters,
  WorkoutSession,
  WorkoutSessionInput
} from "@/domain/types";

export interface WorkoutRepository {
  ensureSeedData(): Promise<void>;
  listSessions(filters?: SessionFilters): Promise<WorkoutSession[]>;
  listAllSessions(): Promise<WorkoutSession[]>;
  getSessionById(id: string): Promise<WorkoutSession | null>;
  listExercises(): Promise<Exercise[]>;
  getExerciseById(id: string): Promise<ExerciseDetail | null>;
  createSession(payload: WorkoutSessionInput): Promise<{ id: string }>;
  updateSession(id: string, payload: WorkoutSessionInput): Promise<{ id: string }>;
  deleteSession(id: string): Promise<void>;
}
