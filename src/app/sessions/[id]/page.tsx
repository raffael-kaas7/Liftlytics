import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteSessionButton } from "@/components/session/delete-session-button";
import { SessionForm } from "@/components/session/session-form";
import {
  calculateEstimated1RM,
  calculateSetVolume,
  getPRBadgesForSet,
  getSetVolumeLoad
} from "@/lib/analytics";
import { getDashboardData, getExercises, getSessionById } from "@/lib/data";
import { formatDate, formatMetric } from "@/lib/format";

export default async function SessionDetailPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams?: { edit?: string };
}) {
  const isEditing = searchParams?.edit === "1";
  const [session, exercises, allSessions] = await Promise.all([
    getSessionById(params.id),
    isEditing ? getExercises() : Promise.resolve([]),
    getDashboardData()
  ]);
  if (!session) {
    notFound();
  }

  const initialValue = {
    date: session.date.toISOString().slice(0, 10),
    bodyWeight: session.bodyWeight,
    notes: session.notes ?? "",
    exercises: session.entries.map((entry, index) => ({
      exerciseId: entry.exerciseId,
      exerciseName: entry.exercise.name,
      category: entry.exercise.category ?? "",
      isCompound: entry.exercise.isCompound,
      includeBodyWeightInVolume: entry.exercise.includeBodyWeightInVolume,
      notes: entry.notes ?? "",
      orderIndex: index,
      sets: entry.sets.map((set) => ({
        reps: set.reps,
        weight: set.weight,
        notes: set.notes ?? "",
        isWarmup: set.isWarmup
      }))
    }))
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{formatDate(session.date)}</h1>
          <p className="text-muted-foreground">
            {session.notes || "No session notes recorded."}
            {session.bodyWeight !== null ? ` Body weight: ${formatMetric(session.bodyWeight, 1)} kg.` : ""}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:min-w-44">
          <DeleteSessionButton id={session.id} />
          <Button asChild variant={isEditing ? "secondary" : "outline"}>
            <Link href={isEditing ? `/sessions/${session.id}` : `/sessions/${session.id}?edit=1`}>
              {isEditing ? "Close Editor" : "Edit Session"}
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Session Review</CardTitle>
          <CardDescription>Personal-record badges are computed from working sets only.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {session.entries.map((entry) => {
            const historicalPoints = allSessions
              .filter((currentSession) => currentSession.date <= session.date)
              .flatMap((currentSession) =>
                currentSession.entries
                  .filter((currentEntry) => currentEntry.exerciseId === entry.exerciseId)
                  .flatMap((currentEntry) =>
                    currentEntry.sets.map((set) => ({
                      setId: set.id,
                      sessionId: currentSession.id,
                      sessionDate: currentSession.date,
                      sessionBodyWeight: currentSession.bodyWeight,
                      exerciseName: currentEntry.exercise.name,
                      reps: set.reps,
                      weight: set.weight,
                      includeBodyWeightInVolume: currentEntry.exercise.includeBodyWeightInVolume,
                      notes: set.notes,
                      isWarmup: set.isWarmup
                    }))
                  )
              );

            return (
              <div key={entry.id} className="rounded-2xl border border-border/70 p-4">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-medium">{entry.exercise.name}</div>
                    <div className="text-sm text-muted-foreground">{entry.notes || "No exercise notes"}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {entry.sets.map((set, index) => {
                    const point = {
                      setId: set.id,
                      sessionId: session.id,
                      sessionDate: session.date,
                      sessionBodyWeight: session.bodyWeight,
                      exerciseName: entry.exercise.name,
                      reps: set.reps,
                      weight: set.weight,
                      includeBodyWeightInVolume: entry.exercise.includeBodyWeightInVolume,
                      notes: set.notes,
                      isWarmup: set.isWarmup
                    };
                    const effectiveLoad = getSetVolumeLoad(
                      set.weight,
                      session.bodyWeight ?? 0,
                      entry.exercise.includeBodyWeightInVolume
                    );
                    const setVolume = calculateSetVolume(
                      set.weight,
                      set.reps,
                      session.bodyWeight ?? 0,
                      entry.exercise.includeBodyWeightInVolume
                    );
                    const currentIndexInHistory = historicalPoints.findIndex(
                      (historyPoint) => historyPoint.setId === point.setId
                    );
                    const badges = getPRBadgesForSet(
                      point,
                      currentIndexInHistory > -1 ? historicalPoints.slice(0, currentIndexInHistory) : []
                    );

                    return (
                      <div key={set.id} className="grid gap-3 rounded-2xl bg-muted/30 p-4 md:grid-cols-[90px,1fr,1fr,1fr]">
                        <div>
                          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Set {set.setNumber}</div>
                          {set.isWarmup && <Badge variant="outline" className="mt-2 w-fit">Warm-up</Badge>}
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Load</div>
                          <div className="font-medium">
                            {set.weight} kg x {set.reps}
                          </div>
                          {entry.exercise.includeBodyWeightInVolume && session.bodyWeight !== null && (
                            <div className="text-xs text-muted-foreground">
                              Volume uses {formatMetric(effectiveLoad, 1)} kg total load
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Estimated 1RM</div>
                          <div className="font-medium">{formatMetric(calculateEstimated1RM(set.weight, set.reps), 1)} kg</div>
                          <div className="text-xs text-muted-foreground">{formatMetric(setVolume)} kg volume</div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {badges.map((badge) => (
                            <Badge key={badge}>{badge}</Badge>
                          ))}
                          {set.notes && <Badge variant="secondary">{set.notes}</Badge>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {isEditing && (
        <div>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Edit Session</h2>
          <SessionForm mode="edit" exercises={exercises} initialValue={initialValue} sessionId={session.id} />
        </div>
      )}
    </div>
  );
}
