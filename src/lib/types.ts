export type SetInput = {
  reps: number;
  weight: number;
  notes?: string;
  isWarmup?: boolean;
};

export type ExerciseEntryInput = {
  exerciseId?: string;
  exerciseName?: string;
  category?: string;
  isCompound?: boolean;
  notes?: string;
  orderIndex: number;
  sets: SetInput[];
};

export type WorkoutSessionInput = {
  date: string;
  notes?: string;
  exercises: ExerciseEntryInput[];
};

export type WorkingSetPoint = {
  sessionId: string;
  sessionDate: Date;
  exerciseName: string;
  reps: number;
  weight: number;
  notes?: string | null;
  isWarmup: boolean;
};
