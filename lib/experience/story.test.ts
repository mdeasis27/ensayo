import { describe, expect, it } from "vitest";
import { STORY } from "./story";
import { lintStory, storyStrings as strings } from "@/design-system/demo/copy-lint";

describe("Ensayo story copy", () => {
  it("has the same shape in English and Spanish", () => {
    const keys = (o: unknown): string[] => o && typeof o === "object" && !Array.isArray(o) ? Object.entries(o).filter(([k]) => k !== "before" && k !== "after").flatMap(([k, v]) => [k, ...keys(v).map(x => `${k}.${x}`)]) : [];
    expect(keys(STORY.es)).toEqual(keys(STORY.en));
    expect(STORY.es.analogy.dictionary).toHaveLength(STORY.en.analogy.dictionary.length);
  });

  it("has no empty strings except the owner-supplied why note", () => {
    for (const locale of ["en", "es"] as const) {
      const { why, ...rest } = STORY[locale];
      expect(why.title.trim()).not.toBe("");
      for (const s of strings(rest)) expect(s.trim(), `${locale}: empty string`).not.toBe("");
    }
  });

  it("avoids AI-sounding patterns and brand names", () => {
    for (const locale of ["en", "es"] as const) expect(lintStory(STORY[locale]), locale).toEqual([]);
  });

  it("states the counts and the verdict truthfully", () => {
    expect(STORY.es.compare.sentence(6, 10)).toBe("6 de 10 catadores prefirieron la receta nueva.");
    expect(STORY.en.compare.sentence(1, 5)).toBe("1 of 5 tasters preferred the new recipe.");
    expect([STORY.es.compare.verdict(0), STORY.es.compare.verdict(1)]).toEqual(["La receta nueva todavía no se aprueba", "La receta nueva se aprobó"]);
  });

  it("asks the bet about the number of tasters the visitor chose", () => {
    expect(STORY.en.tryIt.question(10)).toContain("with 10 tasters");
    expect(STORY.es.tryIt.question(25)).toContain("con 25 catadores");
  });
});
