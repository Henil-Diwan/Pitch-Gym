import { describe, it, expect } from "vitest";
import {
  getAssessmentObject,
  getScores,
  getAverageScore,
  getRatingColor,
} from "../pitchAnalytics.js";

const sampleStructured = {
  idea_validation_assessment: {
    problem_clarity: { score: 4, analysis: "Clear" },
    solution_fit: { score: 3, analysis: "OK" },
    market_understanding: { score: 2, analysis: "Weak" },
  },
  overall_rating: "Fair",
};

// ──────────────────────────────────────────────────────────────────
// 1. getAssessmentObject
// ──────────────────────────────────────────────────────────────────
describe("getAssessmentObject (pitchAnalytics)", () => {
  it("TC-A01: extracts assessment by _assessment suffix", () => {
    const result = getAssessmentObject(sampleStructured);
    expect(result).toHaveProperty("problem_clarity");
    expect(result.problem_clarity.score).toBe(4);
  });

  it("TC-A02: returns null for null input", () => {
    expect(getAssessmentObject(null)).toBeNull();
  });

  it("TC-A03: returns null when no _assessment key exists", () => {
    expect(getAssessmentObject({ overall_rating: "Good" })).toBeNull();
  });

  it("TC-A04: finds technical_assessment key specifically", () => {
    const tech = { technical_assessment: { depth: { score: 5 } } };
    expect(getAssessmentObject(tech)).toHaveProperty("depth");
  });
});

// ──────────────────────────────────────────────────────────────────
// 2. getScores
// ──────────────────────────────────────────────────────────────────
describe("getScores", () => {
  it("TC-A05: extracts all numeric scores", () => {
    const scores = getScores(sampleStructured);
    expect(scores).toEqual([4, 3, 2]);
  });

  it("TC-A06: returns empty array for null input", () => {
    expect(getScores(null)).toEqual([]);
  });

  it("TC-A07: filters out metrics without score field", () => {
    const partial = {
      test_assessment: {
        m1: { score: 3, analysis: "ok" },
        m2: { analysis: "no score here" },
        m3: { score: 5, analysis: "great" },
      },
    };
    expect(getScores(partial)).toEqual([3, 5]);
  });
});

// ──────────────────────────────────────────────────────────────────
// 3. getAverageScore
// ──────────────────────────────────────────────────────────────────
describe("getAverageScore (pitchAnalytics)", () => {
  it("TC-A08: computes correct average", () => {
    expect(getAverageScore(sampleStructured)).toBe(3.0);
  });

  it("TC-A09: returns null for null input", () => {
    expect(getAverageScore(null)).toBeNull();
  });

  it("TC-A10: rounds to one decimal place", () => {
    const data = {
      test_assessment: {
        m1: { score: 3 },
        m2: { score: 4 },
        m3: { score: 4 },
      },
    };
    // (3 + 4 + 4) / 3 = 3.666... → 3.7
    expect(getAverageScore(data)).toBe(3.7);
  });
});

// ──────────────────────────────────────────────────────────────────
// 4. getRatingColor
// ──────────────────────────────────────────────────────────────────
describe("getRatingColor", () => {
  it("TC-A11: returns correct Tailwind class for Excellent", () => {
    expect(getRatingColor("Excellent")).toBe("text-green-400");
  });

  it("TC-A12: returns correct Tailwind class for Good", () => {
    expect(getRatingColor("Good")).toBe("text-cyan-400");
  });

  it("TC-A13: returns correct Tailwind class for Fair", () => {
    expect(getRatingColor("Fair")).toBe("text-yellow-400");
  });

  it("TC-A14: returns correct Tailwind class for Poor", () => {
    expect(getRatingColor("Poor")).toBe("text-red-400");
  });

  it("TC-A15: returns zinc for unknown rating", () => {
    expect(getRatingColor("Unknown")).toBe("text-zinc-400");
    expect(getRatingColor(undefined)).toBe("text-zinc-400");
  });
});
