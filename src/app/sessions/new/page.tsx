import { SessionForm } from "@/components/session/session-form";
import { getExercises } from "@/lib/data";

export default async function NewSessionPage() {
  const exercises = await getExercises();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">New Session</h1>
        <p className="text-muted-foreground">Fast logging for your workout. Warm-up sets stay out of PR calculations.</p>
      </div>
      <SessionForm mode="create" exercises={exercises} />
    </div>
  );
}
