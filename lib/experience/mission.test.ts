import { expect, it } from "vitest";
import { runMission, tasteTest } from "./mission";

it("with 10 tasters most prefer the new recipe, yet the test holds", () => {
  const r = tasteTest(10);
  expect(r.items.map(i => i.status[0]).join("")).toHaveLength(10);
  expect({ newer: r.newer, older: r.older }).toEqual({ newer: 6, older: 3 });
  expect(r.approved).toBe(false);
  expect(r.majorityWouldShip).toBe(true);
});

it("sweep: both bet answers are reachable on the slider, and the default says no", () => {
  const answers = new Set<boolean>();
  for (let n = 5; n <= 40; n += 5) answers.add(tasteTest(n).approved);
  expect([...answers].sort()).toEqual([false, true]);
  expect(tasteTest(20).approved).toBe(false);
  expect(tasteTest(25).approved).toBe(true);
});

it("runs the mission, reveals tasters five at a time and stops when cancelled", async () => {
  const ids: string[] = [];
  const run = await runMission({ tasters: 40 }, new AbortController().signal, e => ids.push(e.id));
  expect(run.result.items).toHaveLength(40);
  expect(ids).toEqual(run.trace.map(e => e.id));
  expect(ids).toHaveLength(8);
  const c = new AbortController(); c.abort();
  await expect(runMission({ tasters: 10 }, c.signal, () => {})).rejects.toThrow();
});
