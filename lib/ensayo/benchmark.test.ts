import { describe, expect, it } from "vitest";

import promptsRaw from "./data/prompts.json";
import fixture from "./fixtures/experiments.json";
import { decide } from "./analyze";
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
