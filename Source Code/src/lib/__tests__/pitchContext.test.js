import { describe, it, expect } from "vitest";
import { buildSinglePitchContext } from "../pitchContext.js";

const sampleRaw = {
  idea_validation_assessment: {
    problem_clarity: { score: 4, analysis: "Clear" },
    solution_fit: { score: 3, analysis: "OK" },
  },
  overall_rating: "Fair",
  strengths: [{ point: "Clear vision" }, { point: "Good energy" }],
  weaknesses: [{ point: "Vague market sizing" }, { point: "No financials" }],
};

// ──────────────────────────────────────────────────────────────────
// buildSinglePitchContext
// ──────────────────────────────────────────────────────────────────
describe("buildSinglePitchContext", () => {
  it("TC-C01: builds context string with rating, strengths, weaknesses", () => {
    const pitch = {
      pitchType: "Idea Validation",
      date: "Mar 11",
      time: "4:36 PM",
      _raw: sampleRaw,
    };
    const ctx = buildSinglePitchContext(pitch);
    expect(ctx).toContain("Previous session");
    expect(ctx).toContain("Idea Validation");
    expect(ctx).toContain("Mar 11");
    expect(ctx).toContain('rated "Fair"');
    expect(ctx).toContain("avg 3.5/5");
    expect(ctx).toContain("Strengths: Clear vision; Good energy");
    expect(ctx).toContain("Weaknesses: Vague market sizing; No financials");
  });

  it("TC-C02: returns null when pitch has no _raw", () => {
    expect(buildSinglePitchContext({ pitchType: "Test" })).toBeNull();
    expect(buildSinglePitchContext(null)).toBeNull();
    expect(buildSinglePitchContext(undefined)).toBeNull();
  });

  it("TC-C03: output never exceeds MAX_CHARS (1500)", () => {
    // Even with very long strength/weakness text, output is capped
    const longPoint = "A".repeat(600);
    const raw = {
      test_assessment: { m1: { score: 3, analysis: "ok" } },
      overall_rating: "Good",
      strengths: [{ point: longPoint }, { point: longPoint }, { point: longPoint }],
      weaknesses: [{ point: longPoint }, { point: longPoint }, { point: longPoint }],
    };
    const pitch = { pitchType: "Test", date: "Jan 1", time: "12:00 PM", _raw: raw };
    const ctx = buildSinglePitchContext(pitch);
    expect(ctx.length).toBeLessThanOrEqual(1500);
  });

  it("TC-C04: limits strengths and weaknesses to 3 each", () => {
    const raw = {
      test_assessment: { m1: { score: 3, analysis: "ok" } },
      overall_rating: "Good",
      strengths: [
        { point: "S1" }, { point: "S2" }, { point: "S3" },
        { point: "S4" }, { point: "S5" },
      ],
      weaknesses: [
        { point: "W1" }, { point: "W2" }, { point: "W3" },
        { point: "W4" }, { point: "W5" },
      ],
    };
    const pitch = { pitchType: "Test", date: "Jan 1", time: "12:00 PM", _raw: raw };
    const ctx = buildSinglePitchContext(pitch);
    expect(ctx).toContain("S1; S2; S3");
    expect(ctx).not.toContain("S4");
    expect(ctx).toContain("W1; W2; W3");
    expect(ctx).not.toContain("W4");
  });

  it("TC-C05: handles raw data with no strengths or weaknesses gracefully", () => {
    const raw = {
      test_assessment: { m1: { score: 4, analysis: "ok" } },
      overall_rating: "Good",
    };
    const pitch = { pitchType: "Test", date: "Jan 1", time: "12:00 PM", _raw: raw };
    const ctx = buildSinglePitchContext(pitch);
    expect(ctx).toContain("Previous session");
    expect(ctx).not.toContain("Strengths");
    expect(ctx).not.toContain("Weaknesses");
  });
});
