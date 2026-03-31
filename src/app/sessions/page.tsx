import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SessionFilters } from "@/components/session/session-filters";
import { getSessions } from "@/lib/data";
import { formatDate, formatMetric } from "@/lib/format";
import { summarizeSession } from "@/lib/selectors";

export default async function SessionsPage({
  searchParams
}: {
  searchParams: { exercise?: string; from?: string; to?: string };
}) {
  const sessions = await getSessions(searchParams);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Session History</h1>
          <p className="text-muted-foreground">Filter sessions by exercise or date range, then drill into details.</p>
        </div>
        <Button asChild>
          <Link href="/sessions/new">New Session</Link>
        </Button>
      </div>

      <SessionFilters />

      <Card>
        <CardHeader>
          <CardTitle>All Sessions</CardTitle>
          <CardDescription>{sessions.length} sessions found</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {sessions.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
              No sessions match the current filters.
            </div>
          ) : (
            sessions.map((session) => {
              const summary = summarizeSession(session);
              return (
                <Link
                  href={`/sessions/${session.id}`}
                  key={session.id}
                  className="grid gap-3 rounded-2xl border border-border/70 p-4 transition hover:bg-muted/40 md:grid-cols-[1fr,auto,auto]"
                >
                  <div>
                    <div className="font-medium">{formatDate(session.date)}</div>
                    <div className="text-sm text-muted-foreground">{session.entries.map((entry) => entry.exercise.name).join(" • ")}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">{session.entries.length} exercises</div>
                  <div className="text-sm font-medium">{formatMetric(summary.totalVolume)} kg volume</div>
                </Link>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
