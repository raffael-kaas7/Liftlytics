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
        exerciseName: entry.exercise.name,
        reps: set.reps,
        weight: set.weight,
        notes: set.notes,
        isWarmup: set.isWarmup
      }))
    )
  );
}

export function summarizeSession(session: SessionWithEntries) {
  const workingSets = session.entries.flatMap((entry) => entry.sets.filter((set) => !set.isWarmup));
  const totalVolume = workingSets.reduce((sum, set) => sum + calculateSetVolume(set.weight, set.reps), 0);
  const topEstimated1RM = Math.max(
    0,
    ...workingSets.map((set) => calculateEstimated1RM(set.weight, set.reps))
  );

  return {
    totalVolume,
    topEstimated1RM
  };
}
