"""Analysis + rollout decision — mirrors lib/ensayo/analyze.ts."""

from __future__ import annotations

from .statistics import welch_ttest


def decide(delta: float, p_value: float, alpha: float) -> str:
    if p_value < alpha and delta > 0:
        return "advance"
    if p_value < alpha and delta < 0:
        return "rollback"
    return "hold"


def analyze(experiment: dict, alpha: float) -> dict:
    test = welch_ttest(experiment["baseline"]["scores"], experiment["variant"]["scores"], alpha)
    significant = test["pValue"] < alpha
    return {
        "id": experiment["id"],
        "name": experiment["name"],
        "baselineMean": test["baselineMean"],
        "variantMean": test["variantMean"],
        "delta": test["delta"],
        "t": test["t"],
        "df": test["df"],
        "pValue": test["pValue"],
        "ciLow": test["ciLow"],
        "ciHigh": test["ciHigh"],
        "significant": significant,
        "decision": decide(test["delta"], test["pValue"], alpha),
    }


def benchmark(experiments: list[dict], alpha: float) -> dict:
    return {"alpha": alpha, "experiments": [analyze(e, alpha) for e in experiments]}
