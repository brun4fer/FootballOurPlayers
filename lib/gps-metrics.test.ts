import assert from "node:assert/strict";
import test from "node:test";

import { aggregateGpsValues } from "@/lib/gps-metrics";
import { aggregateTrainingGpsBySession } from "@/lib/training-gps-analytics";

test("aggregates team GPS totals while keeping the highest maximum speed", () => {
  const aggregate = aggregateGpsValues([
    { minutesPlayed: 90, totalDistance: 10000.5, maximumSpeed: 31.2, sprints: 18 },
    { minutesPlayed: 75, totalDistance: 8200.25, maximumSpeed: 33.8, sprints: 12 },
  ]);

  assert.equal(aggregate.minutesPlayed, 165);
  assert.equal(aggregate.totalDistance, 18200.75);
  assert.equal(aggregate.maximumSpeed, 33.8);
  assert.equal(aggregate.sprints, 30);
});

test("keeps one training duration when aggregating several players in the same session", () => {
  const rows = [
    { id: 1, trainingSessionId: 10, playerId: 1, playerName: "A", seasonId: 1, seasonName: "2026/27", teamName: "Team", trainingDate: "2026-11-09", microcycleNumber: 4, trainingUnitNumber: 2, minutesPlayed: 90, totalDistance: 6000, maximumSpeed: 30 },
    { id: 2, trainingSessionId: 10, playerId: 2, playerName: "B", seasonId: 1, seasonName: "2026/27", teamName: "Team", trainingDate: "2026-11-09", microcycleNumber: 4, trainingUnitNumber: 2, minutesPlayed: 90, totalDistance: 5500, maximumSpeed: 31 },
  ] as Parameters<typeof aggregateTrainingGpsBySession>[0];

  const [training] = aggregateTrainingGpsBySession(rows);
  assert.equal(training.values.minutesPlayed, 90);
  assert.equal(training.values.totalDistance, 11500);
  assert.equal(training.values.maximumSpeed, 31);
});
