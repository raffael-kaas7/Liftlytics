import { format, isAfter, isBefore, startOfDay, subDays } from "date-fns";
import type { WorkingSetPoint } from "./types";

export function calculateEstimated1RM(weight: number, reps: number) {
  return weight * (1 + reps / 30);
}

export function calculateSetVolume(weight: number, reps: number) {
  return weight * reps;
}

export type ExercisePRs = {
  heaviestWeight: number;
  bestEstimated1RM: number;
  bestVolumeSet: number;
  totalLifetimeVolume: number;
  totalSessions: number;
  lastPerformedDate: Date | null;
  currentProjected1RM: number | null;
  allTimeProjected1RM: number | null;
  consistencyWeeks: number;
  averageRepsAtWorkingWeight: { weight: number; averageReps: number } | null;
  weightPRCount: number;
  estimated1RMPRCount: number;
  repPRs: Array<{ weight: number; reps: number }>;
};

export function deriveExercisePRs(points: WorkingSetPoint[]): ExercisePRs {
  const workingSets = points.filter((point) => !point.isWarmup);
  const sessions = new Set(workingSets.map((point) => point.sessionId));
  const now = new Date();
  const recentBoundary = subDays(now, 30);

  let heaviestWeight = 0;
  let bestEstimated1RM = 0;
  let bestVolumeSet = 0;
  let totalLifetimeVolume = 0;
  let lastPerformedDate: Date | null = null;
  let currentProjected1RM: number | null = null;
  const repsByWeight = new Map<number, number[]>();
  const repPRMap = new Map<number, number>();
  const weightPRDates = new Set<string>();
  const estimated1RMDates = new Set<string>();

  for (const point of workingSets) {
    const estimated1RM = calculateEstimated1RM(point.weight, point.reps);
    const volume = calculateSetVolume(point.weight, point.reps);

    heaviestWeight = Math.max(heaviestWeight, point.weight);
    bestEstimated1RM = Math.max(bestEstimated1RM, estimated1RM);
    bestVolumeSet = Math.max(bestVolumeSet, volume);
    totalLifetimeVolume += volume;

    if (!lastPerformedDate || isAfter(point.sessionDate, lastPerformedDate)) {
      lastPerformedDate = point.sessionDate;
    }

    if (isAfter(point.sessionDate, recentBoundary) && (!currentProjected1RM || estimated1RM > currentProjected1RM)) {
      currentProjected1RM = estimated1RM;
    }

    const repsAtWeight = repsByWeight.get(point.weight) ?? [];
    repsAtWeight.push(point.reps);
    repsByWeight.set(point.weight, repsAtWeight);

    const currentBestReps = repPRMap.get(point.weight) ?? 0;
    if (point.reps > currentBestReps) {
      repPRMap.set(point.weight, point.reps);
    }
  }

  let runningWeightPR = 0;
  let runningEpleyPR = 0;
  for (const point of [...workingSets].sort((a, b) => a.sessionDate.getTime() - b.sessionDate.getTime())) {
    if (point.weight > runningWeightPR) {
      runningWeightPR = point.weight;
      weightPRDates.add(point.sessionId);
    }
    const estimated1RM = calculateEstimated1RM(point.weight, point.reps);
    if (estimated1RM > runningEpleyPR) {
      runningEpleyPR = estimated1RM;
      estimated1RMDates.add(point.sessionId);
    }
  }

  const mostRepeatedWorkingWeight = [...repsByWeight.entries()].sort(
    (a, b) => b[1].length - a[1].length || b[0] - a[0]
  )[0];

  const consistencyWeeks = new Set(
    workingSets.map((point) => format(startOfDay(point.sessionDate), "yyyy-'W'II"))
  ).size;

  return {
    heaviestWeight,
    bestEstimated1RM,
    bestVolumeSet,
    totalLifetimeVolume,
    totalSessions: sessions.size,
    lastPerformedDate,
    currentProjected1RM,
    allTimeProjected1RM: bestEstimated1RM || null,
    consistencyWeeks,
    averageRepsAtWorkingWeight: mostRepeatedWorkingWeight
      ? {
          weight: mostRepeatedWorkingWeight[0],
          averageReps:
            mostRepeatedWorkingWeight[1].reduce((sum, reps) => sum + reps, 0) /
            mostRepeatedWorkingWeight[1].length
        }
      : null,
    weightPRCount: weightPRDates.size,
    estimated1RMPRCount: estimated1RMDates.size,
    repPRs: [...repPRMap.entries()].map(([weight, reps]) => ({ weight, reps }))
  };
}

export function deriveExerciseTrendData(points: WorkingSetPoint[]) {
  const grouped = new Map<
    string,
    {
      date: Date;
      volume: number;
      bestEstimated1RM: number;
      bestWeight: number;
      bestSetLabel: string;
    }
  >();

  for (const point of points.filter((point) => !point.isWarmup)) {
    const key = format(point.sessionDate, "yyyy-MM-dd");
    const existing = grouped.get(key) ?? {
      date: point.sessionDate,
      volume: 0,
      bestEstimated1RM: 0,
      bestWeight: 0,
      bestSetLabel: ""
    };
    existing.volume += calculateSetVolume(point.weight, point.reps);
    const estimated1RM = calculateEstimated1RM(point.weight, point.reps);
    if (estimated1RM > existing.bestEstimated1RM) {
      existing.bestEstimated1RM = estimated1RM;
      existing.bestWeight = point.weight;
      existing.bestSetLabel = `${point.weight} x ${point.reps}`;
    }
    grouped.set(key, existing);
  }

  return [...grouped.values()]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((item) => ({
      date: format(item.date, "MMM d"),
      isoDate: format(item.date, "yyyy-MM-dd"),
      volume: item.volume,
      bestEstimated1RM: item.bestEstimated1RM,
      bestWeight: item.bestWeight,
      bestSetLabel: item.bestSetLabel
    }));
}

