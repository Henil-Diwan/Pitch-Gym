import { parseStructuredOutput, getMetricCards } from "./pitchParser";

/* ------------------------------
Average Score Per Pitch
------------------------------ */

export function getPitchAverage(structured) {
  const metrics = getMetricCards(structured);

  const scores = metrics
    .map((m) => m.score)
    .filter((s) => typeof s === "number");

  if (!scores.length) return null;

  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

/* ------------------------------
Founder Readiness Score (0-100)
------------------------------ */

export function getFounderReadiness(pitches) {
  const scores = pitches
    .map((p) =>
      getPitchAverage(parseStructuredOutput(p.pitch_structured_output))
    )
    .filter(Boolean);

  if (!scores.length) return 0;

  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

  return Math.round((avg / 5) * 100);
}

/* ------------------------------
Improvement Over Time
------------------------------ */

export function buildImprovementData(pitches) {
  return pitches.map((p, i) => ({
    session: i + 1,
    score: getPitchAverage(parseStructuredOutput(p.pitch_structured_output)),
  }));
}

/* ------------------------------
Skill Radar Data
------------------------------ */

export function buildSkillRadar(pitches) {

  const skills = {};

  pitches.forEach((p) => {

    const structured = parseStructuredOutput(p.pitch_structured_output);
    const metrics = getMetricCards(structured);

    metrics.forEach((m) => {

      const shortLabel = m.label
        .replace("founder communication","communication")
        .replace("customer definition","customer")
        .replace("problem clarity","problem")
        .replace("problem evidence","evidence")
        .replace("solution differentiation","solution")
        .replace("market opportunity","market")
        .replace("business model","model")
        .replace("go to market","go-to-market");

      if (!skills[shortLabel]) skills[shortLabel] = [];

      skills[shortLabel].push(m.score);

    });

  });

  return Object.entries(skills)
    .slice(0,8) // limit radar
    .map(([skill,scores])=>({

      skill,

      score:
        scores.reduce((a,b)=>a+b,0) /
        scores.length

    }));

}
/* ------------------------------
Pitch Type Performance
------------------------------ */

export function buildPitchTypeStats(pitches) {
  const map = {};

  pitches.forEach((p) => {
    const avg = getPitchAverage(
      parseStructuredOutput(p.pitch_structured_output)
    );

    if (!map[p.pitch_type]) {
      map[p.pitch_type] = [];
    }

    map[p.pitch_type].push(avg);
  });

  return Object.entries(map).map(([type, scores]) => ({
    type,
    score:
      scores.reduce((a, b) => a + b, 0) / scores.length,
  }));
}