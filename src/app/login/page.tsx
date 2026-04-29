import { Bolt, Dumbbell, ExternalLink, LineChart, Share2 } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-9rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr,0.95fr]">
      <section className="space-y-10">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Dumbbell className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xl font-semibold tracking-tight">Liftlytics</div>
            <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Workout <span aria-hidden="true">&middot;</span> Journal <span aria-hidden="true">&middot;</span> Analytics
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance md:text-5xl">
            Train hard. Log fast. Track your progress.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
            A quiet workout journal for fast logging, progressive overload, and the KPIs that show whether your
            training is moving.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border bg-card/60 p-4">
            <Bolt className="mb-3 h-5 w-5 text-primary" />
            <div className="text-sm font-medium">Fast logging</div>
            <div className="mt-1 text-xs text-muted-foreground">Simple inputs, no workout noise.</div>
          </div>
          <div className="rounded-2xl border bg-card/60 p-4">
            <LineChart className="mb-3 h-5 w-5 text-chart-2" />
            <div className="text-sm font-medium">Progress KPIs</div>
            <div className="mt-1 text-xs text-muted-foreground">Volume, PRs, e1RM, momentum.</div>
          </div>
          <div className="rounded-2xl border bg-card/60 p-4">
            <Share2 className="mb-3 h-5 w-5 text-chart-3" />
            <div className="text-sm font-medium">Share progress</div>
            <div className="mt-1 text-xs text-muted-foreground">Show workouts and data to friends.</div>
          </div>
        </div>
      </section>

      <div className="space-y-4">
        <Card className="border-primary/15 bg-card/90">
          <CardContent className="p-6 md:p-8">
            <div className="mb-8 space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
              <p className="text-sm text-muted-foreground">
                Sign in to track your next workout session and see your progress.
              </p>
            </div>
            <LoginForm />
          </CardContent>
        </Card>
        <p className="text-center text-sm text-muted-foreground">
          Implemented by{" "}
          <a
            href="https://rkaas.de/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-medium text-primary underline underline-offset-4 transition hover:text-primary/80"
          >
            Raffael Kaas
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </p>
      </div>
    </div>
  );
}
