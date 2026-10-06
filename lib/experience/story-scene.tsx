"use client";
import type { PlaybackFrame } from "@/design-system/demo/playback";
import type { TraceEvent } from "@/design-system/demo/types";
import { StoryStage } from "@/design-system/demo/decision-lab";
import { OutcomeTape, useReducedMotion } from "@/design-system/demo/project-story";
import { tapeCounts } from "@/design-system/demo/outcome-tape";
import { FlowDiagram, type FlowTone } from "@/design-system/demo/flow-diagram";
import type { MissionResult } from "./mission";
import { tasterCells, revealedTasters } from "./scene-state";
import { STORY } from "./story";

const POS = { tasters: { x: 10, y: 95 }, test: { x: 230, y: 95 }, launch: { x: 470, y: 20 }, wait: { x: 470, y: 170 } } as const;

export function EnsayoStoryScene({ frame, result, locale }: { frame: PlaybackFrame<TraceEvent>; result: MissionResult; locale: "en" | "es" }) {
  const copy = STORY[locale].scene;
  const reduced = useReducedMotion();
  const cells = tasterCells(result.items, revealedTasters(frame, result.items.length, reduced));
  const c = tapeCounts(cells);
  const done = c.pending === 0;
  const tone: Record<keyof typeof POS, FlowTone> = {
    tasters: "idle",
    test: "active",
    launch: done && result.approved ? "success" : "idle",
    wait: done && !result.approved ? "active" : "idle",
  };
  const nodes = (Object.keys(POS) as (keyof typeof POS)[]).map(id => ({ id, ...POS[id], ...copy.nodes[id], tone: tone[id] }));
  return <StoryStage locale={locale} title={copy.title} caption={copy.caption} step={frame.visible} total={frame.total}>
    <FlowDiagram nodes={nodes} width={640} height={260} ariaLabel={copy.preferOf(c.served, result.items.length)} statusLabels={copy.statusLabels} edges={[
      { from: "tasters", to: "test" },
      { from: "test", to: "launch", tone: done && result.approved ? "success" : "idle" },
      { from: "test", to: "wait" },
    ]} />
    <div className="mt-6">
      <OutcomeTape cells={cells} labels={copy.tape} ariaLabel={copy.tapeLabel} columns={10} />
      <p className="mt-4 font-mono text-2xl font-semibold tracking-tight">{copy.preferOf(c.served, result.items.length)}</p>
    </div>
  </StoryStage>;
}
