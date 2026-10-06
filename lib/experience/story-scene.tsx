"use client";
import type { PlaybackFrame } from "@/design-system/demo/playback";
import type { TraceEvent } from "@/design-system/demo/types";
import { StoryStage } from "@/design-system/demo/decision-lab";
import { useReducedMotion } from "@/design-system/demo/project-story";
import { tapeCounts } from "@/design-system/demo/outcome-tape";
import type { MissionResult, TasterStatus } from "./mission";
import { tasterCells, revealedTasters, evidenceFill } from "./scene-state";
import { STORY } from "./story";

const W = 360, ROW = 100, STATUSES = ["served", "rerouted", "lost"] as const;
const FILL: Record<TasterStatus, string> = { served: "fill-success", rerouted: "fill-info", lost: "fill-danger" };
const FADE = "transition-opacity duration-500 motion-reduce:transition-none";

/** A colored token with a symbol inside (check, equals, cross), so color is never the only cue. */
function Token({ status, cx, cy, r }: { status: TasterStatus; cx: number; cy: number; r: number }) {
  const s = { stroke: "white", strokeWidth: r / 3.5, strokeLinecap: "round" as const, fill: "none" };
  return <g>
    <circle cx={cx} cy={cy} r={r} className={FILL[status]} />
    {status === "served" && <path d={`M${cx - r * .45} ${cy} l${r * .3} ${r * .35} l${r * .6} ${-r * .7}`} {...s} />}
    {status === "rerouted" && <path d={`M${cx - r * .45} ${cy - r * .22} h${r * .9} M${cx - r * .45} ${cy + r * .22} h${r * .9}`} {...s} />}
    {status === "lost" && <path d={`M${cx - r * .4} ${cy - r * .4} l${r * .8} ${r * .8} M${cx + r * .4} ${cy - r * .4} l${-r * .8} ${r * .8}`} {...s} />}
  </g>;
}

export function EnsayoStoryScene({ frame, result, locale }: { frame: PlaybackFrame<TraceEvent>; result: MissionResult; locale: "en" | "es" }) {
  const copy = STORY[locale].scene;
  const reduced = useReducedMotion();
  const n = result.items.length;
  const revealed = revealedTasters(frame, n, reduced);
  const c = tapeCounts(tasterCells(result.items, revealed));
  const done = c.pending === 0;
  const cols = Math.min(n, 10), sw = W / cols, rows = Math.ceil(n / cols);
  const seat = (i: number) => ({ x: (i % cols + .5) * sw, y: Math.floor(i / cols) * ROW });
  // Within a batch of five, tokens land one after another.
  const delay = (i: number) => ({ transitionDelay: reduced ? "0ms" : `${(i % 5) * 120}ms` });
  const plate = seat(Math.max(0, revealed - 1));
  const jarH = Math.ceil(n / 5) * 12 + 4; // a jar fits every taster even if all agree

  return <StoryStage locale={locale} title={copy.title} caption={copy.caption} step={frame.visible} total={frame.total}>
    <svg viewBox={`0 0 ${W} ${rows * ROW}`} className="block h-auto w-full" role="img" aria-label={copy.tableLabel(revealed, n)}>
      {Array.from({ length: rows }, (_, r) => <rect key={r} x={4} y={r * ROW + 68} width={W - 8} height={8} rx={3} className="fill-foreground/25" />)}
      {result.items.map((t, i) => {
        const { x, y } = seat(i), on = i < revealed;
        return <g key={t.id} data-seat={on ? t.status : "pending"}>
          <g className={FADE} style={{ opacity: on ? 1 : .35 }}>
            <circle cx={x} cy={y + 42} r={8} className="fill-foreground/40" />
            <path d={`M${x - 12} ${y + 68} q0 -16 12 -16 q12 0 12 16z`} className="fill-foreground/30" />
          </g>
          <g className={FADE} style={{ opacity: on ? 1 : 0, ...delay(i) }}><Token status={t.status} cx={x} cy={y + 14} r={Math.min(11, sw / 3.2)} /></g>
          <text x={x} y={y + 93} textAnchor="middle" fontSize={13} className="fill-muted-foreground">{i + 1}</text>
        </g>;
      })}
      {!done && revealed > 0 && <g aria-hidden="true" className="transition-transform duration-500 motion-reduce:transition-none" style={{ transform: `translate(${plate.x}px, ${plate.y + 66}px)` }}>
        <ellipse cx={0} cy={0} rx={13} ry={4} className="fill-foreground/70" />
        <circle cx={-5} cy={-3} r={3.5} className="fill-warning" /><circle cx={5} cy={-3} r={3.5} className="fill-warning/60" />
      </g>}
    </svg>

    <div className="mt-6 grid gap-6 sm:grid-cols-2">
      <ul className="grid grid-cols-3 gap-2">
        {STATUSES.map(st => {
          const of = result.items.map((t, i) => ({ ...t, i })).filter(t => t.status === st);
          return <li key={st} data-jar={st} className="flex min-w-0 flex-col items-center rounded-lg border border-border p-2">
            <span className="font-mono text-2xl font-semibold">{c[st]}</span>
            <svg viewBox={`0 0 64 ${jarH}`} aria-hidden="true" className="my-1 h-auto w-full max-w-20">
              {of.map((t, k) => <g key={t.id} className={FADE} style={{ opacity: t.i < revealed ? 1 : 0, ...delay(t.i) }}><Token status={st} cx={8 + (k % 5) * 12} cy={jarH - 8 - Math.floor(k / 5) * 12} r={5} /></g>)}
            </svg>
            <span className="text-center text-xs font-medium">{copy.jars[st]}</span>
            <span className="sr-only">{copy.tape[st]}</span>
          </li>;
        })}
      </ul>

      <div className="min-w-0">
        <p className="text-sm font-semibold">{copy.luck}</p>
        <p className="text-xs text-muted-foreground">{copy.luckNote}</p>
        <div aria-hidden="true" className="relative mt-3 h-4 rounded-full bg-foreground/10">
          <div data-evidence-fill className="h-full rounded-full bg-warning transition-[width] duration-1000 ease-out motion-reduce:transition-none" style={{ width: `${done ? evidenceFill(result.pValue) : 0}%` }} />
          <div className="absolute -bottom-1 -top-1 left-[95%] border-l-2 border-dashed border-foreground" />
        </div>
        <p aria-hidden="true" className="mt-1 pl-[95%] -translate-x-3 font-mono text-xs">95%</p>

        <div className="relative mt-4 rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground">{copy.menuLabel}</p>
          <p data-menu aria-live="polite" className="mt-1 font-semibold">{done ? (result.approved ? copy.menuNew : copy.menuOld) : copy.tasting}</p>
          <p className="mt-1 text-xs text-muted-foreground">{copy.preferOf(c.served, n)}</p>
          {done && <span data-stamp className={`absolute right-3 top-3 -rotate-6 rounded border-2 px-2 py-0.5 text-xs font-bold uppercase ${result.approved ? "border-success text-success" : "border-danger text-danger"}`}>{result.approved ? copy.stampApproved : copy.stampNotYet}</span>}
        </div>
      </div>
    </div>
  </StoryStage>;
}
