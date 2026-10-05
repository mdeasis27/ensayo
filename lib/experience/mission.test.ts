import { expect, test } from "vitest";
import { runMission } from "./mission";

const input = { baseline: [.4, .5, .6, .5, .4], variant: [.55, .65, .75, .65, .55], alpha: .05 };

test("same samples hold at one percent and advance at ten percent", async () => {
  const run = await runMission(input, new AbortController().signal, () => {});
  expect(run.result.comparison.strict.decision).toBe("hold");
  expect(run.result.comparison.permissive.decision).toBe("advance");
  expect(run.result.comparison.strict.pValue).toBe(run.result.comparison.permissive.pValue);
  expect(run.result.comparison.strict.delta).toBeCloseTo(.15);
  expect(run.input).toEqual(input);
});

test("both significance policies roll back a clear regression", async () => {
  const run = await runMission({ baseline: [.8, .81, .79], variant: [.3, .31, .29], alpha: .05 }, new AbortController().signal, () => {});
  expect(run.result.comparison.strict.decision).toBe("rollback");
  expect(run.result.comparison.permissive.decision).toBe("rollback");
});

test("abort from a trace callback prevents returning a comparison", async () => {
  const controller = new AbortController();
  await expect(runMission(input, controller.signal, () => controller.abort())).rejects.toMatchObject({ name: "AbortError" });
});

test("cancelling at the sample emits no decision afterward", async () => {
  const controller = new AbortController();
  const emitted: string[] = [];
  await expect(runMission(input, controller.signal, event => {
    emitted.push(event.id);
    controller.abort();
  })).rejects.toMatchObject({ name: "AbortError" });
  expect(emitted).toEqual(["sample"]);
});
