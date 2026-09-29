// lib/ensayo/benchmark.ts
// Runs every experiment through the A/B gate and collects the rollout outcome.

import { analyze } from "./analyze";
import type { BenchmarkResult, Experiment } from "./types";

export function benchmark(experiments: readonly Experiment[], alpha: number): BenchmarkResult {
  return {
    alpha,
    experiments: experiments.map((e) => analyze(e, alpha)),
  };
}
