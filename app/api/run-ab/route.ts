import { NextResponse } from "next/server";
import { getSql } from "@/lib/db/client";
import { welchTTest } from "@/lib/ensayo/statistics";
import { decide } from "@/lib/ensayo/analyze";

function parseScores(value: unknown): number[] | null {
  if (!Array.isArray(value)) return null;
  const nums = value.map(Number);
  if (nums.length < 2) return null;
  if (nums.some((n) => !Number.isFinite(n))) return null;
  return nums;
}

export async function POST(request: Request) {
  let baseline: number[] | null;
  let variant: number[] | null;
  let alpha: number;
  try {
    const body = await request.json();
    baseline = parseScores(body.baseline);
    variant = parseScores(body.variant);
    alpha = typeof body.alpha === "number" && Number.isFinite(body.alpha) ? body.alpha : NaN;
  } catch {
    return NextResponse.json({ error: "Cuerpo JSON inválido" }, { status: 400 });
  }

  if (!baseline) {
    return NextResponse.json(
      { error: "El baseline debe ser una lista de al menos 2 scores numéricos." },
      { status: 400 },
    );
  }
  if (!variant) {
    return NextResponse.json(
      { error: "La variante debe ser una lista de al menos 2 scores numéricos." },
      { status: 400 },
    );
  }
  if (Number.isNaN(alpha) || alpha <= 0 || alpha >= 1) {
    return NextResponse.json(
      { error: "Alpha debe ser un número entre 0 y 1 (p. ej. 0.05)." },
      { status: 400 },
    );
  }

  const test = welchTTest(baseline, variant, alpha);
  const decision = decide(test.delta, test.pValue, alpha);

  try {
    const db = getSql();
    await db`INSERT INTO ensayo.experiments (delta, p_value, ci_low, ci_high, decision) VALUES (${test.delta}, ${test.pValue}, ${test.ciLow}, ${test.ciHigh}, ${decision})`;
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error guardando el experimento" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    baselineMean: test.baselineMean,
    variantMean: test.variantMean,
    delta: test.delta,
    t: test.t,
    df: test.df,
    pValue: test.pValue,
    ciLow: test.ciLow,
    ciHigh: test.ciHigh,
    decision,
  });
}
