"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Alert } from "@/design-system/components/alert";
import { Card } from "@/design-system/components/card";
import { StatusBadge } from "@/design-system/components/status-badge";

type Decision = "advance" | "rollback" | "hold";

interface TestResult {
  baselineMean: number;
  variantMean: number;
  delta: number;
  t: number;
  df: number;
  pValue: number;
  ciLow: number;
  ciHigh: number;
  decision: Decision;
  error?: string;
}

interface HistoryItem {
  id: number;
  delta: string;
  p_value: string;
  ci_low: string;
  ci_high: string;
  decision: string;
  created_at: string;
}

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

function parseScores(s: string): number[] | null {
  const parts = s
    .split(",")
    .map((x) => x.trim())
    .filter((x) => x !== "");
  if (parts.length < 2) return null;
  const nums = parts.map(Number);
  if (nums.some((n) => Number.isNaN(n))) return null;
  return nums;
}

export default function AppPage() {
  const [baseline, setBaseline] = useState("0.66,0.71,0.69,0.78,0.73,0.82,0.64,0.75");
  const [variant, setVariant] = useState("0.78,0.85,0.81,0.88,0.80,0.90,0.76,0.84");
  const [alpha, setAlpha] = useState("0.05");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  async function loadHistory() {
    try {
      const res = await fetch("/api/history");
      if (res.ok) {
        const data = await res.json();
        setHistory(data.experiments ?? []);
      }
    } catch {
      /* history is best-effort */
    }
  }

  async function run() {
    const b = parseScores(baseline);
    const v = parseScores(variant);

    if (!b) {
      setResult({ decision: "hold", baselineMean: 0, variantMean: 0, delta: 0, t: 0, df: 0, pValue: 1, ciLow: 0, ciHigh: 0, error: "Los scores del baseline deben ser al menos 2 números separados por comas." });
      return;
    }
    if (!v) {
      setResult({ decision: "hold", baselineMean: 0, variantMean: 0, delta: 0, t: 0, df: 0, pValue: 1, ciLow: 0, ciHigh: 0, error: "Los scores de la variante deben ser al menos 2 números separados por comas." });
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/run-ab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseline: b, variant: v, alpha: Number(alpha) }),
      });
      const data = await res.json();
      setResult(data);
      if (res.ok) loadHistory();
    } catch (err) {
      setResult({ decision: "hold", baselineMean: 0, variantMean: 0, delta: 0, t: 0, df: 0, pValue: 1, ciLow: 0, ciHigh: 0, error: err instanceof Error ? err.message : "Error de red" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    fetch("/api/history")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data) setHistory(data.experiments ?? []);
      })
      .catch(() => {
        /* history is best-effort */
      });
    return () => {
      active = false;
    };
  }, []);

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
            <StatusBadge tone="success" dot className="px-3 py-1">
              Postgres en vivo
            </StatusBadge>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <div className="max-w-3xl">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Ejecuta un t-test entre dos prompts</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Pega los scores de dos versiones del prompt (separados por comas) y ejecuta el
            Welch&apos;s t-test. La decisión de rollout queda <strong>persistida en Postgres</strong> y
            aparece en el historial.
          </p>
        </div>

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

        <Card className="p-4">
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
            disabled={loading}
            className="mt-2 w-full rounded-[var(--radius-md)] bg-accent px-4 py-2.5 text-sm font-medium text-[#ffffff] hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Ejecutando…" : "Ejecutar t-test"}
          </button>
        </Card>

        {result && (
          <div className="space-y-4">
            {result.error ? (
              <Alert tone="danger" title="No se pudo ejecutar el test">{result.error}</Alert>
            ) : (
              <Card className="p-5">
                <div className="flex items-center gap-3">
                  <StatusBadge tone={DECISION_TONE[result.decision]} dot>
                    {DECISION_LABEL[result.decision]}
                  </StatusBadge>
                  <span className="text-sm text-muted-foreground">α = {alpha}</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Media v1</p>
                    <p className="font-semibold tabular-nums text-foreground">{result.baselineMean.toFixed(3)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Media v2</p>
                    <p className="font-semibold tabular-nums text-foreground">{result.variantMean.toFixed(3)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Δ (delta)</p>
                    <p className="font-semibold tabular-nums text-foreground">
                      {result.delta >= 0 ? "+" : ""}
                      {result.delta.toFixed(3)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">p-value</p>
                    <p className="font-semibold tabular-nums text-foreground">
                      {result.pValue < 0.001 ? "< 0.001" : result.pValue.toFixed(3)}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  t = {result.t.toFixed(3)} · df = {result.df.toFixed(2)} · IC 95% = [
                  {result.ciLow.toFixed(3)}, {result.ciHigh.toFixed(3)}]
                </p>
              </Card>
            )}
          </div>
        )}

        {history.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">Historial de experimentos (persistido en Postgres)</h3>
            <div className="overflow-x-auto rounded-[var(--radius-md)] shadow-[var(--shadow-card)] bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--gray-50)]">
                    <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Δ</th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">p-value</th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">IC 95%</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Decisión</th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {history.map((h) => {
                    const decision = h.decision as Decision;
                    return (
                      <tr key={h.id}>
                        <td className="px-4 py-2.5 text-right tabular-nums text-foreground">
                          {Number(h.delta) >= 0 ? "+" : ""}{Number(h.delta).toFixed(3)}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                          {Number(h.p_value) < 0.001 ? "< 0.001" : Number(h.p_value).toFixed(3)}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                          [{Number(h.ci_low).toFixed(3)}, {Number(h.ci_high).toFixed(3)}]
                        </td>
                        <td className="px-4 py-2.5">
                          <StatusBadge tone={DECISION_TONE[decision] ?? "warning"}>
                            {DECISION_LABEL[decision] ?? h.decision}
                          </StatusBadge>
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                          {new Date(h.created_at).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
