export function parseStructuredOutput(value) {
  if (!value) return null;

  // already parsed
  if (typeof value === "object") return value;

  if (typeof value !== "string") return null;

  try {
    return JSON.parse(value);
  } catch (err) {
    console.warn("Invalid JSON detected. Attempting repair...");

    try {
      // Fix common LLM issues
      let repaired = value;

      // remove smart quotes
      repaired = repaired.replace(/[“”]/g, '"');

      // escape stray quotes inside strings
      repaired = repaired.replace(/:\s*"([^"]*?)"([^,}\n])/g, (match) => {
        return match.replace(/"/g, '\\"').replace('\\"', '"');
      });

      // remove trailing commas
      repaired = repaired.replace(/,\s*}/g, "}");
      repaired = repaired.replace(/,\s*]/g, "]");

      return JSON.parse(repaired);
    } catch (repairErr) {
      console.error("JSON repair failed:", repairErr);
      return null;
    }
  }
}

export function getAssessmentKey(data) {
  if (!data || typeof data !== "object") return null;

  const preferredKeys = [
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

  for (const key of preferredKeys) {
    if (data[key]) return key;
  }

  const dynamicKey = Object.keys(data).find((k) => k.endsWith("_assessment"));
  return dynamicKey || null;
}

export function getAssessmentObject(data) {
  const parsed = parseStructuredOutput(data);
  if (!parsed) return null;

  const key = getAssessmentKey(parsed);
  return key ? parsed[key] : null;
}

export function getMetricCards(data) {
  const assessment = getAssessmentObject(data);
  if (!assessment) return [];

  return Object.entries(assessment).map(([key, value]) => ({
    key,
    label: key.replaceAll("_", " "),
    score: value?.score ?? null,
    analysis: value?.analysis ?? "",
  }));
}

export function getAverageScore(data) {
  const metrics = getMetricCards(data);
  const scores = metrics.map((m) => m.score).filter((s) => typeof s === "number");

  if (!scores.length) return null;

  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return Number(avg.toFixed(1));
}

export function getOverallRating(data) {
  const parsed = parseStructuredOutput(data);
  return parsed?.overall_rating || null;
}

export function getStrengths(data) {
  const parsed = parseStructuredOutput(data);
  return parsed?.strengths || [];
}

export function getWeaknesses(data) {
  const parsed = parseStructuredOutput(data);
  if (!parsed) return [];

  return (
    parsed?.weaknesses ||
    parsed?.critical_weaknesses ||
    parsed?.product_weaknesses ||
    parsed?.technical_risks ||
    parsed?.customer_concerns ||
    parsed?.concerns ||
    parsed?.knowledge_gaps ||
    []
  );
}

export function getConcernBlock(data) {
  const parsed = parseStructuredOutput(data);
  if (!parsed) return null;

  return (
    parsed?.biggest_assumption ||
    parsed?.most_confusing_part ||
    parsed?.key_deal_breaker ||
    parsed?.biggest_product_risk ||
    parsed?.biggest_customer_assumption ||
    parsed?.biggest_technical_concern ||
    parsed?.biggest_concern ||
    parsed?.biggest_adoption_barrier ||
    parsed?.biggest_joining_risk ||
    parsed?.biggest_risk_exposed ||
    null
  );
}

export function getImprovementList(data) {
  const parsed = parseStructuredOutput(data);
  if (!parsed) return [];

  return (
    parsed?.what_would_improve_validation ||
    parsed?.how_to_improve_pitch ||
    parsed?.what_would_improve_this_pitch ||
    parsed?.product_improvement_suggestions ||
    parsed?.next_validation_steps ||
    parsed?.improvement_suggestions ||
    parsed?.improvements ||
    parsed?.how_the_founder_could_improve_defense ||
    []
  );
}

export function getRatingStyle(rating) {
  if (!rating) return { color: "#64748b", bg: "rgba(100,116,139,0.1)", border: "rgba(100,116,139,0.2)" };
  const r = rating.toLowerCase();
  if (r.includes("excellent") || r.includes("outstanding"))
    return { color: "#22d3ee", bg: "rgba(34,211,238,0.08)", border: "rgba(34,211,238,0.2)" };
  if (r.includes("good") || r.includes("strong"))
    return { color: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.2)" };
  if (r.includes("average") || r.includes("moderate") || r.includes("fair"))
    return { color: "#fbbf24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.2)" };
  return { color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)" };
}