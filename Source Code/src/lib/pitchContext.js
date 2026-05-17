import supabase from "@/db/supabase";
import {
  parseStructuredOutput,
  getAverageScore,
  getOverallRating,
  getStrengths,
  getWeaknesses,
} from "./pitchParser";

const MAX_CHARS = 1500;

/**
 * Fetches previous pitches for an idea, returning a list suitable for a dropdown.
 * Each entry includes id, pitch_type, created_at, rating, and avgScore.
 */
export async function fetchPreviousPitches(userId, ideaId) {
  if (!userId || !ideaId) return [];

  const { data: pitches, error } = await supabase
    .from("user_pitches")
    .select("id, pitch_type, pitch_structured_output, created_at")
    .eq("user_id", userId)
    .eq("idea_id", ideaId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error || !pitches?.length) return [];

  return pitches
    .map((p) => {
      const rating = getOverallRating(p.pitch_structured_output);
      const avg = getAverageScore(p.pitch_structured_output);
      if (!parseStructuredOutput(p.pitch_structured_output)) return null;

      const dt = new Date(p.created_at);
      return {
        id: p.id,
        pitchType: p.pitch_type || "Unknown",
        date: dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        time: dt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        rating,
        avgScore: avg,
        _raw: p.pitch_structured_output,
      };
    })
    .filter(Boolean);
}

/**
 * Builds a condensed context string from a single pitch's structured output.
 */
export function buildSinglePitchContext(pitch) {
  if (!pitch?._raw) return null;

  const rating = getOverallRating(pitch._raw);
  const avg = getAverageScore(pitch._raw);
  const strengths = getStrengths(pitch._raw);
  const weaknesses = getWeaknesses(pitch._raw);

  const strengthList = strengths
    .slice(0, 3)
    .map((s) => s.point || s)
    .join("; ");
  const weaknessList = weaknesses
    .slice(0, 3)
    .map((w) => w.point || w)
    .join("; ");

  let summary = `Previous session (${pitch.pitchType}, ${pitch.date} ${pitch.time}`;
  if (avg) summary += `, avg ${avg}/5`;
  if (rating) summary += `, rated "${rating}"`;
  summary += "):";
  if (strengthList) summary += `\n- Strengths: ${strengthList}`;
  if (weaknessList) summary += `\n- Weaknesses: ${weaknessList}`;

  if (summary.length > MAX_CHARS) {
    summary = summary.slice(0, MAX_CHARS - 3) + "...";
  }

  return summary;
}
