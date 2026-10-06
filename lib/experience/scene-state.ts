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
