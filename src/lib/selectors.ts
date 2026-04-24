import type { Exercise, ExerciseEntry, ExerciseSet, WorkoutSession } from "@prisma/client";
import { calculateEstimated1RM, calculateSetVolume } from "@/lib/analytics";
import type { WorkingSetPoint } from "@/lib/types";

type SessionWithEntries = WorkoutSession & {
  entries: (ExerciseEntry & {
    exercise: Exercise;
    sets: ExerciseSet[];
  })[];
};

export function flattenSessionPoints(sessions: SessionWithEntries[]): WorkingSetPoint[] {
  return sessions.flatMap((session) =>
    session.entries.flatMap((entry) =>
      entry.sets.map((set) => ({
        sessionId: session.id,
        sessionDate: session.date,
        sessionBodyWeight: session.bodyWeight,
        exerciseName: entry.exercise.name,
        reps: set.reps,
        weight: set.weight,
        includeBodyWeightInVolume: entry.exercise.includeBodyWeightInVolume,
        notes: set.notes,
        isWarmup: set.isWarmup
      }))
    )
  );
}

export function summarizeSession(session: SessionWithEntries) {
  const workingSets = session.entries.flatMap((entry) =>
    entry.sets
      .filter((set) => !set.isWarmup)
      .map((set) => ({
        set,
        includeBodyWeightInVolume: entry.exercise.includeBodyWeightInVolume
      }))
  );
  const totalVolume = workingSets.reduce(
    (sum, item) =>
      sum +
      calculateSetVolume(
        item.set.weight,
        item.set.reps,
        session.bodyWeight ?? 0,
        item.includeBodyWeightInVolume
      ),
    0
  );
  const topEstimated1RM = Math.max(
    0,
    ...workingSets.map((item) => calculateEstimated1RM(item.set.weight, item.set.reps))
  );

  return {
    totalVolume,
    topEstimated1RM
  };
}
