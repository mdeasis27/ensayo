// lib/ensayo/types.ts
// Core data shapes for the prompt A/B testing demo. All fields are plain
// JSON-serializable so the same types are mirrored one-to-one in the Python
// backend (backend/src/ensayo/types.py).

export interface PromptVersion {
  version: string;
  prompt: string;
  scores: number[];
}

export interface Experiment {
  id: string;
  name: string;
  baseline: PromptVersion;
  variant: PromptVersion;
}

export interface TTestResult {
  baselineMean: number;
  variantMean: number;
  delta: number;
  t: number;
  df: number;
  pValue: number;
  ciLow: number;
  ciHigh: number;
  significant: boolean;
}

export type Decision = "advance" | "rollback" | "hold";

export interface ExperimentResult extends TTestResult {
  id: string;
  name: string;
  decision: Decision;
}

export interface BenchmarkResult {
  alpha: number;
  experiments: ExperimentResult[];
}
