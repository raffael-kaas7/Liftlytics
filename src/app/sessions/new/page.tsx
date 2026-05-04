import { SessionForm, type ExerciseDefaults } from "@/components/session/session-form";
import { getDashboardData, getExercises } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function NewSessionPage() {
  const [exercises, sessions] = await Promise.all([getExercises(), getDashboardData()]);
  const exerciseDefaults: ExerciseDefaults = {};

  for (const session of sessions) {
    for (const entry of session.entries) {
      if (exerciseDefaults[entry.exerciseId]) {
        continue;
      }

      const workingSets = entry.sets
        .filter((set) => !set.isWarmup)
        .slice(0, 3)
        .map((set) => ({
          reps: set.reps,
          weight: set.weight,
          isWarmup: false
        }));

      if (workingSets.length > 0) {
        exerciseDefaults[entry.exerciseId] = workingSets;
        exerciseDefaults[entry.exercise.name] = workingSets;
      }
    }
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">New Session</h1>
        <p className="text-sm text-muted-foreground sm:text-base">Fast logging for your workout. Warm-up sets stay out of PR calculations.</p>
      </div>
      <SessionForm mode="create" exercises={exercises} exerciseDefaults={exerciseDefaults} />
    </div>
  );
}
