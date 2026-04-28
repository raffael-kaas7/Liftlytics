import Link from "next/link";
import { subDays } from "date-fns";
import { ArrowRight, Flame, TrendingUp } from "lucide-react";
import { ChartCard } from "@/components/charts/chart-card";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RECENT_PR_WINDOW_DAYS,
  countRecentPRs,
  deriveExerciseProgress,
  getWeeklyFrequencyChart
} from "@/lib/analytics";
import { getConfiguredUsernames } from "@/lib/auth";
import { getDashboardData } from "@/lib/data";
import { formatDate, formatMetric } from "@/lib/format";
import { flattenSessionPoints, summarizeSession } from "@/lib/selectors";

const SESSION_FREQUENCY_WINDOW_DAYS = 30;

function formatSignedPercent(value: number | null) {
  if (value === null) {
    return "No comparison";
  }

  return `${value > 0 ? "+" : ""}${formatMetric(value, 1)}%`;
}

export default async function DashboardPage() {
  const sessions = await getDashboardData();
  const points = flattenSessionPoints(sessions);
  const configuredUsernames = getConfiguredUsernames();
  const frequencyBoundary = subDays(new Date(), SESSION_FREQUENCY_WINDOW_DAYS);
  const recentSessions = sessions.filter((session) => session.date >= frequencyBoundary);
  const overallSessionsPerWeek = recentSessions.length / (SESSION_FREQUENCY_WINDOW_DAYS / 7);

  const sessionVolumeChart = sessions
    .slice()
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((session) => ({
      label: formatDate(session.date).replace(", 2026", ""),
      volume: summarizeSession(session).totalVolume
    }));

  const groupedByExercise = new Map<string, typeof points>();
  for (const point of points) {
    const group = groupedByExercise.get(point.exerciseName) ?? [];
    group.push(point);
    groupedByExercise.set(point.exerciseName, group);
  }

  const topImprovingExercises = [...groupedByExercise.entries()]
    .map(([name, exercisePoints]) => {
      const progress = deriveExerciseProgress(exercisePoints);
      return {
        name,
        changePct: progress.changePct,
        latestBestEstimated1RM: progress.latestBestEstimated1RM,
        previousBestEstimated1RM: progress.previousBestEstimated1RM,
        latestBestSetLabel: progress.latestBestSetLabel,
        previousBestSetLabel: progress.previousBestSetLabel,
        sessionCount: progress.sessionCount
      };
    })
    .filter((exercise) => exercise.changePct !== null)
    .sort((a, b) => (b.changePct ?? -Infinity) - (a.changePct ?? -Infinity))
    .slice(0, 3);

  const trackedUsernames = new Set([
    ...configuredUsernames,
    ...sessions.map((session) => session.loggedBy || "Unassigned")
  ]);
  const userSessionFrequency = [...trackedUsernames]
    .map((username) => {
      const userSessions = sessions.filter((session) => (session.loggedBy || "Unassigned") === username);
      const userRecentSessions = userSessions.filter((session) => session.date >= frequencyBoundary);

      return {
        username,
        totalSessions: userSessions.length,
        recentSessions: userRecentSessions.length,
        sessionsPerWeek: userRecentSessions.length / (SESSION_FREQUENCY_WINDOW_DAYS / 7),
        lastSessionDate: userSessions[0]?.date ?? null,
        isConfiguredUser: configuredUsernames.includes(username)
      };
    })
    .filter((stat) => stat.totalSessions > 0 || stat.isConfiguredUser)
    .sort(
      (a, b) =>
        b.sessionsPerWeek - a.sessionsPerWeek ||
        b.totalSessions - a.totalSessions ||
        a.username.localeCompare(b.username)
    );

  const activeUserCount = userSessionFrequency.filter((stat) => stat.recentSessions > 0).length;

  const recentPRCount = [...groupedByExercise.values()].reduce(
    (sum, exercisePoints) => sum + countRecentPRs(exercisePoints),
    0
  );

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.3fr,0.7fr]">
        <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-primary/10 via-card to-card">
          <CardContent className="flex h-full flex-col justify-between gap-8 p-8">
            <div className="space-y-4">
              <Badge variant="success" className="w-fit">Daily Strength Tracking</Badge>
              <div className="space-y-2">
                <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance">Log fast. Train hard. Track your Progress.</h1>
                <p className="max-w-2xl text-base text-muted-foreground">
                  Track your training with Liftlytics to verify progressive overloading. See KPIs that support your training and recovery:
                  volume, estimated 1RM, PRs, and momentum.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/sessions/new">
                  New Session
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/sessions">Review History</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Training Snapshot</CardTitle>
            <CardDescription>Working-set analytics from your hosted training log.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="rounded-2xl border border-border/70 bg-muted/40 p-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Flame className="h-4 w-4 text-primary" />
                Recent PR count
              </div>
              <div className="mt-2 text-3xl font-semibold">{recentPRCount}</div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Counts weight and estimated 1RM PRs set in the last {RECENT_PR_WINDOW_DAYS} days, measured against each
                exercise&apos;s full prior history. Warm-up sets are excluded.
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/40 p-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-chart-2" />
                Top improving lift
              </div>
              <div className="mt-2 text-xl font-semibold">{topImprovingExercises[0]?.name ?? "No data yet"}</div>
              {topImprovingExercises[0] && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatSignedPercent(topImprovingExercises[0].changePct)} since the previous logged session.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="Total sessions" value={String(sessions.length)} helper="All logged gym sessions" />
        <SummaryCard
          label="Sessions/week"
          value={formatMetric(overallSessionsPerWeek, 1)}
          helper={`Last ${SESSION_FREQUENCY_WINDOW_DAYS} days across all users`}
        />
        <SummaryCard
          label="Active users"
          value={String(activeUserCount)}
          helper={`Logged in the last ${SESSION_FREQUENCY_WINDOW_DAYS} days`}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          title="Workout Frequency"
          description="Sessions logged per calendar week"
          type="bar"
          data={getWeeklyFrequencyChart(sessions.map((session) => session.date))}
          xKey="label"
          yKey="sessions"
          color="hsl(var(--chart-2))"
        />
        <ChartCard
          title="Training Volume"
          description="Total session volume from working sets"
          type="area"
          data={sessionVolumeChart}
          xKey="label"
          yKey="volume"
          color="hsl(var(--chart-1))"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>Your latest logged workouts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {sessions.slice(0, 6).map((session) => {
              const summary = summarizeSession(session);
              return (
                <Link
                  key={session.id}
                  href={`/sessions/${session.id}`}
                  className="flex items-center justify-between rounded-2xl border border-border/70 p-4 transition hover:bg-muted/40"
                >
                  <div>
                    <div className="font-medium">{formatDate(session.date)}</div>
                    <div className="text-sm text-muted-foreground">{session.entries.length} exercises</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatMetric(summary.totalVolume)} kg</div>
                    <div className="text-sm text-muted-foreground">Session volume</div>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Improving Exercises</CardTitle>
            <CardDescription>Best latest-vs-previous estimated 1RM change by exercise.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topImprovingExercises.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
                Log the same exercise twice to compare progress.
              </div>
            )}
            {topImprovingExercises.map((exercise, index) => (
              <div key={exercise.name} className="flex items-center justify-between rounded-2xl border border-border/70 p-4">
                <div>
                  <div className="text-sm text-muted-foreground">#{index + 1}</div>
                  <div className="font-medium">{exercise.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {exercise.previousBestSetLabel} to {exercise.latestBestSetLabel}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatSignedPercent(exercise.changePct)}</div>
                  <div className="text-sm text-muted-foreground">
                    {exercise.latestBestEstimated1RM ? `${formatMetric(exercise.latestBestEstimated1RM, 1)} kg e1RM` : ""}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>User Session Frequency</CardTitle>
          <CardDescription>Sessions per week over the last {SESSION_FREQUENCY_WINDOW_DAYS} days.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {userSessionFrequency.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
              No user-level session history yet.
            </div>
          )}
          {userSessionFrequency.map((stat) => (
            <div key={stat.username} className="rounded-2xl border border-border/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{stat.username}</div>
                  <div className="text-sm text-muted-foreground">
                    {stat.lastSessionDate ? `Last: ${formatDate(stat.lastSessionDate)}` : "No sessions yet"}
                  </div>
                </div>
                <Badge variant={stat.recentSessions > 0 ? "success" : "outline"}>
                  {formatMetric(stat.sessionsPerWeek, 1)}/wk
                </Badge>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                {stat.recentSessions} recent, {stat.totalSessions} total
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
