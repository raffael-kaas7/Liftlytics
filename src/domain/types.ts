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
  includeBodyWeightInVolume?: boolean;
  notes?: string;
  orderIndex: number;
  sets: SetInput[];
};

export type WorkoutSessionInput = {
  date: string;
  bodyWeight?: number | null;
  notes?: string;
  exercises: ExerciseEntryInput[];
};

export type Exercise = {
  id: string;
  name: string;
  category: string | null;
  isCompound: boolean;
  includeBodyWeightInVolume: boolean;
  createdAt: Date;
};

export type ExerciseSet = {
  id: string;
  exerciseEntryId: string;
  setNumber: number;
  reps: number;
  weight: number;
  notes: string | null;
  isWarmup: boolean;
  createdAt: Date;
};

export type ExerciseEntry = {
  id: string;
  sessionId: string;
  exerciseId: string;
  notes: string | null;
  orderIndex: number;
  createdAt: Date;
  exercise: Exercise;
  sets: ExerciseSet[];
};

export type WorkoutSession = {
  id: string;
  date: Date;
  bodyWeight: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  entries: ExerciseEntry[];
};

export type ExerciseDetail = Exercise & {
  entries: Array<
    Omit<ExerciseEntry, "exercise"> & {
      session: Omit<WorkoutSession, "entries">;
    }
  >;
};

export type SessionFilters = {
  exercise?: string;
  from?: string;
  to?: string;
};

export type WorkingSetPoint = {
  setId?: string;
  sessionId: string;
  sessionDate: Date;
  sessionBodyWeight?: number | null;
  exerciseName: string;
  reps: number;
  weight: number;
  includeBodyWeightInVolume?: boolean;
  notes?: string | null;
  isWarmup: boolean;
};
