ALTER TABLE "WorkoutSession"
ADD COLUMN "bodyWeight" DOUBLE PRECISION;

ALTER TABLE "Exercise"
ADD COLUMN "includeBodyWeightInVolume" BOOLEAN NOT NULL DEFAULT false;
