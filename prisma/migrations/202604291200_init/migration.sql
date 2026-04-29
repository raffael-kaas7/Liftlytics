CREATE TABLE "WorkoutSession" (
  "id" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "bodyWeight" DOUBLE PRECISION,
  "notes" TEXT,
  "loggedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "WorkoutSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Exercise" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT,
  "isCompound" BOOLEAN NOT NULL DEFAULT false,
  "includeBodyWeightInVolume" BOOLEAN NOT NULL DEFAULT false,
  "bodyWeightVolumeMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExerciseEntry" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "exerciseId" TEXT NOT NULL,
  "notes" TEXT,
  "orderIndex" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ExerciseEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExerciseSet" (
  "id" TEXT NOT NULL,
  "exerciseEntryId" TEXT NOT NULL,
  "setNumber" INTEGER NOT NULL,
  "reps" INTEGER NOT NULL,
  "weight" DOUBLE PRECISION NOT NULL,
  "notes" TEXT,
  "isWarmup" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ExerciseSet_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Exercise_name_key" ON "Exercise"("name");
CREATE INDEX "WorkoutSession_date_idx" ON "WorkoutSession"("date");
CREATE INDEX "ExerciseEntry_sessionId_orderIndex_idx" ON "ExerciseEntry"("sessionId", "orderIndex");
CREATE INDEX "ExerciseEntry_exerciseId_idx" ON "ExerciseEntry"("exerciseId");
CREATE INDEX "ExerciseSet_exerciseEntryId_setNumber_idx" ON "ExerciseSet"("exerciseEntryId", "setNumber");

ALTER TABLE "ExerciseEntry"
  ADD CONSTRAINT "ExerciseEntry_sessionId_fkey"
  FOREIGN KEY ("sessionId") REFERENCES "WorkoutSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ExerciseEntry"
  ADD CONSTRAINT "ExerciseEntry_exerciseId_fkey"
  FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ExerciseSet"
  ADD CONSTRAINT "ExerciseSet_exerciseEntryId_fkey"
  FOREIGN KEY ("exerciseEntryId") REFERENCES "ExerciseEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
