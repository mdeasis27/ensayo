// lib/ensayo/demo.ts
// Wires committed prompt versions + judge scores into every number the
// dashboard displays. The "judge" is committed, deterministic score arrays
// (a documented proxy for a real LLM-as-judge); the statistical test is real.

import promptsRaw from "./data/prompts.json";
import { benchmark } from "./benchmark";
import type { BenchmarkResult, Experiment } from "./types";

const ALPHA = promptsRaw.alpha as number;
const EXPERIMENTS = promptsRaw.experiments as Experiment[];

let memoBenchmark: BenchmarkResult | null = null;

export function getBenchmark(): BenchmarkResult {
  if (!memoBenchmark) {
    memoBenchmark = benchmark(EXPERIMENTS, ALPHA);
  }
  return memoBenchmark;
}

export function getAlpha(): number {
  return ALPHA;
}

export function getExperiments(): Experiment[] {
  return EXPERIMENTS;
}

export function getLift(expId: string): number {
  const r = getBenchmark().experiments.find((e) => e.id === expId)!;
  return r.variantMean - r.baselineMean;
}
