export function getAssessmentObject(structured) {
  if (!structured) return null;

  const keys = Object.keys(structured);

  const assessmentKey = keys.find(
    (k) =>
      k.endsWith("_assessment") ||
      k === "technical_assessment"
  );

  return structured[assessmentKey] || null;
}

export function getScores(structured) {
  const assessment = getAssessmentObject(structured);
  if (!assessment) return [];

  return Object.values(assessment)
    .map((v) => v?.score)
    .filter(Boolean);
}

export function getAverageScore(structured) {
  const scores = getScores(structured);
  if (!scores.length) return null;

  const avg =
    scores.reduce((a, b) => a + b, 0) / scores.length;

  return Number(avg.toFixed(1));
}

export function getRatingColor(rating) {
  switch (rating) {
    case "Excellent":
      return "text-green-400";
    case "Good":
      return "text-cyan-400";
    case "Fair":
      return "text-yellow-400";
    case "Poor":
      return "text-red-400";
    default:
      return "text-zinc-400";
  }
}