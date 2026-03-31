"use client";

import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ExerciseEntryInput, WorkoutSessionInput } from "@/lib/types";

type ExerciseOption = {
  id: string;
  name: string;
  category: string | null;
  isCompound: boolean;
};

const blankSet = () => ({ reps: 5, weight: 0, notes: "", isWarmup: false });

const blankExercise = (): ExerciseEntryInput => ({
  exerciseId: "",
  exerciseName: "",
  category: "",
  isCompound: false,
  notes: "",
  orderIndex: 0,
  sets: [{ ...blankSet() }, { ...blankSet() }, { ...blankSet() }]
});

export function SessionForm({
  mode,
  exercises,
  initialValue,
  sessionId
}: {
  mode: "create" | "edit";
  exercises: ExerciseOption[];
  initialValue?: WorkoutSessionInput;
  sessionId?: string;
}) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<WorkoutSessionInput>(
    initialValue ?? {
      date: new Date().toISOString().slice(0, 10),
      notes: "",
      exercises: [{ ...blankExercise() }]
    }
  );
  const [searches, setSearches] = useState<Record<number, string>>({});

  const exerciseLookup = useMemo(() => new Map(exercises.map((exercise) => [exercise.id, exercise])), [exercises]);

  function updateExercise(index: number, value: Partial<ExerciseEntryInput>) {
    setForm((current) => ({
      ...current,
      exercises: current.exercises.map((exercise, exerciseIndex) =>
        exerciseIndex === index ? { ...exercise, ...value } : exercise
      )
    }));
  }

  function addExercise() {
    setForm((current) => ({
      ...current,
      exercises: [...current.exercises, { ...blankExercise(), orderIndex: current.exercises.length }]
    }));
  }

  function removeExercise(index: number) {
    setForm((current) => ({
      ...current,
      exercises: current.exercises
        .filter((_, exerciseIndex) => exerciseIndex !== index)
        .map((exercise, orderIndex) => ({ ...exercise, orderIndex }))
    }));
  }

  function moveExercise(index: number, direction: -1 | 1) {
    setForm((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.exercises.length) {
        return current;
      }
      const next = [...current.exercises];
      [next[index], next[target]] = [next[target], next[index]];
      return {
        ...current,
        exercises: next.map((exercise, orderIndex) => ({ ...exercise, orderIndex }))
      };
    });
  }

  function addSet(exerciseIndex: number) {
    setForm((current) => ({
      ...current,
      exercises: current.exercises.map((exercise, index) =>
        index === exerciseIndex ? { ...exercise, sets: [...exercise.sets, { ...blankSet() }] } : exercise
      )
    }));
  }

  function removeSet(exerciseIndex: number, setIndex: number) {
    setForm((current) => ({
      ...current,
      exercises: current.exercises.map((exercise, index) =>
        index === exerciseIndex
          ? { ...exercise, sets: exercise.sets.filter((_, currentSetIndex) => currentSetIndex !== setIndex) }
          : exercise
      )
    }));
  }

  async function handleSubmit() {
    const hasInvalidExercise = form.exercises.some(
      (exercise) =>
        (!exercise.exerciseId && !exercise.exerciseName?.trim()) ||
        exercise.sets.some((set) => set.reps <= 0 || set.weight < 0)
    );

    if (hasInvalidExercise) {
      toast.error("Please complete exercise names and valid set values");
      return;
    }

    setIsSaving(true);

    const response = await fetch(mode === "create" ? "/api/sessions" : `/api/sessions/${sessionId}`, {
      method: mode === "create" ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        exercises: form.exercises.map((exercise, orderIndex) => ({
          ...exercise,
          orderIndex,
          exerciseId: exercise.exerciseId || undefined,
          exerciseName: exercise.exerciseId ? undefined : exercise.exerciseName?.trim(),
          sets: exercise.sets.map((set) => ({
            ...set,
            reps: Number(set.reps),
            weight: Number(set.weight)
          }))
        }))
      })
    });

    setIsSaving(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      toast.error(payload?.error ?? "Unable to save session");
      return;
    }

    const data = await response.json();
    toast.success(mode === "create" ? "Session saved" : "Session updated");
    router.push(`/sessions/${data.id}`);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{mode === "create" ? "New Session" : "Edit Session"}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[240px,1fr]">
          <div className="space-y-2">
            <Label htmlFor="session-date">Session date</Label>
            <Input
              id="session-date"
              type="date"
              value={form.date}
              onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="session-notes">Session notes</Label>
            <Textarea
              id="session-notes"
              value={form.notes ?? ""}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              placeholder="How did the session feel?"
            />
          </div>
        </CardContent>
      </Card>

      {form.exercises.map((exercise, exerciseIndex) => {
        const filteredExercises = exercises.filter((option) =>
          option.name.toLowerCase().includes((searches[exerciseIndex] ?? exercise.exerciseName ?? "").toLowerCase())
        );

        return (
          <Card key={exerciseIndex}>
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
              <div className="flex-1 space-y-4">
                <CardTitle className="text-base">Exercise {exerciseIndex + 1}</CardTitle>
                <div className="grid gap-4 md:grid-cols-[1.3fr,0.8fr,0.5fr]">
                  <div className="space-y-2">
                    <Label>Search or create exercise</Label>
                    <Input
                      value={searches[exerciseIndex] ?? exercise.exerciseName ?? exerciseLookup.get(exercise.exerciseId ?? "")?.name ?? ""}
                      onChange={(event) => {
                        const value = event.target.value;
                        setSearches((current) => ({ ...current, [exerciseIndex]: value }));
                        updateExercise(exerciseIndex, { exerciseId: "", exerciseName: value });
                      }}
                      placeholder="Bench Press"
                    />
                    <div className="flex max-h-32 flex-wrap gap-2 overflow-auto">
                      {filteredExercises.slice(0, 8).map((option) => (
                        <button
                          type="button"
                          key={option.id}
                          onClick={() => {
                            setSearches((current) => ({ ...current, [exerciseIndex]: option.name }));
                            updateExercise(exerciseIndex, {
                              exerciseId: option.id,
                              exerciseName: option.name,
                              category: option.category ?? "",
                              isCompound: option.isCompound
                            });
                          }}
                          className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition hover:border-primary hover:text-foreground"
                        >
                          {option.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input
                      value={exercise.category ?? ""}
                      onChange={(event) => updateExercise(exerciseIndex, { category: event.target.value })}
                      placeholder="Chest"
                    />
                  </div>
                  <label className="flex items-end gap-3 pb-3 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={exercise.isCompound ?? false}
                      onChange={(event) => updateExercise(exerciseIndex, { isCompound: event.target.checked })}
                      className="h-4 w-4 rounded border-border bg-background"
                    />
                    Compound
                  </label>
                </div>
                <div className="space-y-2">
                  <Label>Exercise notes</Label>
                  <Textarea
                    value={exercise.notes ?? ""}
                    onChange={(event) => updateExercise(exerciseIndex, { notes: event.target.value })}
                    placeholder="Technique, cues, or pain notes"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" type="button" onClick={() => moveExercise(exerciseIndex, -1)}>
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" type="button" onClick={() => moveExercise(exerciseIndex, 1)}>
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => removeExercise(exerciseIndex)}
                  disabled={form.exercises.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-2xl border">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/60 text-left text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Set</th>
                      <th className="px-4 py-3">Reps</th>
                      <th className="px-4 py-3">Weight</th>
                      <th className="px-4 py-3">Warm-up</th>
                      <th className="px-4 py-3">Note</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {exercise.sets.map((set, setIndex) => (
                      <tr key={setIndex} className="border-t border-border/80">
                        <td className="px-4 py-3 font-medium">{setIndex + 1}</td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            min={1}
                            step={1}
                            value={set.reps}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                exercises: current.exercises.map((currentExercise, index) =>
                                  index === exerciseIndex
                                    ? {
                                        ...currentExercise,
                                        sets: currentExercise.sets.map((currentSet, currentSetIndex) =>
                                          currentSetIndex === setIndex
                                            ? { ...currentSet, reps: Number(event.target.value) }
                                            : currentSet
                                        )
                                      }
                                    : currentExercise
                                )
                              }))
                            }
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            min={0}
                            step={0.5}
                            value={set.weight}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                exercises: current.exercises.map((currentExercise, index) =>
                                  index === exerciseIndex
                                    ? {
                                        ...currentExercise,
                                        sets: currentExercise.sets.map((currentSet, currentSetIndex) =>
                                          currentSetIndex === setIndex
                                            ? { ...currentSet, weight: Number(event.target.value) }
                                            : currentSet
                                        )
                                      }
                                    : currentExercise
                                )
                              }))
                            }
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={set.isWarmup ?? false}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                exercises: current.exercises.map((currentExercise, index) =>
                                  index === exerciseIndex
                                    ? {
                                        ...currentExercise,
                                        sets: currentExercise.sets.map((currentSet, currentSetIndex) =>
                                          currentSetIndex === setIndex
                                            ? { ...currentSet, isWarmup: event.target.checked }
                                            : currentSet
                                        )
                                      }
                                    : currentExercise
                                )
                              }))
                            }
                            className="h-4 w-4 rounded border-border"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            value={set.notes ?? ""}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                exercises: current.exercises.map((currentExercise, index) =>
                                  index === exerciseIndex
                                    ? {
                                        ...currentExercise,
                                        sets: currentExercise.sets.map((currentSet, currentSetIndex) =>
                                          currentSetIndex === setIndex
                                            ? { ...currentSet, notes: event.target.value }
                                            : currentSet
                                        )
                                      }
                                    : currentExercise
                                )
                              }))
                            }
                            placeholder="Optional"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            onClick={() => removeSet(exerciseIndex, setIndex)}
                            disabled={exercise.sets.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-between">
                <Button variant="secondary" type="button" onClick={() => addSet(exerciseIndex)}>
                  <Plus className="h-4 w-4" />
                  Add Set
                </Button>
                <div className="text-xs text-muted-foreground">PR calculations exclude warm-up sets.</div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <div className="flex flex-col justify-between gap-3 rounded-3xl border bg-card/60 p-4 md:flex-row">
        <Button variant="outline" type="button" onClick={addExercise}>
          <Plus className="h-4 w-4" />
          Add Exercise
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={isSaving}>
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : mode === "create" ? "Save Session" : "Update Session"}
        </Button>
      </div>
    </div>
  );
}
