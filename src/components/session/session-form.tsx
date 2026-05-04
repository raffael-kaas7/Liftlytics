"use client";

import { ArrowDown, ArrowUp, Check, ChevronDown, ChevronUp, Minus, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
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
  bodyWeightVolumeMultiplier: number;
};

export type ExerciseDefaults = Record<string, Array<Pick<SetInput, "reps" | "weight" | "isWarmup">>>;

const blankSet = (): SetInput => ({ reps: 8, weight: 0, notes: "", isWarmup: false });

const blankExercise = (): ExerciseEntryInput => ({
  exerciseId: "",
  exerciseName: "",
  category: "",
  isCompound: false,
  includeBodyWeightInVolume: false,
  bodyWeightVolumeMultiplier: 1,
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

function parseNumericInput(value: string) {
  const normalized = value.replace(",", ".").trim();
  if (normalized === "") {
    return 0;
  }

  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatCompactNumber(value: number) {
  return Number.isInteger(value) ? String(value) : String(value);
}

function formatPercentInput(value?: number) {
  const percent = Math.round(((value ?? 1) * 100) * 10) / 10;
  return formatCompactNumber(percent);
}

function parseBodyWeightVolumeMultiplier(value: string) {
  return Math.min(2, Math.max(0, parseNumericInput(value) / 100));
}

function removeIndexedRecord<T>(record: Record<number, T>, index: number) {
  const next: Record<number, T> = {};

  for (const [key, value] of Object.entries(record)) {
    const numericKey = Number(key);
    if (Number.isNaN(numericKey) || numericKey === index) {
      continue;
    }

    next[numericKey > index ? numericKey - 1 : numericKey] = value;
  }

  return next;
}

function swapIndexedRecord<T>(record: Record<number, T>, index: number, target: number) {
  const next = { ...record };
  const currentValue = next[index];
  const targetValue = next[target];

  if (targetValue === undefined) {
    delete next[index];
  } else {
    next[index] = targetValue;
  }

  if (currentValue === undefined) {
    delete next[target];
  } else {
    next[target] = currentValue;
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
  const [openExerciseIndex, setOpenExerciseIndex] = useState<number | null>(0);
  const [highlightedExerciseIndex, setHighlightedExerciseIndex] = useState<number | null>(0);
  const [pendingScrollExerciseIndex, setPendingScrollExerciseIndex] = useState<number | null>(null);
  const exerciseRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const categories = useMemo(() => {
    const unique = new Set(exercises.map((exercise) => exercise.category || "Other"));
    return ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core", ...unique].filter(
      (category, index, all) => all.indexOf(category) === index
    );
  }, [exercises]);

  const exerciseLookup = useMemo(() => new Map(exercises.map((exercise) => [exercise.id, exercise])), [exercises]);

  useEffect(() => {
    if (highlightedExerciseIndex === null) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setHighlightedExerciseIndex((current) => (current === highlightedExerciseIndex ? null : current));
    }, 1600);

    return () => window.clearTimeout(timeout);
  }, [highlightedExerciseIndex]);

  useEffect(() => {
    if (pendingScrollExerciseIndex === null) {
      return;
    }

    const target = exerciseRefs.current[pendingScrollExerciseIndex];
    if (!target) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      setPendingScrollExerciseIndex(null);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [form.exercises.length, pendingScrollExerciseIndex]);

  function openOnlyExercise(index: number, shouldScroll = false) {
    setOpenExerciseIndex(index);
    setHighlightedExerciseIndex(index);
    if (shouldScroll) {
      setPendingScrollExerciseIndex(index);
    }
  }

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
      bodyWeightVolumeMultiplier: option.bodyWeightVolumeMultiplier,
      sets: normalizeSets(exerciseDefaults[option.id] ?? exerciseDefaults[option.name])
    });
    openOnlyExercise(index);
  }

  function addExercise() {
    const nextIndex = form.exercises.length;
    setForm((current) => ({
      ...current,
      exercises: [...current.exercises, { ...blankExercise(), orderIndex: current.exercises.length }]
    }));
    openOnlyExercise(nextIndex, true);
  }

  function removeExercise(index: number) {
    const nextLength = form.exercises.length - 1;

    setForm((current) => ({
      ...current,
      exercises: current.exercises
        .filter((_, exerciseIndex) => exerciseIndex !== index)
        .map((exercise, orderIndex) => ({ ...exercise, orderIndex }))
    }));
    setSelectedCategories((current) => removeIndexedRecord(current, index));
    setShowCustomInput((current) => removeIndexedRecord(current, index));
    setOpenExerciseIndex((current) => {
      if (nextLength <= 0 || current === null) {
        return null;
      }

      if (current === index) {
        return Math.max(0, Math.min(index, nextLength - 1));
      }

      return current > index ? current - 1 : current;
    });
  }

  function moveExercise(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= form.exercises.length) {
      return;
    }

    setForm((current) => {
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
    setSelectedCategories((current) => swapIndexedRecord(current, index, target));
    setShowCustomInput((current) => swapIndexedRecord(current, index, target));
    setOpenExerciseIndex((current) => {
      if (current === index) {
        return target;
      }
      if (current === target) {
        return index;
      }
      return current;
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

  function toggleExercise(index: number) {
    if (openExerciseIndex === index) {
      setOpenExerciseIndex(null);
      return;
    }

    openOnlyExercise(index, true);
  }

  function completeExercise(index: number) {
    setOpenExerciseIndex((current) => (current === index ? null : current));
  }

  async function handleSubmit() {
    const hasInvalidExercise = form.exercises.some(
      (exercise) =>
        (!exercise.exerciseId && !exercise.exerciseName?.trim()) ||
        (exercise.includeBodyWeightInVolume &&
          ((exercise.bodyWeightVolumeMultiplier ?? 1) < 0 || (exercise.bodyWeightVolumeMultiplier ?? 1) > 2)) ||
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
          bodyWeightVolumeMultiplier: Number(exercise.bodyWeightVolumeMultiplier ?? 1),
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
    <div className="space-y-4 sm:space-y-6">
      <Card className="w-full overflow-hidden rounded-2xl">
        <CardContent className="grid w-full min-w-0 grid-cols-1 gap-3 overflow-hidden p-3 sm:gap-4 sm:p-4 md:grid-cols-[240px,1fr] md:p-6">
          <div className="min-w-0 space-y-1.5">
            <Label htmlFor="session-date">Session date</Label>
            <Input
              id="session-date"
              type="date"
              value={form.date}
              onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
              className="h-11 max-w-full appearance-none overflow-hidden px-2 text-base [inline-size:100%] [max-inline-size:100%] [min-inline-size:0] sm:text-sm"
            />
          </div>
          <div className="min-w-0 space-y-1.5">
            <Label htmlFor="session-body-weight">Body weight (kg)</Label>
            <Input
              id="session-body-weight"
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              value={form.bodyWeight === null || form.bodyWeight === undefined || form.bodyWeight === 0 ? "" : formatCompactNumber(form.bodyWeight)}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  bodyWeight: event.target.value === "" ? null : parseNumericInput(event.target.value)
                }))
              }
              placeholder="Optional"
            />
          </div>
          <div className="min-w-0 space-y-1.5 md:col-span-2">
            <Label htmlFor="session-notes">Session notes</Label>
            <Textarea
              id="session-notes"
              value={form.notes ?? ""}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              placeholder="Gym, focus, recovery, or how the session felt"
              className="min-h-16"
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
        const isOpen = openExerciseIndex === exerciseIndex;
        const workingSetCount = exercise.sets.filter((set) => !set.isWarmup).length;
        const exerciseTitle = selectedExerciseName || `Exercise ${exerciseIndex + 1}`;
        const exerciseSummary = `${exercise.sets.length} sets, ${workingSetCount} working${
          exercise.includeBodyWeightInVolume
            ? `, ${formatPercentInput(exercise.bodyWeightVolumeMultiplier)}% bodyweight`
            : ""
        }`;

        return (
          <Card
            key={exerciseIndex}
            ref={(node) => {
              exerciseRefs.current[exerciseIndex] = node;
            }}
            className={cn(
              "scroll-mt-20 overflow-hidden rounded-2xl transition-all duration-300",
              isOpen && "border-primary/35 bg-card/95",
              highlightedExerciseIndex === exerciseIndex && "ring-2 ring-primary/45"
            )}
          >
            <CardHeader className="space-y-3 p-4 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => toggleExercise(exerciseIndex)}
                  className="flex min-w-0 flex-1 items-start gap-2 text-left"
                >
                  {isOpen ? (
                    <ChevronUp className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  ) : (
                    <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <CardTitle className="max-w-full truncate text-base">{exerciseTitle}</CardTitle>
                      {isOpen && (
                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold uppercase text-primary">
                          Editing
                        </span>
                      )}
                    </span>
                    {!selectedExerciseName && (
                      <span className="mt-1 block text-sm text-muted-foreground">Choose exercise</span>
                    )}
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {exerciseSummary}
                    </span>
                  </span>
                </button>
                <Button
                  variant={isOpen ? "secondary" : "outline"}
                  size="sm"
                  type="button"
                  onClick={() => (isOpen ? completeExercise(exerciseIndex) : toggleExercise(exerciseIndex))}
                  className="h-10 shrink-0 px-3"
                >
                  {isOpen ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                  {isOpen ? "Done" : "Edit"}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  onClick={() => moveExercise(exerciseIndex, -1)}
                  className="h-9 w-9"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  onClick={() => moveExercise(exerciseIndex, 1)}
                  className="h-9 w-9"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => removeExercise(exerciseIndex)}
                  disabled={form.exercises.length === 1}
                  className="h-9 w-9"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            {isOpen && (
              <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
                <div className="space-y-2.5">
                  <Label>Category</Label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => {
                          setSelectedCategories((current) => ({ ...current, [exerciseIndex]: category }));
                          updateExercise(exerciseIndex, { category });
                        }}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs transition sm:px-4 sm:py-2 sm:text-sm",
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

                <div className="space-y-2.5">
                  <Label>Exercise</Label>
                  <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
                    {visibleExercises.map((option) => (
                      <button
                        type="button"
                        key={option.id}
                        onClick={() => selectExercise(exerciseIndex, option)}
                        className={cn(
                          "min-h-12 rounded-2xl border p-2.5 text-left text-xs transition sm:p-3 sm:text-sm",
                          exercise.exerciseId === option.id
                            ? "border-primary bg-primary/15 text-primary"
                            : "border-border bg-background/40 text-foreground hover:bg-muted/60"
                        )}
                      >
                        <span className="font-medium">{option.name}</span>
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
                          isCompound: false,
                          bodyWeightVolumeMultiplier: exercise.bodyWeightVolumeMultiplier ?? 1
                        })
                      }
                      placeholder={`New ${selectedCategory.toLowerCase()} exercise`}
                      className="h-11"
                    />
                  )}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <label className="flex w-fit items-center gap-3 rounded-full border border-border px-3 py-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={exercise.includeBodyWeightInVolume ?? false}
                      onChange={(event) =>
                        updateExercise(exerciseIndex, {
                          includeBodyWeightInVolume: event.target.checked,
                          bodyWeightVolumeMultiplier: exercise.bodyWeightVolumeMultiplier ?? 1
                        })
                      }
                      className="h-4 w-4 rounded border-border"
                    />
                    Include body weight in volume
                  </label>
                  {exercise.includeBodyWeightInVolume && (
                    <div className="w-36 space-y-1.5">
                      <Label htmlFor={`body-weight-volume-${exerciseIndex}`}>Body weight %</Label>
                      <Input
                        id={`body-weight-volume-${exerciseIndex}`}
                        type="number"
                        inputMode="decimal"
                        min={0}
                        max={200}
                        step={5}
                        value={formatPercentInput(exercise.bodyWeightVolumeMultiplier)}
                        onChange={(event) =>
                          updateExercise(exerciseIndex, {
                            bodyWeightVolumeMultiplier: parseBodyWeightVolumeMultiplier(event.target.value)
                          })
                        }
                      />
                    </div>
                  )}
                </div>

                <details
                  className="rounded-2xl border border-border/70 bg-background/30 px-3 py-2"
                  open={Boolean(exercise.notes) || undefined}
                >
                  <summary className="cursor-pointer list-none text-sm font-medium text-muted-foreground">
                    Exercise notes
                  </summary>
                  <Textarea
                    value={exercise.notes ?? ""}
                    onChange={(event) => updateExercise(exerciseIndex, { notes: event.target.value })}
                    placeholder="Gym, bench setup, technique cue, injury note..."
                    className="mt-2 min-h-16"
                  />
                </details>

                <div className="space-y-2">
                  {exercise.sets.map((set, setIndex) => (
                    <div key={setIndex} className="rounded-2xl border border-border/70 bg-muted/20 p-3 sm:p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <div
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold tabular-nums",
                              set.isWarmup
                                ? "border-chart-4/40 bg-chart-4/10 text-chart-4"
                                : "border-primary/35 bg-primary/10 text-primary"
                            )}
                          >
                            {setIndex + 1}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium">Set {setIndex + 1}</div>
                            <div className="text-xs text-muted-foreground">
                              {set.isWarmup ? "Warm-up" : "Working"}
                            </div>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <label
                            className={cn(
                              "flex h-9 cursor-pointer items-center rounded-full border px-3 text-xs font-medium transition",
                              set.isWarmup
                                ? "border-chart-4/45 bg-chart-4/10 text-chart-4"
                                : "border-border text-muted-foreground"
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={set.isWarmup ?? false}
                              onChange={(event) => updateSet(exerciseIndex, setIndex, { isWarmup: event.target.checked })}
                              className="sr-only"
                            />
                            Warm-up
                          </label>
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            onClick={() => removeSet(exerciseIndex, setIndex)}
                            disabled={exercise.sets.length === 1}
                            className="h-9 w-9"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-3 grid gap-3 sm:grid-cols-[170px,240px,1fr]">
                        <div className="space-y-1.5">
                          <Label>Reps</Label>
                          <div className="grid grid-cols-[48px,1fr,48px] items-center rounded-2xl border bg-background/50 p-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              type="button"
                              onClick={() => stepSetValue(exerciseIndex, setIndex, "reps", -1)}
                              className="h-10 w-full rounded-xl"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <div className="text-center text-xl font-semibold tabular-nums">{set.reps}</div>
                            <Button
                              variant="ghost"
                              size="icon"
                              type="button"
                              onClick={() => stepSetValue(exerciseIndex, setIndex, "reps", 1)}
                              className="h-10 w-full rounded-xl"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label>Weight</Label>
                          <div className="grid grid-cols-[48px,minmax(72px,1fr),48px] gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              type="button"
                              onClick={() => stepSetValue(exerciseIndex, setIndex, "weight", -2.5)}
                              className="h-11 w-full rounded-xl"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              type="number"
                              inputMode="decimal"
                              min={0}
                              step={0.5}
                              value={set.weight === 0 ? "" : formatCompactNumber(set.weight)}
                              onChange={(event) =>
                                updateSet(exerciseIndex, setIndex, { weight: parseNumericInput(event.target.value) })
                              }
                              className="h-11 text-center text-base tabular-nums sm:text-sm"
                              placeholder="0"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              type="button"
                              onClick={() => stepSetValue(exerciseIndex, setIndex, "weight", 2.5)}
                              className="h-11 w-full rounded-xl"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="hidden space-y-1.5 sm:block">
                          <Label>Set note</Label>
                          <Input
                            value={set.notes ?? ""}
                            onChange={(event) => updateSet(exerciseIndex, setIndex, { notes: event.target.value })}
                            placeholder="Optional"
                          />
                        </div>
                      </div>

                      <details
                        className="mt-3 rounded-xl border border-border/60 bg-background/30 px-3 py-2 sm:hidden"
                        open={Boolean(set.notes) || undefined}
                      >
                        <summary className="cursor-pointer list-none text-xs font-medium text-muted-foreground">
                          Set note
                        </summary>
                        <Input
                          value={set.notes ?? ""}
                          onChange={(event) => updateSet(exerciseIndex, setIndex, { notes: event.target.value })}
                          placeholder="Optional"
                          className="mt-2 h-11"
                        />
                      </details>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <Button variant="secondary" type="button" onClick={() => addSet(exerciseIndex)} className="h-11">
                    <Plus className="h-4 w-4" />
                    Add Set
                  </Button>
                  <div className="text-xs text-muted-foreground">
                    Last logged loads are reused when you select an exercise.
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}

      <div className="sticky bottom-20 z-20 grid grid-cols-2 gap-2 rounded-2xl border bg-card/95 p-2 shadow-2xl backdrop-blur md:bottom-4 md:flex md:justify-between md:p-4">
        <Button variant="outline" type="button" onClick={addExercise} className="h-12 md:h-10">
          <Plus className="h-4 w-4" />
          New Exercise
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={isSaving} className="h-12 md:h-10">
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : mode === "create" ? "Finish Session" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
