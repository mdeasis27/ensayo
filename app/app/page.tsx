"use client";

import Link from "next/link";
import { Alert } from "@/design-system/components/alert";
import { Card } from "@/design-system/components/card";
import { MetricCard } from "@/design-system/components/metric-card";
import { StatusBadge } from "@/design-system/components/status-badge";
import { getAlpha, getBenchmark, getExperiments } from "@/lib/ensayo/demo";

const BENCH = getBenchmark();
const ALPHA = getAlpha();
const EXPERIMENTS = getExperiments();

const DECISION_LABEL: Record<string, string> = {
  advance: "avanza",
  rollback: "revierte",
  hold: "mantiene",
};

const DECISION_TONE: Record<string, "success" | "danger" | "warning"> = {
  advance: "success",
  rollback: "danger",
  hold: "warning",
};

export default function AppPage() {
  const exp1 = BENCH.experiments.find((e) => e.id === "exp-1")!;
  const lift1 = (exp1.delta / exp1.baselineMean) * 100;

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

        {/* ── EXPERIMENTS ─────────────────────── */}
        <section>
          <h2 className="text-lg font-semibold tracking-tight text-foreground mb-1">Rollout gate</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Dos experimentos con el mismo baseline. Uno avanza (la variante es significativamente
            mejor) y otro se mantiene (el IC cruza el 0: no hay evidencia). La misma matemática —
            Welch&apos;s t-test con p-value e IC exactos — corre en TS y Python, pinada por
            fixtures.
          </p>
          <div className="space-y-5">
            {BENCH.experiments.map((e) => {
              const exp = EXPERIMENTS.find((x) => x.id === e.id)!;
              const lift = (e.delta / e.baselineMean) * 100;
              return (
                <Card key={e.id} className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground">{e.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {exp.baseline.version} → {exp.variant.version}
                      </p>
                    </div>
                    <StatusBadge tone={DECISION_TONE[e.decision]} dot>
                      {DECISION_LABEL[e.decision]}
                    </StatusBadge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Media v1</p>
                      <p className="font-semibold tabular-nums text-foreground">{e.baselineMean.toFixed(3)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Media v2</p>
                      <p className="font-semibold tabular-nums text-foreground">{e.variantMean.toFixed(3)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Δ / lift</p>
                      <p className="font-semibold tabular-nums text-foreground">
                        {e.delta >= 0 ? "+" : ""}{e.delta.toFixed(3)} ({lift >= 0 ? "+" : ""}{lift.toFixed(1)}%)
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">p-value</p>
                      <p className="font-semibold tabular-nums text-foreground">
                        {e.pValue < 0.001 ? "< 0.001" : e.pValue.toFixed(3)}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>
                      t = {e.t.toFixed(3)} · df = {e.df.toFixed(2)} · IC 95% = [{e.ciLow.toFixed(3)}, {e.ciHigh.toFixed(3)}]
                    </p>
                    <p>
                      {e.significant
                        ? e.delta > 0
                          ? "Diferencia significativa: la variante es mejor."
                          : "Diferencia significativa: la variante es peor."
                        : "Sin evidencia suficiente: el IC incluye el 0."}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
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
