import { describe, expect, it } from "vitest";

import promptsRaw from "./data/prompts.json";
import fixture from "./fixtures/experiments.json";
import { analyze, decide } from "./analyze";
import { benchmark } from "./benchmark";
import type { Experiment } from "./types";

const EXPERIMENTS = promptsRaw.experiments as Experiment[];
const ALPHA = promptsRaw.alpha as number;

describe("decide", () => {
  it("advances a significantly better variant", () => {
    expect(decide(0.1, 0.001, 0.05)).toBe("advance");
  });

  it("rolls back a significantly worse variant", () => {
    expect(decide(-0.1, 0.001, 0.05)).toBe("rollback");
  });

  it("holds when the evidence is not significant", () => {
    expect(decide(0.1, 0.3, 0.05)).toBe("hold");
    expect(decide(-0.01, 0.2, 0.05)).toBe("hold");
  });
});

describe("pinned fixture: experiments", () => {
  it("reproduces the reference statistics and rollout decisions", () => {
    const result = benchmark(EXPERIMENTS, ALPHA);
    expect(result.alpha).toBe(fixture.alpha);

    for (const expected of fixture.experiments) {
      const got = result.experiments.find((e) => e.id === expected.id)!;
      expect(got.baselineMean).toBeCloseTo(expected.baselineMean, 10);
      expect(got.variantMean).toBeCloseTo(expected.variantMean, 10);
      expect(got.delta).toBeCloseTo(expected.delta, 10);
      expect(got.t).toBeCloseTo(expected.t, 10);
      expect(got.df).toBeCloseTo(expected.df, 10);
      expect(got.pValue).toBeCloseTo(expected.pValue, 10);
      expect(got.ciLow).toBeCloseTo(expected.ciLow, 10);
      expect(got.ciHigh).toBeCloseTo(expected.ciHigh, 10);
      expect(got.significant).toBe(expected.significant);
      expect(got.decision).toBe(expected.decision);
    }
  });

  it("advances only the variant with a positive, significant delta", () => {
    const result = benchmark(EXPERIMENTS, ALPHA);
    const exp1 = result.experiments.find((e) => e.id === "exp-1")!;
    const exp2 = result.experiments.find((e) => e.id === "exp-2")!;
    expect(exp1.decision).toBe("advance");
    expect(exp2.decision).toBe("hold");
    expect(exp2.ciLow).toBeLessThan(0);
    expect(exp2.ciHigh).toBeGreaterThan(0);
  });
});

describe("synthetic taste panel exp-3", () => {
  const exp3 = EXPERIMENTS.find((e) => e.id === "exp-3")!;
  const first = (n: number) => analyze({ ...exp3, baseline: { ...exp3.baseline, scores: exp3.baseline.scores.slice(0, n) }, variant: { ...exp3.variant, scores: exp3.variant.scores.slice(0, n) } }, ALPHA).decision;

  it("holds with up to 20 tasters and advances from 25", () => {
    expect([5, 10, 15, 20].map(first)).toEqual(["hold", "hold", "hold", "hold"]);
    expect([25, 30, 35, 40].map(first)).toEqual(["advance", "advance", "advance", "advance"]);
  });

  it("is pinned in the shared fixture", () => {
    expect(fixture.experiments.map((e) => e.id)).toContain("exp-3");
  });
});
