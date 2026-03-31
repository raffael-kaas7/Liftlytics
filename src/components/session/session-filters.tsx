"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SessionFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();

  function submit(formData: FormData) {
    const params = new URLSearchParams();
    const exercise = String(formData.get("exercise") || "");
    const from = String(formData.get("from") || "");
    const to = String(formData.get("to") || "");

    if (exercise) params.set("exercise", exercise);
    if (from) params.set("from", from);
    if (to) params.set("to", to);

    router.push(`/sessions${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit(new FormData(event.currentTarget));
      }}
      className="grid gap-3 rounded-3xl border bg-card/70 p-4 md:grid-cols-[1.5fr,1fr,1fr,auto]"
    >
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="exercise"
          defaultValue={searchParams.get("exercise") ?? ""}
          className="pl-9"
          placeholder="Filter by exercise"
        />
      </div>
      <Input type="date" name="from" defaultValue={searchParams.get("from") ?? ""} />
      <Input type="date" name="to" defaultValue={searchParams.get("to") ?? ""} />
      <Button type="submit">Apply Filters</Button>
    </form>
  );
}
