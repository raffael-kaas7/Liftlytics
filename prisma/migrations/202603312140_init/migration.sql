CREATE TABLE "WorkoutSession" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "date" DATETIME NOT NULL,
  "notes" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "Exercise" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "category" TEXT,
  "isCompound" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "ExerciseEntry" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sessionId" TEXT NOT NULL,
  "exerciseId" TEXT NOT NULL,
  "notes" TEXT,
  "orderIndex" INTEGER NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ExerciseEntry_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "WorkoutSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ExerciseEntry_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "ExerciseSet" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "exerciseEntryId" TEXT NOT NULL,
  "setNumber" INTEGER NOT NULL,
  "reps" INTEGER NOT NULL,
  "weight" REAL NOT NULL,
  "notes" TEXT,
  "isWarmup" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ExerciseSet_exerciseEntryId_fkey" FOREIGN KEY ("exerciseEntryId") REFERENCES "ExerciseEntry" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Exercise_name_key" ON "Exercise"("name");
CREATE INDEX "WorkoutSession_date_idx" ON "WorkoutSession"("date");
CREATE INDEX "ExerciseEntry_sessionId_orderIndex_idx" ON "ExerciseEntry"("sessionId", "orderIndex");
CREATE INDEX "ExerciseEntry_exerciseId_idx" ON "ExerciseEntry"("exerciseId");
CREATE INDEX "ExerciseSet_exerciseEntryId_setNumber_idx" ON "ExerciseSet"("exerciseEntryId", "setNumber");
