import { describe, expect, it } from "vitest";

import { mean, sampleVariance, tCDF, tQuantile, welchTTest } from "./statistics";

describe("mean / sampleVariance", () => {
  it("computes the sample mean", () => {
    expect(mean([1, 2, 3, 4])).toBeCloseTo(2.5, 12);
  });

  it("computes the unbiased sample variance", () => {
    expect(sampleVariance([1, 2, 3, 4])).toBeCloseTo(5 / 3, 12);
  });
});

describe("t distribution", () => {
  it("tCDF(0, df) is 0.5", () => {
    expect(tCDF(0, 10)).toBeCloseTo(0.5, 12);
  });

  it("tCDF is symmetric and monotonic", () => {
    expect(tCDF(-2, 10)).toBeCloseTo(1 - tCDF(2, 10), 12);
    expect(tCDF(1, 10)).toBeGreaterThan(tCDF(0, 10));
    expect(tCDF(2, 10)).toBeGreaterThan(tCDF(1, 10));
  });

  it("tQuantile inverts tCDF", () => {
    expect(tCDF(tQuantile(0.975, 10), 10)).toBeCloseTo(0.975, 8);
  });
});

describe("welchTTest", () => {
  it("detects a clear mean difference", () => {
    const a = Array.from({ length: 24 }, (_, i) => 0.7 + (i % 5) * 0.02);
    const b = Array.from({ length: 24 }, (_, i) => 0.8 + (i % 5) * 0.02);
    const r = welchTTest(a, b, 0.05);
    expect(r.delta).toBeGreaterThan(0);
    expect(r.pValue).toBeLessThan(0.05);
  });

  it("returns a wide p-value for identical distributions", () => {
    const a = Array.from({ length: 24 }, (_, i) => 0.7 + (i % 5) * 0.02);
    const r = welchTTest(a, [...a], 0.05);
    expect(r.delta).toBeCloseTo(0, 12);
    expect(r.pValue).toBeCloseTo(1, 6);
  });
});
