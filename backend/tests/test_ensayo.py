import json
from pathlib import Path

import pytest

from ensayo.benchmark import benchmark
from ensayo.statistics import mean, sample_variance, welch_ttest

FIXTURES = Path(__file__).parent / "fixtures"


def _load(name: str):
    return json.loads((FIXTURES / name).read_text(encoding="utf-8"))


def test_mean_and_variance():
    assert mean([1, 2, 3, 4]) == pytest.approx(2.5, abs=1e-12)
    assert sample_variance([1, 2, 3, 4]) == pytest.approx(5 / 3, abs=1e-12)


def test_welch_detects_a_clear_difference():
    a = [0.7 + (i % 5) * 0.02 for i in range(24)]
    b = [0.8 + (i % 5) * 0.02 for i in range(24)]
    r = welch_ttest(a, b, 0.05)
    assert r["delta"] > 0
    assert r["pValue"] < 0.05


def test_benchmark_matches_fixture():
    data = _load("prompts.json")
    fixture = _load("experiments.json")

    result = benchmark(data["experiments"], data["alpha"])
    assert result["alpha"] == fixture["alpha"]

    for expected in fixture["experiments"]:
        got = next(e for e in result["experiments"] if e["id"] == expected["id"])
        assert got["baselineMean"] == pytest.approx(expected["baselineMean"], abs=1e-10)
        assert got["variantMean"] == pytest.approx(expected["variantMean"], abs=1e-10)
        assert got["delta"] == pytest.approx(expected["delta"], abs=1e-10)
        assert got["t"] == pytest.approx(expected["t"], abs=1e-10)
        assert got["df"] == pytest.approx(expected["df"], abs=1e-10)
        assert got["pValue"] == pytest.approx(expected["pValue"], abs=1e-10)
        assert got["ciLow"] == pytest.approx(expected["ciLow"], abs=1e-10)
        assert got["ciHigh"] == pytest.approx(expected["ciHigh"], abs=1e-10)
        assert got["significant"] == expected["significant"]
        assert got["decision"] == expected["decision"]
