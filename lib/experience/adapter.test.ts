import { describe, expect, it } from "vitest";
import { runExperience } from "./adapter";

describe("experiment experience", () => {
  it("advances a supported improvement and holds an inconclusive sample", async () => {
    const advance = await runExperience({ baseline: [0.3, 0.31, 0.3, 0.32, 0.31], variant: [0.8, 0.81, 0.79, 0.82, 0.8], alpha: 0.05 });
    const hold = await runExperience({ baseline: [0.5, 0.51, 0.49, 0.5, 0.51], variant: [0.5, 0.51, 0.49, 0.5, 0.51], alpha: 0.05 });
    expect(advance.result.decision).toBe("advance");
    expect(hold.result.decision).toBe("hold");
  });
  it("refuses non-finite score samples", async () => {
    await expect(runExperience({ baseline: [0.2, Number.NaN], variant: [0.3, 0.4], alpha: 0.05 })).rejects.toThrow("finite");
  });
  it("refuses a non-finite significance level", async () => {
    await expect(runExperience({ baseline: [.4, .5], variant: [.6, .7], alpha: Number.NaN })).rejects.toThrow("alpha");
  });
  it("explains an undefined Welch test rather than returning NaN for constant samples", async () => {
    await expect(runExperience({ baseline: [.5, .5], variant: [.6, .6], alpha: .05 })).rejects.toThrow("undefined");
  });
  it("allows a constant sample when the other sample has variation", async () => {
    const run = await runExperience({ baseline: [.5, .5], variant: [.55, .65], alpha: .05 });
    expect(Number.isFinite(run.result.pValue)).toBe(true);
    expect(Number.isFinite(run.result.ciLow)).toBe(true);
    expect(Number.isFinite(run.result.ciHigh)).toBe(true);
  });
});
