import { addDays, subDays } from "date-fns";

type SeedSet = {
  reps: number;
  weight: number;
  isWarmup?: boolean;
  notes?: string;
};

type SeedExercise = {
  name: string;
  notes?: string;
  sets: SeedSet[];
};

type SeedSession = {
  date: Date;
  notes?: string;
  exercises: SeedExercise[];
};

export const exerciseSeeds = [
  { name: "Bench Press", category: "Chest", isCompound: true },
  { name: "Incline Bench Press", category: "Chest", isCompound: true },
  { name: "Squat", category: "Legs", isCompound: true },
  { name: "Deadlift", category: "Back", isCompound: true },
  { name: "Overhead Press", category: "Shoulders", isCompound: true },
  { name: "Pull-Up", category: "Back", isCompound: true },
  { name: "Barbell Row", category: "Back", isCompound: true },
  { name: "Lat Pulldown", category: "Back", isCompound: false },
  { name: "Leg Press", category: "Legs", isCompound: false },
  { name: "Romanian Deadlift", category: "Legs", isCompound: true },
  { name: "Dumbbell Curl", category: "Arms", isCompound: false },
  { name: "Triceps Pushdown", category: "Arms", isCompound: false },
  { name: "Lateral Raise", category: "Shoulders", isCompound: false }
] as const;

export function getSampleSessions(today = new Date()) {
  const sessions: SeedSession[] = [
    {
      date: subDays(today, 26),
      notes: "Strong upper session. Bench moved well.",
      exercises: [
        {
          name: "Bench Press",
          notes: "Paused first rep on working sets.",
          sets: [
            { reps: 8, weight: 20, isWarmup: true },
            { reps: 5, weight: 85 },
            { reps: 5, weight: 87.5 },
            { reps: 4, weight: 90, notes: "Last rep grind" }
          ]
        },
        {
          name: "Barbell Row",
          sets: [
            { reps: 10, weight: 60 },
            { reps: 10, weight: 65 },
            { reps: 8, weight: 70 }
          ]
        },
        {
          name: "Triceps Pushdown",
          sets: [
            { reps: 12, weight: 25 },
            { reps: 12, weight: 27.5 },
            { reps: 10, weight: 30 }
          ]
        }
      ]
    },
    {
      date: subDays(today, 21),
      notes: "Lower day, steady progress.",
      exercises: [
        {
          name: "Squat",
          sets: [
            { reps: 5, weight: 60, isWarmup: true },
            { reps: 5, weight: 100 },
            { reps: 5, weight: 105 },
            { reps: 5, weight: 107.5 }
          ]
        },
        {
          name: "Romanian Deadlift",
          sets: [
            { reps: 8, weight: 80 },
            { reps: 8, weight: 85 },
            { reps: 8, weight: 90 }
          ]
        },
        {
          name: "Leg Press",
          sets: [
            { reps: 12, weight: 160 },
            { reps: 12, weight: 180 },
            { reps: 10, weight: 200 }
          ]
        }
      ]
    },
    {
      date: subDays(today, 16),
      notes: "Volume-focused upper day.",
      exercises: [
        {
          name: "Incline Bench Press",
          sets: [
            { reps: 8, weight: 60 },
            { reps: 8, weight: 62.5 },
            { reps: 7, weight: 65 }
          ]
        },
        {
          name: "Pull-Up",
          sets: [
            { reps: 8, weight: 0 },
            { reps: 7, weight: 0 },
            { reps: 6, weight: 0 }
          ]
        },
        {
          name: "Lateral Raise",
          sets: [
            { reps: 15, weight: 8 },
            { reps: 14, weight: 8 },
            { reps: 12, weight: 10 }
          ]
        }
      ]
    },
    {
      date: subDays(today, 11),
      notes: "Deadlift focus, low volume after top set.",
      exercises: [
        {
          name: "Deadlift",
          notes: "Mixed grip on top set.",
          sets: [
            { reps: 5, weight: 70, isWarmup: true },
            { reps: 5, weight: 120 },
            { reps: 4, weight: 130 },
            { reps: 3, weight: 140 }
          ]
        },
        {
          name: "Lat Pulldown",
          sets: [
            { reps: 12, weight: 55 },
            { reps: 10, weight: 60 },
            { reps: 10, weight: 62.5 }
          ]
        },
        {
          name: "Dumbbell Curl",
          sets: [
            { reps: 12, weight: 14 },
            { reps: 10, weight: 16 },
            { reps: 10, weight: 16 }
          ]
        }
      ]
    },
    {
      date: subDays(today, 6),
      notes: "Push day with better bar speed than last week.",
      exercises: [
        {
          name: "Bench Press",
          sets: [
            { reps: 5, weight: 20, isWarmup: true },
            { reps: 5, weight: 87.5 },
            { reps: 5, weight: 90 },
            { reps: 4, weight: 92.5 }
          ]
        },
        {
          name: "Overhead Press",
          sets: [
            { reps: 6, weight: 45 },
            { reps: 5, weight: 47.5 },
            { reps: 5, weight: 50 }
          ]
        },
        {
          name: "Triceps Pushdown",
          sets: [
            { reps: 12, weight: 30 },
            { reps: 10, weight: 32.5 },
            { reps: 10, weight: 35 }
          ]
        }
      ]
    },
    {
      date: subDays(today, 2),
      notes: "Solid lower session. Squat PR on estimated 1RM.",
      exercises: [
        {
          name: "Squat",
          sets: [
            { reps: 5, weight: 60, isWarmup: true },
            { reps: 5, weight: 105 },
            { reps: 5, weight: 110 },
            { reps: 4, weight: 115 }
          ]
        },
        {
          name: "Romanian Deadlift",
          sets: [
            { reps: 8, weight: 85 },
            { reps: 8, weight: 92.5 },
            { reps: 8, weight: 95 }
          ]
        },
        {
          name: "Leg Press",
          sets: [
            { reps: 12, weight: 190 },
            { reps: 10, weight: 210 },
            { reps: 10, weight: 220 }
          ]
        }
      ]
    }
  ];

  return sessions.map((session, index) => ({
    ...session,
    date: addDays(session.date, index % 2 === 0 ? 0 : 1)
  }));
}
