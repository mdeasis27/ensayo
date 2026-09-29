"use client";

import { useState } from "react";
import Link from "next/link";
import { Alert } from "@/design-system/components/alert";
import { Card } from "@/design-system/components/card";
import { MetricCard } from "@/design-system/components/metric-card";
import { StatusBadge } from "@/design-system/components/status-badge";
import { welchTTest } from "@/lib/ensayo/statistics";
import type { TTest } from "@/lib/ensayo/statistics";
import { decide } from "@/lib/ensayo/analyze";
import { getAlpha, getBenchmark } from "@/lib/ensayo/demo";
import type { Decision } from "@/lib/ensayo/types";

const BENCH = getBenchmark();
const ALPHA = getAlpha();

const DECISION_LABEL: Record<Decision, string> = {
  advance: "avanza",
  rollback: "revierte",
  hold: "mantiene",
};

const DECISION_TONE: Record<Decision, "success" | "danger" | "warning"> = {
  advance: "success",
  rollback: "danger",
  hold: "warning",
};

const INPUT_CLASS =
  "rounded-[var(--radius-md)] border border-[var(--border)] bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/60";

type Result =
  | { kind: "ok"; test: TTest; decision: Decision; alpha: number }
  | { kind: "error"; message: string };

function parseScores(s: string): number[] | null {
  const parts = s
    .split(",")
    .map((x) => x.trim())
    .filter((x) => x !== "");
  if (parts.length === 0) return null;
  const nums = parts.map(Number);
  if (nums.some((n) => Number.isNaN(n))) return null;
  return nums;
}

