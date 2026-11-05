import assert from "node:assert/strict";
import test from "node:test";

import { aggregateGpsValues } from "@/lib/gps-metrics";

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
