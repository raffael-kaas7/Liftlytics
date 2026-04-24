import { Dumbbell, LineChart, LockKeyhole, ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-9rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr,0.9fr]">
      <section className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Dumbbell className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xl font-semibold tracking-tight">Liftlytics</div>
            <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Private Strength Journal</div>
          </div>
        </div>

        <div className="space-y-4">
          <Badge variant="success" className="w-fit">Protected Training Data</Badge>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance md:text-5xl">
            Log fast. Train hard. Track your Progress.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground">
            Unlock your private dashboard to review sessions, track progressive overload, and inspect KPIs like volume,
            estimated 1RM, PRs, and momentum.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border bg-card/60 p-4">
            <ShieldCheck className="mb-3 h-5 w-5 text-primary" />
            <div className="text-sm font-medium">Private access</div>
            <div className="mt-1 text-xs text-muted-foreground">Protected with your configured credentials.</div>
          </div>
          <div className="rounded-2xl border bg-card/60 p-4">
            <LineChart className="mb-3 h-5 w-5 text-chart-2" />
            <div className="text-sm font-medium">Progress KPIs</div>
            <div className="mt-1 text-xs text-muted-foreground">Volume, PRs, estimated 1RM, and momentum.</div>
          </div>
          <div className="rounded-2xl border bg-card/60 p-4">
            <LockKeyhole className="mb-3 h-5 w-5 text-chart-3" />
            <div className="text-sm font-medium">Session cookie</div>
            <div className="mt-1 text-xs text-muted-foreground">No browser-native auth popup.</div>
          </div>
        </div>
      </section>

      <Card className="border-primary/15 bg-card/90">
        <CardContent className="p-6 md:p-8">
          <div className="mb-8 space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
            <p className="text-sm text-muted-foreground">
              Sign in to continue to your hosted Liftlytics instance.
            </p>
          </div>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
