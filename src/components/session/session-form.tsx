"use client";

import { ArrowDown, ArrowUp, Minus, Plus, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ExerciseEntryInput, SetInput, WorkoutSessionInput } from "@/lib/types";

type ExerciseOption = {
  id: string;
  name: string;
  category: string | null;
  isCompound: boolean;
  includeBodyWeightInVolume: boolean;
};

export type ExerciseDefaults = Record<string, Array<Pick<SetInput, "reps" | "weight" | "isWarmup">>>;

const blankSet = (): SetInput => ({ reps: 8, weight: 0, notes: "", isWarmup: false });

const blankExercise = (): ExerciseEntryInput => ({
  exerciseId: "",
  exerciseName: "",
  category: "",
  isCompound: false,
  notes: "",
  orderIndex: 0,
  sets: [{ ...blankSet() }, { ...blankSet() }, { ...blankSet() }]
});

function normalizeSets(sets?: Array<Pick<SetInput, "reps" | "weight" | "isWarmup">>): SetInput[] {
  if (!sets?.length) {
    return [{ ...blankSet() }, { ...blankSet() }, { ...blankSet() }];
  }

  const next: SetInput[] = sets.slice(0, 3).map((set) => ({
    reps: set.reps || 8,
    weight: set.weight ?? 0,
    isWarmup: set.isWarmup ?? false,
    notes: ""
  }));

  while (next.length < 3) {
    next.push({ ...blankSet() });
  }

  return next;
}

