import { notFound } from "next/navigation";
import { ChartCard } from "@/components/charts/chart-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  calculateSetVolume,
  deriveExercisePRs,
  deriveExerciseTrendData,
  deriveMomentumMetrics,
  splitRecentAndPrevious,
  suggestNextMilestone
} from "@/lib/analytics";
import { getExerciseById } from "@/lib/data";
import { formatDate, formatMetric } from "@/lib/format";

export default async function ExerciseDetailPage({ params }: { params: { id: string } }) {
  const exercise = await getExerciseById(params.id);
  if (!exercise) {
    notFound();
  }

  const points = exercise.entries.flatMap((entry) =>
    entry.sets.map((set) => ({
      sessionId: entry.sessionId,
      sessionDate: entry.session.date,
      sessionBodyWeight: entry.session.bodyWeight,
      exerciseName: exercise.name,
      reps: set.reps,
      weight: set.weight,
      includeBodyWeightInVolume: exercise.includeBodyWeightInVolume,
      notes: set.notes,
      isWarmup: set.isWarmup
    }))
  );

  const prs = deriveExercisePRs(points);
  const trends = deriveExerciseTrendData(points);
  const { recent, previous } = splitRecentAndPrevious(points);
  const momentum = deriveMomentumMetrics(recent, previous);
  const milestone = suggestNextMilestone(points);
  const noteHistory = exercise.entries
    .filter((entry) => entry.notes)
    .map((entry) => ({ date: entry.session.date, note: entry.notes! }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">{exercise.name}</h1>
            <Badge variant="secondary">{exercise.category || "Uncategorized"}</Badge>
          </div>
          <p className="mt-2 text-muted-foreground">
            Exercise analytics are based on working sets only. Volume includes session body weight when enabled for the exercise.
          </p>
        </div>
        <div className="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
          Shareable progress cards are reserved for v2.
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card><CardContent className="p-6"><div className="text-sm text-muted-foreground">All-time projected 1RM</div><div className="mt-2 text-3xl font-semibold">{formatMetric(prs.allTimeProjected1RM ?? 0, 1)} kg</div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="text-sm text-muted-foreground">Current projected 1RM</div><div className="mt-2 text-3xl font-semibold">{formatMetric(prs.currentProjected1RM ?? 0, 1)} kg</div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="text-sm text-muted-foreground">Lifetime volume</div><div className="mt-2 text-3xl font-semibold">{formatMetric(prs.totalLifetimeVolume)} kg</div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="text-sm text-muted-foreground">Sessions logged</div><div className="mt-2 text-3xl font-semibold">{prs.totalSessions}</div></CardContent></Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          title="Estimated 1RM Trend"
          description="Best projected 1RM per session"
          type="area"
          data={trends}
          xKey="date"
          yKey="bestEstimated1RM"
          color="hsl(var(--chart-1))"
        />
        <ChartCard
          title="Total Volume Trend"
          description="Working-set volume per session"
          type="bar"
          data={trends}
          xKey="date"
          yKey="volume"
          color="hsl(var(--chart-2))"
        />
      </section>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performances">Performances</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid gap-6 xl:grid-cols-[0.8fr,1.2fr]">
            <Card>
              <CardHeader>
                <CardTitle>Personal Records</CardTitle>
                <CardDescription>All computed from working sets.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Heaviest weight</span><span>{formatMetric(prs.heaviestWeight, 1)} kg</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Best single-set volume</span><span>{formatMetric(prs.bestVolumeSet)} kg</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Consistency</span><span>{prs.consistencyWeeks} active weeks</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Last performed</span><span>{prs.lastPerformedDate ? formatDate(prs.lastPerformedDate) : "N/A"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Weight PRs</span><span>{prs.weightPRCount}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Estimated 1RM PRs</span><span>{prs.estimated1RMPRCount}</span></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Insights</CardTitle>
                <CardDescription>Momentum and next milestone suggestions.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-border/70 p-4">
                  <div className="text-sm text-muted-foreground">Recent momentum</div>
                  <div className="mt-2 text-xl font-semibold">
                    {momentum.volumeChangePct === null ? "Not enough data" : `${formatMetric(momentum.volumeChangePct, 1)}% volume`}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {momentum.strengthChangePct === null ? "Need two 30-day windows" : `${formatMetric(momentum.strengthChangePct, 1)}% projected strength`}
                  </div>
                </div>
                <div className="rounded-2xl border border-border/70 p-4">
                  <div className="text-sm text-muted-foreground">Average reps at repeated working weight</div>
                  <div className="mt-2 text-xl font-semibold">
                    {prs.averageRepsAtWorkingWeight
                      ? `${formatMetric(prs.averageRepsAtWorkingWeight.averageReps, 1)} reps @ ${formatMetric(prs.averageRepsAtWorkingWeight.weight, 1)} kg`
                      : "Not enough repeated loads"}
                  </div>
                </div>
                <div className="rounded-2xl border border-border/70 p-4 md:col-span-2">
                  <div className="text-sm text-muted-foreground">Suggested next milestone</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {milestone ? (
                      <>
                        <Badge>{milestone.topSet} top set</Badge>
                        <Badge variant="secondary">Target 1RM: {formatMetric(milestone.next1RMTarget, 1)} kg</Badge>
                        <Badge variant="secondary">Rep goal: {milestone.repeatWeightSuggestion}</Badge>
                        <Badge variant="secondary">Load goal: {milestone.weightBumpSuggestion}</Badge>
                      </>
                    ) : (
                      <div className="text-sm text-muted-foreground">Log more working sets to unlock milestone suggestions.</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="performances">
          <Card>
            <CardHeader>
              <CardTitle>Recent Performances</CardTitle>
              <CardDescription>Latest session rows for this exercise.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr className="border-b border-border/80">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Best set</th>
                    <th className="px-4 py-3">Best est. 1RM</th>
                    <th className="px-4 py-3">Volume</th>
                    <th className="px-4 py-3">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {exercise.entries.map((entry) => {
                    const workingSets = entry.sets.filter((set) => !set.isWarmup);
                    const bestSet = workingSets
                      .slice()
                      .sort((a, b) => b.weight * (1 + b.reps / 30) - a.weight * (1 + a.reps / 30))[0];
                    const volume = workingSets.reduce(
                      (sum, set) =>
                        sum +
                        calculateSetVolume(
                          set.weight,
                          set.reps,
                          entry.session.bodyWeight ?? 0,
                          exercise.includeBodyWeightInVolume
                        ),
                      0
                    );

                    return (
                      <tr key={entry.id} className="border-b border-border/50">
                        <td className="px-4 py-3">{formatDate(entry.session.date)}</td>
                        <td className="px-4 py-3">{bestSet ? `${bestSet.weight} x ${bestSet.reps}` : "Warm-up only"}</td>
                        <td className="px-4 py-3">
                          {bestSet ? `${formatMetric(bestSet.weight * (1 + bestSet.reps / 30), 1)} kg` : "-"}
                        </td>
                        <td className="px-4 py-3">{formatMetric(volume)} kg</td>
                        <td className="px-4 py-3 text-muted-foreground">{entry.notes || "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Notes History</CardTitle>
              <CardDescription>Exercise-level notes from prior sessions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {noteHistory.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                  No exercise notes recorded yet.
                </div>
              ) : (
                noteHistory.map((item, index) => (
                  <div key={`${item.date.toISOString()}-${index}`} className="rounded-2xl border border-border/70 p-4">
                    <div className="text-sm text-muted-foreground">{formatDate(item.date)}</div>
                    <div className="mt-2">{item.note}</div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
