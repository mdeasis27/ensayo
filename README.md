# Ensayo

**Prompt versioning + A/B testing** — prompts as versioned artifacts, a deterministic judge, and
a real statistical test (Welch's t-test) that gates the rollout.

> **Result:** the few-shot + chain-of-thought variant lifts quality **+15.0%** (0.727 → 0.836)
> with **p < 0.001** and a 95% CI of **[0.081, 0.137]** that never crosses zero — so it
> **advances**. A pure paraphrase of the system prompt shows **+1.9%** with **p = 0.293** and a
> CI of **[-0.013, 0.041]** — so it **holds**. Rollout only moves on evidence, not on vibes.

---

## Result

| Experiment | v1 mean | variant mean | Δ (lift) | p-value | 95% CI | Decision |
|---|---|---|---|---|---|---|
| Few-shot + chain-of-thought | 0.727 | 0.836 | +0.109 (+15.0%) | < 0.001 | [0.081, 0.137] | **advance** |
| System-prompt paraphrase | 0.727 | 0.741 | +0.014 (+1.9%) | 0.293 | [-0.013, 0.041] | **hold** |

Two experiments, same baseline, opposite outcomes — the whole point is that the test
discriminates signal from noise. A higher mean alone is not enough: the paraphrase looks
slightly better but its confidence interval includes zero, so the gate refuses to ship it.

---

## Architecture

```
lib/ensayo/                 # canonical core (TypeScript, tested)
  statistics.ts             #   mean · variance · lgamma · incomplete beta · t CDF/quantile
  analyze.ts                #   Welch t-test → significance + rollout decision
  benchmark.ts              #   runs all experiments through the gate
  demo.ts                   #   wires prompts + scores into every number
  data/                     #   prompts.json (versions + committed judge scores)
  fixtures/                 #   experiments.json (pinned t/p/CI + decision)
backend/                    # same math in Python + pytest (authoritative)
  src/ensayo/               #   statistics.py · benchmark.py
  tests/                    #   pinned to tests/fixtures/{prompts,experiments}.json
app/                        # Next.js landing + demo dashboard (Vercel, demo mode)
```

The statistical core is dependency-free and mirrored line-for-line: `lgamma` (Lanczos),
`betai` (regularized incomplete beta, Numerical Recipes), the Student t CDF and its inverse,
and Welch's t-test with Satterthwaite degrees of freedom. Both languages produce the same
numbers to ~1e-10, asserted against shared fixtures.

## Design decisions & tradeoffs

1. **Welch's t-test, not a pooled t-test.** Prompt score variances are rarely equal across
   versions; Welch doesn't assume them equal. The cost is slightly less power at equal
   variance, which the demo accepts for correctness.
2. **The judge is committed, deterministic score arrays.** A real LLM-as-judge is a non-
   deterministic network call; the demo pins the scores so the *statistics* are the star.
   Live mode swaps the judge behind the same `Experiment` shape.
3. **Two-sided test with an explicit "hold".** One-sided tests can mask a regression as a
   non-result. The gate has three outcomes — advance / rollback / hold — so a significantly
   *worse* variant is caught too.

## What did not work

- **Exact p-values need the full t distribution.** A normal approximation is easy but wrong in
  the small-sample tail. Implementing `betai` by hand is the price of a correct p-value without
  a dependency like SciPy, and it must be mirrored exactly in two languages.
- **The synthetic judge scores are homoscedastic-ish.** Real judge scores have heavier tails and
  occasional outliers; the demo's clean distributions isolate the *statistical* distinction
  rather than the noisy real-world one.

## Run it

```bash
# frontend demo + TS tests
pnpm install && pnpm dev      # http://localhost:3000
pnpm test                     # 12 vitest tests

# backend (authoritative math) — Python 3.12+
cd backend && uv sync --extra dev && uv run pytest   # 3 tests, pinned fixtures
```

## Stack

Next.js 16 · TypeScript · Vitest · Tailwind v4 · Python 3.13 · pytest
