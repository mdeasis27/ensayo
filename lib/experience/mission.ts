import { runExperience, type ExperienceInput } from "./adapter";
import type { DemoAdapter } from "@/design-system/demo/types";

type ExperienceResult = Awaited<ReturnType<typeof runExperience>>["result"];
export type MissionResult = ExperienceResult & {
  comparison: { strict: ExperienceResult; permissive: ExperienceResult };
};

export const runMission: DemoAdapter<ExperienceInput, MissionResult> = async (input, signal, onEvent) => {
  const started = performance.now();
  const run = await runExperience(input, signal, onEvent);
  const strict = await runExperience({ ...input, alpha: .01 }, signal, () => {});
  const permissive = await runExperience({ ...input, alpha: .10 }, signal, () => {});
  if (signal.aborted) throw new DOMException("Aborted", "AbortError");
  return { ...run, executionMs: performance.now() - started, result: { ...run.result, comparison: { strict: strict.result, permissive: permissive.result } } };
};
