import { z } from "zod";

const setSchema = z.object({
  reps: z.number().int().positive(),
  weight: z.number().min(0),
  notes: z.string().trim().max(280).optional().or(z.literal("")),
  isWarmup: z.boolean().optional().default(false)
});

const exerciseSchema = z
  .object({
    exerciseId: z.string().trim().optional(),
    exerciseName: z.string().trim().optional(),
    category: z.string().trim().optional(),
    isCompound: z.boolean().optional(),
    notes: z.string().trim().max(500).optional().or(z.literal("")),
    orderIndex: z.number().int().min(0),
    sets: z.array(setSchema).min(1)
  })
  .refine((value) => Boolean(value.exerciseId || value.exerciseName), {
    message: "Exercise selection or inline exercise name is required"
  });

export const workoutSessionSchema = z.object({
  date: z.string().min(1),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  exercises: z.array(exerciseSchema).min(1)
});

export type WorkoutSessionPayload = z.infer<typeof workoutSessionSchema>;
