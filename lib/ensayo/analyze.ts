// lib/ensayo/analyze.ts
// Turns a Welch t-test into a rollout decision. Rollout only advances when the
// variant is *significantly better* (two-sided p < alpha and a positive delta);
// a significantly worse variant rolls back; anything else holds. This is the
// "no me pareció mejor, me lo demostró" gate.

import { welchTTest } from "./statistics";
import type { Decision, Experiment, ExperimentResult } from "./types";

export function decide(delta: number, pValue: number, alpha: number): Decision {
  if (pValue < alpha && delta > 0) return "advance";
  if (pValue < alpha && delta < 0) return "rollback";
  return "hold";
}

export function analyze(experiment: Experiment, alpha: number): ExperimentResult {
  const test = welchTTest(experiment.baseline.scores, experiment.variant.scores, alpha);
  const significant = test.pValue < alpha;
  const decision = decide(test.delta, test.pValue, alpha);
  return {
    id: experiment.id,
    name: experiment.name,
    baselineMean: test.baselineMean,
    variantMean: test.variantMean,
    delta: test.delta,
    t: test.t,
    df: test.df,
    pValue: test.pValue,
    ciLow: test.ciLow,
    ciHigh: test.ciHigh,
    significant,
    decision,
  };
}
