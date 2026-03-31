import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { deriveExercisePRs } from "@/lib/analytics";
import { getDashboardData, getExercises } from "@/lib/data";
import { formatDate, formatMetric } from "@/lib/format";
import { flattenSessionPoints } from "@/lib/selectors";

export default async function ExercisesPage() {
  const [exercises, sessions] = await Promise.all([getExercises(), getDashboardData()]);
  const points = flattenSessionPoints(sessions);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Exercise Library</h1>
        <p className="text-muted-foreground">Browse your tracked lifts and jump into detailed analytics.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Exercises</CardTitle>
          <CardDescription>{exercises.length} movements available</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {exercises.map((exercise) => {
            const prs = deriveExercisePRs(points.filter((point) => point.exerciseName === exercise.name));
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
