import { describe, it, expect } from "vitest";
import {
  parseStructuredOutput,
  getAssessmentKey,
  getAssessmentObject,
  getMetricCards,
  getAverageScore,
  getOverallRating,
  getStrengths,
  getWeaknesses,
  getConcernBlock,
  getImprovementList,
  getRatingStyle,
} from "../pitchParser.js";

// ── Sample structured output matching real Vapi assistant schema ──
const sampleOutput = {
  idea_validation_assessment: {
    problem_clarity: { score: 4, analysis: "Clear problem statement" },
    solution_fit: { score: 3, analysis: "Decent solution" },
    market_understanding: { score: 2, analysis: "Needs more research" },
  },
  overall_rating: "Fair",
  strengths: [{ point: "Clear vision" }, { point: "Good energy" }],
  weaknesses: [{ point: "Vague market sizing" }],
  biggest_concern: "No revenue model discussed",
  improvement_suggestions: ["Add TAM analysis", "Prepare competitive landscape"],
};

const sampleJson = JSON.stringify(sampleOutput);

// ──────────────────────────────────────────────────────────────────
// 1. parseStructuredOutput
// ──────────────────────────────────────────────────────────────────
describe("parseStructuredOutput", () => {
  it("TC-U01: returns null for null/undefined input", () => {
    expect(parseStructuredOutput(null)).toBeNull();
    expect(parseStructuredOutput(undefined)).toBeNull();
  });

  it("TC-U02: returns the object as-is if already parsed", () => {
    const obj = { foo: 1 };
    expect(parseStructuredOutput(obj)).toBe(obj);
  });

  it("TC-U03: parses valid JSON string", () => {
    const result = parseStructuredOutput(sampleJson);
    expect(result).toEqual(sampleOutput);
  });

  it("TC-U04: repairs smart quotes and trailing commas", () => {
    const malformed = '{\u201Cname\u201D: \u201Ctest\u201D, "value": 1,}';
    const result = parseStructuredOutput(malformed);
    expect(result).not.toBeNull();
    expect(result.value).toBe(1);
  });

  it("TC-U05: returns null for completely unrepairable input", () => {
    const garbage = "This is not JSON at all, just plain text from the LLM.";
    expect(parseStructuredOutput(garbage)).toBeNull();
  });

  it("TC-U06: returns null for non-string, non-object input", () => {
    expect(parseStructuredOutput(42)).toBeNull();
    expect(parseStructuredOutput(true)).toBeNull();
  });
});

// ──────────────────────────────────────────────────────────────────
// 2. getAssessmentKey
// ──────────────────────────────────────────────────────────────────
describe("getAssessmentKey", () => {
  it("TC-U07: finds preferred key (idea_validation_assessment)", () => {
    expect(getAssessmentKey(sampleOutput)).toBe("idea_validation_assessment");
  });

  it("TC-U08: finds dynamic _assessment key", () => {
    const custom = { custom_assessment: { m1: { score: 3 } }, overall_rating: "Good" };
    expect(getAssessmentKey(custom)).toBe("custom_assessment");
  });

  it("TC-U09: returns null when no assessment key exists", () => {
    expect(getAssessmentKey({ overall_rating: "Good" })).toBeNull();
  });

  it("TC-U10: returns null for null/undefined", () => {
    expect(getAssessmentKey(null)).toBeNull();
    expect(getAssessmentKey(undefined)).toBeNull();
  });
});

// ──────────────────────────────────────────────────────────────────
// 3. getMetricCards
// ──────────────────────────────────────────────────────────────────
describe("getMetricCards", () => {
  it("TC-U11: extracts metric cards with labels from assessment", () => {
    const cards = getMetricCards(sampleOutput);
    expect(cards).toHaveLength(3);
    expect(cards[0]).toMatchObject({
      key: "problem_clarity",
      label: "problem clarity",
      score: 4,
    });
  });

  it("TC-U12: returns empty array when no assessment exists", () => {
    expect(getMetricCards(null)).toEqual([]);
    expect(getMetricCards({ overall_rating: "Good" })).toEqual([]);
  });
});

// ──────────────────────────────────────────────────────────────────
// 4. getAverageScore
// ──────────────────────────────────────────────────────────────────
describe("getAverageScore", () => {
  it("TC-U13: computes correct average score", () => {
    // (4 + 3 + 2) / 3 = 3.0
    expect(getAverageScore(sampleOutput)).toBe(3.0);
  });

  it("TC-U14: returns null when no scores are available", () => {
    expect(getAverageScore(null)).toBeNull();
  });

  it("TC-U15: handles single-metric assessment", () => {
    const single = { test_assessment: { only: { score: 5, analysis: "Perfect" } } };
    expect(getAverageScore(single)).toBe(5.0);
  });
});

