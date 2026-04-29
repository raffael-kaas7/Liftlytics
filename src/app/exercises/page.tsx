import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { deriveExercisePRs } from "@/lib/analytics";
import { getDashboardData, getExercises } from "@/lib/data";
import { formatDate, formatMetric } from "@/lib/format";
import { flattenSessionPoints } from "@/lib/selectors";

export const dynamic = "force-dynamic";

export default async function ExercisesPage() {
  const [exercises, sessions] = await Promise.all([getExercises(), getDashboardData()]);
  const points = flattenSessionPoints(sessions);
  const pointsByExerciseName = new Map<string, typeof points>();

  for (const point of points) {
    const exercisePoints = pointsByExerciseName.get(point.exerciseName) ?? [];
    exercisePoints.push(point);
    pointsByExerciseName.set(point.exerciseName, exercisePoints);
  }

  const trainedExercises = exercises.filter((exercise) => pointsByExerciseName.has(exercise.name));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Exercise Library</h1>
        <p className="text-muted-foreground">Browse lifts you have trained and jump into detailed analytics.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Trained Exercises</CardTitle>
          <CardDescription>{trainedExercises.length} movements logged at least once</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {trainedExercises.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground md:col-span-2 xl:col-span-3">
              Log your first session to build the exercise list.
            </div>
          )}
          {trainedExercises.map((exercise) => {
            const prs = deriveExercisePRs(pointsByExerciseName.get(exercise.name) ?? []);
            return (
              <Link
                key={exercise.id}
                href={`/exercises/${exercise.id}`}
                className="rounded-2xl border border-border/70 p-4 transition hover:bg-muted/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{exercise.name}</div>
                    <div className="text-sm text-muted-foreground">{exercise.category || "Uncategorized"}</div>
                  </div>
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {exercise.isCompound ? "Compound" : "Accessory"}
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-muted-foreground">Best 1RM</div>
                    <div className="font-medium">{formatMetric(prs.bestEstimated1RM, 1)} kg</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Last performed</div>
                    <div className="font-medium">{prs.lastPerformedDate ? formatDate(prs.lastPerformedDate) : "Never"}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
