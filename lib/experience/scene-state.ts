import type { TapeStatus } from "@/design-system/demo/outcome-tape";
import type { PlaybackFrame } from "@/design-system/demo/playback";
import type { TraceEvent } from "@/design-system/demo/types";
import type { TasterStatus } from "./mission";

export function tasterCells(items: readonly { id: string; status: TasterStatus }[], revealed: number): TapeStatus[] {
  return items.map((c, i) => (i >= revealed ? "pending" : c.status));
}

export function revealedTasters(frame: { visible: number; total: number; complete: boolean }, n: number, reducedMotion: boolean): number {
  if (reducedMotion || frame.complete || frame.total === 0) return n;
  return Math.ceil((n * frame.visible) / frame.total);
}

export const COMPLETE_FRAME: PlaybackFrame<TraceEvent> = { visible: 0, total: 0, event: undefined, complete: true };

/** Width of the evidence bar in percent: 1 - p, a display simplification. The 95% line matches alpha 0.05. */
export function evidenceFill(pValue: number): number {
  return Math.min(100, Math.max(0, (1 - pValue) * 100));
}
