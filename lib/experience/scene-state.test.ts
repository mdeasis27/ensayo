import { expect, it } from "vitest";
import { tapeCounts } from "@/design-system/demo/outcome-tape";
import { tasterCells, revealedTasters } from "./scene-state";
import { runMission } from "./mission";

it("hides the tasters not revealed yet", () => {
  expect(tasterCells([{ id: "a", status: "served" }, { id: "b", status: "lost" }], 1)).toEqual(["served", "pending"]);
});

it("final tape counts equal the mission totals", async () => {
  const { result } = await runMission({ tasters: 10 }, new AbortController().signal, () => {});
  expect(tapeCounts(tasterCells(result.items, result.items.length))).toEqual({ served: result.newer, rerouted: 10 - result.newer - result.older, lost: result.older, pending: 0 });
});

it("reveals in proportion to playback, all of it when complete or under reduced motion", () => {
  expect(revealedTasters({ visible: 1, total: 3, complete: false }, 12, false)).toBe(4);
  expect(revealedTasters({ visible: 4, total: 4, complete: true }, 12, false)).toBe(12);
  expect(revealedTasters({ visible: 1, total: 4, complete: false }, 12, true)).toBe(12);
  expect(revealedTasters({ visible: 0, total: 0, complete: false }, 12, false)).toBe(12);
});
