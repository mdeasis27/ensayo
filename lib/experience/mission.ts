import promptsRaw from "@/lib/ensayo/data/prompts.json";
import { analyze } from "@/lib/ensayo/analyze";
import type { Experiment } from "@/lib/ensayo/types";
import type { DemoAdapter, TraceEvent } from "@/design-system/demo/types";

export type TasterStatus = "served" | "rerouted" | "lost";
export type MissionInput = { tasters: number };
export type MissionResult = { items: { id: string; status: TasterStatus }[]; newer: number; older: number; approved: boolean; majorityWouldShip: boolean; pValue: number };

const STEP = 5;
const PANEL = (promptsRaw.experiments as Experiment[]).find(e => e.id === "exp-3")!;
const ALPHA = promptsRaw.alpha;

/** The first n tasters of the synthetic panel through the real Welch gate. Each square pairs taster i's two scores for display only. */
export function tasteTest(n: number): MissionResult {
  if (!Number.isSafeInteger(n) || n < 2 || n > PANEL.baseline.scores.length) throw new Error("Choose between 2 and 40 tasters.");
  const base = PANEL.baseline.scores.slice(0, n), next = PANEL.variant.scores.slice(0, n);
  const items = base.map((b, i) => ({ id: `t${i + 1}`, status: (next[i] > b ? "served" : next[i] === b ? "rerouted" : "lost") as TasterStatus }));
  const newer = items.filter(i => i.status === "served").length, older = items.filter(i => i.status === "lost").length;
  const r = analyze({ ...PANEL, baseline: { ...PANEL.baseline, scores: base }, variant: { ...PANEL.variant, scores: next } }, ALPHA);
  return { items, newer, older, approved: r.decision === "advance", majorityWouldShip: newer > older, pValue: r.pValue };
}

export const runMission: DemoAdapter<MissionInput, MissionResult> = async (input, signal, onEvent) => {
  const startedAt = performance.now();
  const result = tasteTest(input.tasters);
  const trace: TraceEvent[] = [];
  for (let i = 0; i < result.items.length; i += STEP) {
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    const event: TraceEvent = { id: `batch-${i / STEP + 1}`, step: i / STEP + 1, kind: "taste", messageKey: `batch.${i / STEP + 1}`, timestampMs: performance.now() - startedAt, evidenceIds: result.items.slice(i, i + STEP).map(t => t.id) };
    trace.push(event);
    onEvent(event);
  }
  if (signal.aborted) throw new DOMException("Aborted", "AbortError");
  return { input, result, trace, executionMs: performance.now() - startedAt, mode: "local" };
};