export function SessionForm({
  mode,
  exercises,
  initialValue,
  sessionId,
  exerciseDefaults = {}
}: {
  mode: "create" | "edit";
  exercises: ExerciseOption[];
  initialValue?: WorkoutSessionInput;
  sessionId?: string;
  exerciseDefaults?: ExerciseDefaults;
}) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<WorkoutSessionInput>(
    initialValue ?? {
      date: new Date().toISOString().slice(0, 10),
      bodyWeight: null,
      notes: "",
      exercises: [{ ...blankExercise() }]
    }
  );
  const [selectedCategories, setSelectedCategories] = useState<Record<number, string>>({});
  const [showCustomInput, setShowCustomInput] = useState<Record<number, boolean>>({});

  const categories = useMemo(() => {
    const unique = new Set(exercises.map((exercise) => exercise.category || "Other"));
    return ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core", ...unique].filter(
      (category, index, all) => all.indexOf(category) === index
    );
  }, [exercises]);

  const exerciseLookup = useMemo(() => new Map(exercises.map((exercise) => [exercise.id, exercise])), [exercises]);

  function updateExercise(index: number, value: Partial<ExerciseEntryInput>) {
    setForm((current) => ({
      ...current,
      exercises: current.exercises.map((exercise, exerciseIndex) =>
        exerciseIndex === index ? { ...exercise, ...value } : exercise
      )
    }));
  }

  function updateSet(exerciseIndex: number, setIndex: number, value: Partial<SetInput>) {
    setForm((current) => ({
      ...current,
      exercises: current.exercises.map((exercise, index) =>
        index === exerciseIndex
          ? {
              ...exercise,
              sets: exercise.sets.map((set, currentSetIndex) =>
                currentSetIndex === setIndex ? { ...set, ...value } : set
              )
            }
          : exercise
      )
    }));
  }

  function stepSetValue(exerciseIndex: number, setIndex: number, field: "reps" | "weight", amount: number) {
    const current = form.exercises[exerciseIndex].sets[setIndex];
    const nextValue = field === "reps"
      ? Math.max(1, Math.round((current.reps || 1) + amount))
      : Math.max(0, Math.round(((current.weight || 0) + amount) * 10) / 10);
    updateSet(exerciseIndex, setIndex, { [field]: nextValue });
  }

  function selectExercise(index: number, option: ExerciseOption) {
    setSelectedCategories((current) => ({ ...current, [index]: option.category || "Other" }));
    updateExercise(index, {
      exerciseId: option.id,
      exerciseName: option.name,
      category: option.category ?? "",
      isCompound: option.isCompound,
      includeBodyWeightInVolume: option.includeBodyWeightInVolume,
      sets: normalizeSets(exerciseDefaults[option.id] ?? exerciseDefaults[option.name])
    });
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
      toast.error("Please select an exercise and use valid set values");
      return;
    }

    setIsSaving(true);

    const response = await fetch(mode === "create" ? "/api/sessions" : `/api/sessions/${sessionId}`, {
      method: mode === "create" ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        bodyWeight: form.bodyWeight === null || form.bodyWeight === undefined || Number.isNaN(form.bodyWeight)
          ? null
          : Number(form.bodyWeight),
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
            <Label htmlFor="session-body-weight">Body weight (kg)</Label>
            <Input
              id="session-body-weight"
              type="number"
              min={0}
              step={0.1}
              value={form.bodyWeight ?? ""}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  bodyWeight: event.target.value === "" ? null : Number(event.target.value)
                }))
              }
              placeholder="Optional"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="session-notes">Session notes</Label>
            <Textarea
              id="session-notes"
              value={form.notes ?? ""}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              placeholder="Gym, focus, recovery, or how the session felt"
            />
          </div>
        </CardContent>
      </Card>

      {form.exercises.map((exercise, exerciseIndex) => {
        const selectedCategory = selectedCategories[exerciseIndex] || exercise.category || categories[0] || "Chest";
        const visibleExercises = exercises.filter((option) => (option.category || "Other") === selectedCategory);
        const selectedExerciseName = exercise.exerciseId
          ? exerciseLookup.get(exercise.exerciseId)?.name
          : exercise.exerciseName;

        return (
          <Card key={exerciseIndex} className="overflow-hidden">
            <CardHeader className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-base">Exercise {exerciseIndex + 1}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedExerciseName || "Choose a category, then tap an exercise."}
                  </p>
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
              </div>

              <div className="space-y-3">
                <Label>Category</Label>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        setSelectedCategories((current) => ({ ...current, [exerciseIndex]: category }));
                        updateExercise(exerciseIndex, { category });
                      }}
                      className={cn(
                        "shrink-0 rounded-full border px-4 py-2 text-sm transition",
                        selectedCategory === category
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Exercise</Label>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {visibleExercises.map((option) => (
                    <button
                      type="button"
                      key={option.id}
                      onClick={() => selectExercise(exerciseIndex, option)}
                      className={cn(
                        "rounded-2xl border p-3 text-left text-sm transition",
                        exercise.exerciseId === option.id
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border bg-background/40 text-foreground hover:bg-muted/60"
                      )}
                    >
                      <span className="font-medium">{option.name}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {option.isCompound ? "Compound lift" : "Accessory"}
                      </span>
                    </button>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCustomInput((current) => ({ ...current, [exerciseIndex]: !current[exerciseIndex] }))}
                >
                  {showCustomInput[exerciseIndex] ? "Hide custom exercise" : "Create custom exercise"}
                </Button>
                {showCustomInput[exerciseIndex] && (
                  <Input
                    value={exercise.exerciseId ? "" : exercise.exerciseName ?? ""}
                    onChange={(event) =>
                      updateExercise(exerciseIndex, {
                        exerciseId: "",
                        exerciseName: event.target.value,
                        category: selectedCategory,
                        isCompound: false
                      })
                    }
                    placeholder={`New ${selectedCategory.toLowerCase()} exercise`}
                  />
                )}
              </div>

              <label className="flex w-fit items-center gap-3 rounded-full border border-border px-3 py-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={exercise.includeBodyWeightInVolume ?? false}
                  onChange={(event) =>
                    updateExercise(exerciseIndex, { includeBodyWeightInVolume: event.target.checked })
                  }
                  className="h-4 w-4 rounded border-border"
                />
                Include session body weight in volume
              </label>

              <div className="space-y-2">
                <Label>Exercise notes</Label>
                <Textarea
                  value={exercise.notes ?? ""}
                  onChange={(event) => updateExercise(exerciseIndex, { notes: event.target.value })}
                  placeholder="Gym, bench setup, technique cue, injury note..."
                />
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {exercise.sets.map((set, setIndex) => (
                <div key={setIndex} className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium">Set {setIndex + 1}</div>
                      <div className="text-xs text-muted-foreground">Working KPIs exclude warm-up sets.</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => removeSet(exerciseIndex, setIndex)}
                      disabled={exercise.sets.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[180px,240px,1fr]">
                    <div className="space-y-2">
                      <Label>Reps</Label>
                      <div className="flex items-center rounded-2xl border bg-background/50 p-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          onClick={() => stepSetValue(exerciseIndex, setIndex, "reps", -1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <div className="flex-1 text-center text-xl font-semibold">{set.reps}</div>
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          onClick={() => stepSetValue(exerciseIndex, setIndex, "reps", 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Weight</Label>
                      <div className="grid grid-cols-[44px,1fr,44px] gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          type="button"
                          onClick={() => stepSetValue(exerciseIndex, setIndex, "weight", -2.5)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          min={0}
                          step={0.5}
                          value={set.weight}
                          onChange={(event) => updateSet(exerciseIndex, setIndex, { weight: Number(event.target.value) })}
                          className="text-center"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          type="button"
                          onClick={() => stepSetValue(exerciseIndex, setIndex, "weight", 2.5)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Set note</Label>
                      <Input
                        value={set.notes ?? ""}
                        onChange={(event) => updateSet(exerciseIndex, setIndex, { notes: event.target.value })}
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  <label className="mt-4 flex w-fit items-center gap-3 rounded-full border border-border px-3 py-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={set.isWarmup ?? false}
                      onChange={(event) => updateSet(exerciseIndex, setIndex, { isWarmup: event.target.checked })}
                      className="h-4 w-4 rounded border-border"
                    />
                    Warm-up set
                  </label>
                </div>
              ))}

              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <Button variant="secondary" type="button" onClick={() => addSet(exerciseIndex)}>
                  <Plus className="h-4 w-4" />
                  Add Set
                </Button>
                <div className="text-xs text-muted-foreground">Default is 3 sets of 8 reps. Selecting an exercise reuses your last logged loads.</div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <div className="sticky bottom-4 z-10 flex flex-col justify-between gap-3 rounded-3xl border bg-card/95 p-4 shadow-2xl backdrop-blur md:flex-row">
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