export default function AppPage() {
  const exp1 = BENCH.experiments.find((e) => e.id === "exp-1")!;
  const lift1 = (exp1.delta / exp1.baselineMean) * 100;

  const [baseline, setBaseline] = useState("0.66,0.71,0.69,0.78,0.73,0.82,0.64,0.75");
  const [variant, setVariant] = useState("0.78,0.85,0.81,0.88,0.80,0.90,0.76,0.84");
  const [alpha, setAlpha] = useState("0.05");
  const [result, setResult] = useState<Result | null>(null);

  function run() {
    const b = parseScores(baseline);
    const v = parseScores(variant);
    const a = Number(alpha);

    if (!b || b.length < 2) {
      setResult({ kind: "error", message: "Los scores del baseline deben ser al menos 2 números separados por comas." });
      return;
    }
    if (!v || v.length < 2) {
      setResult({ kind: "error", message: "Los scores de la variante deben ser al menos 2 números separados por comas." });
      return;
    }
    if (Number.isNaN(a) || a <= 0 || a >= 1) {
      setResult({ kind: "error", message: "Alpha debe ser un número entre 0 y 1 (p. ej. 0.05)." });
      return;
    }

    const test = welchTTest(b, v, a);
    const decision = decide(test.delta, test.pValue, a);
    setResult({ kind: "ok", test, decision, alpha: a });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
              Inicio
            </Link>
            <div className="h-4 w-px bg-[var(--border)]" aria-hidden="true" />
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                <svg className="h-4 w-4 text-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                </svg>
              </div>
              <div>
                <h1 className="text-sm font-semibold text-foreground leading-tight">Ensayo</h1>
                <p className="text-xs text-muted-foreground">Prompt A/B con test estadístico</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge tone="info" dot className="px-3 py-1">
              Demo mode
            </StatusBadge>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-10">
        {/* ── SUMMARY BAR ─────────────────────── */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MetricCard
            label="Lift de calidad"
            value={`+${lift1.toFixed(1)}%`}
            hint="exp-1: v2 vs v1"
            tone="success"
          />
          <MetricCard
            label="p-value (exp-1)"
            value={exp1.pValue < 0.001 ? "< 0.001" : exp1.pValue.toFixed(3)}
            hint="Welch two-sided"
            tone="success"
          />
          <MetricCard
            label="IC 95% del delta"
            value={`[${exp1.ciLow.toFixed(3)}, ${exp1.ciHigh.toFixed(3)}]`}
            hint="no cruza el 0"
            tone="info"
          />
          <MetricCard
            label="Decisión"
            value={DECISION_LABEL[exp1.decision]}
            hint={`α = ${ALPHA}`}
            tone="success"
          />
        </div>

        {/* ── T-TEST PLAYGROUND ───────────────── */}
        <section>
          <h2 className="text-lg font-semibold tracking-tight text-foreground mb-1">t-test en vivo</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Pega los scores de dos versiones del prompt (separados por comas) y ejecuta el
            Welch&apos;s t-test. El rollout solo avanza cuando la evidencia es significativa —
            una media más alta puede ser ruido de muestreo.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="p-4">
              <span className="mb-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Baseline (v1)
              </span>
              <textarea
                value={baseline}
                onChange={(e) => setBaseline(e.target.value)}
                rows={4}
                className={`${INPUT_CLASS} w-full font-mono`}
              />
            </Card>
            <Card className="p-4">
              <span className="mb-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Variante (v2)
              </span>
              <textarea
                value={variant}
                onChange={(e) => setVariant(e.target.value)}
                rows={4}
                className={`${INPUT_CLASS} w-full font-mono`}
              />
            </Card>
          </div>

          <Card className="mt-4 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-foreground">Alpha (nivel de significancia)</span>
              <input
                type="number"
                step={0.01}
                min={0}
                max={1}
                value={alpha}
                onChange={(e) => setAlpha(e.target.value)}
                className={`${INPUT_CLASS} w-24`}
              />
            </div>
            <button
              onClick={run}
              className="mt-2 w-full rounded-[var(--radius-md)] bg-accent px-4 py-2.5 text-sm font-medium text-[#ffffff] hover:bg-accent/90 transition-colors"
            >
              Ejecutar t-test
            </button>
          </Card>

          {result && (
            <Card className="mt-4 p-5">
              {result.kind === "ok" ? (
                <>
                  <div className="flex items-center gap-3">
                    <StatusBadge tone={DECISION_TONE[result.decision]} dot>
                      {DECISION_LABEL[result.decision]}
                    </StatusBadge>
                    <span className="text-sm text-muted-foreground">
                      α = {result.alpha}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Media v1</p>
                      <p className="font-semibold tabular-nums text-foreground">{result.test.baselineMean.toFixed(3)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Media v2</p>
                      <p className="font-semibold tabular-nums text-foreground">{result.test.variantMean.toFixed(3)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Δ (delta)</p>
                      <p className="font-semibold tabular-nums text-foreground">
                        {result.test.delta >= 0 ? "+" : ""}
                        {result.test.delta.toFixed(3)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">p-value</p>
                      <p className="font-semibold tabular-nums text-foreground">
                        {result.test.pValue < 0.001 ? "< 0.001" : result.test.pValue.toFixed(3)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    t = {result.test.t.toFixed(3)} · df = {result.test.df.toFixed(2)} · IC 95% = [
                    {result.test.ciLow.toFixed(3)}, {result.test.ciHigh.toFixed(3)}]
                  </p>
                </>
              ) : (
                <Alert tone="danger" title="No se pudo ejecutar el test">
                  {result.message}
                </Alert>
              )}
            </Card>
          )}
        </section>

        {/* ── METHOD NOTE ─────────────────────── */}
        <section>
          <Alert tone="info" title="¿Por qué no basta con comparar medias?">
            Una media más alta puede ser ruido de muestreo. Welch&apos;s t-test convierte el delta y
            su varianza en un p-value y un intervalo de confianza, y el rollout solo avanza cuando
            la evidencia es significativa. El juez es determinista (proxy documentado de un
            LLM-as-judge); la estadística es real y está pinada en fixtures compartidos.
          </Alert>
        </section>

        <footer className="pt-8 border-t border-[var(--border)] flex items-center justify-between text-xs text-muted-foreground">
          <span>Ensayo · Prompt versioning + A/B · Demo mode</span>
          <a href="https://github.com/mdeasis27/ensayo" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors font-mono">GitHub</a>
        </footer>
      </div>
    </div>
  );
}