export function deriveMomentumMetrics(recentPoints: WorkingSetPoint[], previousPoints: WorkingSetPoint[]) {
  const recentVolume = recentPoints
    .filter((point) => !point.isWarmup)
    .reduce((sum, point) => sum + calculateSetVolume(point.weight, point.reps), 0);
  const previousVolume = previousPoints
    .filter((point) => !point.isWarmup)
    .reduce((sum, point) => sum + calculateSetVolume(point.weight, point.reps), 0);

  const recentBest = Math.max(
    0,
    ...recentPoints.filter((point) => !point.isWarmup).map((point) => calculateEstimated1RM(point.weight, point.reps))
  );
  const previousBest = Math.max(
    0,
    ...previousPoints.filter((point) => !point.isWarmup).map((point) => calculateEstimated1RM(point.weight, point.reps))
  );

  return {
    recentVolume,
    previousVolume,
    volumeChangePct: previousVolume === 0 ? null : ((recentVolume - previousVolume) / previousVolume) * 100,
    recentBest,
    previousBest,
    strengthChangePct: previousBest === 0 ? null : ((recentBest - previousBest) / previousBest) * 100
  };
}

export function suggestNextMilestone(points: WorkingSetPoint[]) {
  const workingSets = points.filter((point) => !point.isWarmup);
  if (workingSets.length === 0) {
    return null;
  }

  const topSet = [...workingSets].sort((a, b) => {
    const epleyDiff =
      calculateEstimated1RM(b.weight, b.reps) - calculateEstimated1RM(a.weight, a.reps);
    if (epleyDiff !== 0) {
      return epleyDiff;
    }
    return b.weight - a.weight;
  })[0];

  const bestEstimated1RM = calculateEstimated1RM(topSet.weight, topSet.reps);
  const next1RMTarget = Math.ceil(bestEstimated1RM / 2.5) * 2.5;
  const repeatWeightSuggestion = `${topSet.weight} x ${topSet.reps + 1}`;
  const weightBump = topSet.weight === 0 ? 0 : Math.round((topSet.weight + 2.5) * 100) / 100;
  const weightBumpSuggestion = `${weightBump} x ${topSet.reps}`;

  return {
    topSet: `${topSet.weight} x ${topSet.reps}`,
    next1RMTarget: next1RMTarget <= bestEstimated1RM ? next1RMTarget + 2.5 : next1RMTarget,
    repeatWeightSuggestion,
    weightBumpSuggestion
  };
}

export function splitRecentAndPrevious(points: WorkingSetPoint[], days = 30) {
  const end = new Date();
  const recentStart = subDays(end, days);
  const previousStart = subDays(recentStart, days);

  return {
    recent: points.filter(
      (point) => !isBefore(point.sessionDate, recentStart) && !isAfter(point.sessionDate, end)
    ),
    previous: points.filter(
      (point) => !isBefore(point.sessionDate, previousStart) && isBefore(point.sessionDate, recentStart)
    )
  };
}

export function getPRBadgesForSet(
  point: WorkingSetPoint,
  previousPoints: WorkingSetPoint[]
) {
  if (point.isWarmup) {
    return [];
  }

  const priorWorkingSets = previousPoints.filter((item) => !item.isWarmup);
  const maxWeight = Math.max(0, ...priorWorkingSets.map((item) => item.weight));
  const maxEpley = Math.max(
    0,
    ...priorWorkingSets.map((item) => calculateEstimated1RM(item.weight, item.reps))
  );
  const maxVolume = Math.max(
    0,
    ...priorWorkingSets.map((item) => calculateSetVolume(item.weight, item.reps))
  );
  const repsAtSameWeight = priorWorkingSets
    .filter((item) => item.weight === point.weight)
    .map((item) => item.reps);
  const maxRepsAtWeight = Math.max(0, ...repsAtSameWeight);

  const badges: string[] = [];
  if (point.weight > maxWeight) {
    badges.push("Weight PR");
  }
  if (calculateEstimated1RM(point.weight, point.reps) > maxEpley) {
    badges.push("1RM PR");
  }
  if (calculateSetVolume(point.weight, point.reps) > maxVolume) {
    badges.push("Volume PR");
  }
  if (point.reps > maxRepsAtWeight) {
    badges.push("Rep PR");
  }
  return badges;
}

export function getWeeklyFrequencyChart(dates: Date[]) {
  const grouped = new Map<string, number>();
  for (const date of dates) {
    const key = format(date, "MMM d");
    grouped.set(key, (grouped.get(key) ?? 0) + 1);
  }
  return [...grouped.entries()].map(([label, sessions]) => ({ label, sessions }));
}