// ──────────────────────────────────────────────────────────────────
// 5. getOverallRating, getStrengths, getWeaknesses
// ──────────────────────────────────────────────────────────────────
describe("getOverallRating", () => {
  it("TC-U16: extracts overall rating", () => {
    expect(getOverallRating(sampleOutput)).toBe("Fair");
  });

  it("TC-U17: returns null when missing", () => {
    expect(getOverallRating(null)).toBeNull();
    expect(getOverallRating({ foo: 1 })).toBeNull();
  });
});

describe("getStrengths", () => {
  it("TC-U18: extracts strengths array", () => {
    const strengths = getStrengths(sampleOutput);
    expect(strengths).toHaveLength(2);
    expect(strengths[0].point).toBe("Clear vision");
  });

  it("TC-U19: returns empty array when missing", () => {
    expect(getStrengths(null)).toEqual([]);
  });
});

describe("getWeaknesses", () => {
  it("TC-U20: extracts weaknesses array", () => {
    const w = getWeaknesses(sampleOutput);
    expect(w).toHaveLength(1);
    expect(w[0].point).toBe("Vague market sizing");
  });

  it("TC-U21: falls back to alternative weakness keys", () => {
    const alt = { critical_weaknesses: [{ point: "Bad" }] };
    expect(getWeaknesses(alt)).toHaveLength(1);
  });
});

// ──────────────────────────────────────────────────────────────────
// 6. getConcernBlock & getImprovementList
// ──────────────────────────────────────────────────────────────────
describe("getConcernBlock", () => {
  it("TC-U22: extracts biggest concern", () => {
    expect(getConcernBlock(sampleOutput)).toBe("No revenue model discussed");
  });

  it("TC-U23: returns null when no concern keys exist", () => {
    expect(getConcernBlock({ overall_rating: "Good" })).toBeNull();
  });
});

describe("getImprovementList", () => {
  it("TC-U24: extracts improvement suggestions", () => {
    const list = getImprovementList(sampleOutput);
    expect(list).toHaveLength(2);
    expect(list).toContain("Add TAM analysis");
  });

  it("TC-U25: returns empty array when no improvement keys exist", () => {
    expect(getImprovementList({ overall_rating: "Good" })).toEqual([]);
  });
});

// ──────────────────────────────────────────────────────────────────
// 7. getRatingStyle
// ──────────────────────────────────────────────────────────────────
describe("getRatingStyle", () => {
  it("TC-U26: returns cyan for Excellent", () => {
    expect(getRatingStyle("Excellent").color).toBe("#22d3ee");
  });

  it("TC-U27: returns green for Good", () => {
    expect(getRatingStyle("Good").color).toBe("#34d399");
  });

  it("TC-U28: returns yellow for Fair", () => {
    expect(getRatingStyle("Fair").color).toBe("#fbbf24");
  });

  it("TC-U29: returns red for Poor", () => {
    expect(getRatingStyle("Poor").color).toBe("#f87171");
  });

  it("TC-U30: returns grey for null/unknown", () => {
    expect(getRatingStyle(null).color).toBe("#64748b");
    expect(getRatingStyle("???").color).toBe("#f87171");
  });
});

// ──────────────────────────────────────────────────────────────────
// 8. End-to-end: JSON string → average score
// ──────────────────────────────────────────────────────────────────
describe("End-to-end parsing", () => {
  it("TC-U31: full pipeline from JSON string to average score", () => {
    const avg = getAverageScore(sampleJson);
    expect(avg).toBe(3.0);
  });

  it("TC-U32: full pipeline with all 10 pitch type keys", () => {
    const pitchTypes = [
      "idea_validation_assessment",
      "elevator_pitch_assessment",
      "vc_pitch_assessment",
      "product_feedback_assessment",
      "customer_discovery_assessment",
      "technical_assessment",
      "demo_day_assessment",
      "customer_pitch_assessment",
      "cofounder_pitch_assessment",
      "skeptic_pitch_assessment",
    ];

    for (const key of pitchTypes) {
      const data = { [key]: { m1: { score: 4, analysis: "ok" } }, overall_rating: "Good" };
      expect(getAssessmentKey(data)).toBe(key);
      expect(getAverageScore(data)).toBe(4.0);
    }
  });
});
