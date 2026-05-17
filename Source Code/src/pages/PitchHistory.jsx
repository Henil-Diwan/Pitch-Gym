import { useEffect, useState } from "react";
import Spinner from "@/components/ui/Spinner";
import { useNavigate } from "react-router-dom";
import supabase from "@/db/supabase";
import {
  getAverageScore,
  getOverallRating,
  getRatingStyle,
  parseStructuredOutput,
} from "@/lib/pitchParser";

export default function PitchHistory() {
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { loadPitches(); }, []);

  async function loadPitches() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("user_pitches")
        .select("*, ideas(name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setPitches(data || []);
    } catch (err) {
      console.error("Failed to load pitches:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto pt-32 px-6">
        <Spinner label="Loading history" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pt-32 px-6 pb-16 space-y-8">

      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-brand font-extrabold text-white tracking-tight">
          Pitch History
        </h1>
        <p className="text-slate-500">
          Review your previous simulations, scores, and feedback reports.
        </p>
      </div>

      {pitches.length === 0 ? (
        <div className="bg-[#07132b] border border-white/8 rounded-[2rem] p-10 text-slate-500">
          No pitch sessions found yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {pitches.map((pitch) => {
            const parsed = parseStructuredOutput(pitch.pitch_structured_output);
            const averageScore = getAverageScore(parsed);
            const overallRating = getOverallRating(parsed);
            const rs = getRatingStyle(overallRating);
            const date = new Date(pitch.created_at);
            const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            const duration = pitch.duration_seconds ? Math.round(Number(pitch.duration_seconds) / 60) : null;

            return (
              <button
                key={pitch.id}
                onClick={() => navigate(`/pitch-result/${pitch.id}`)}
                className="group text-left bg-[#07132b] border border-white/8 hover:border-white/15 hover:bg-[#0b1a3a] transition-all duration-200 rounded-[1.75rem] px-7 py-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">

                  {/* Left */}
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-white text-base sm:text-lg font-bold leading-snug truncate">
                        {pitch.pitch_type || "Pitch Session"}
                      </h2>
                      {pitch.ideas?.name ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
                          💡 {pitch.ideas.name}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-slate-600 text-xs font-bold">
                          Unassociated
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 text-xs sm:text-sm">
                      {dateStr}
                      <span className="mx-2 text-slate-700">·</span>
                      {timeStr}
                      {duration && <><span className="mx-2 text-slate-700">·</span>{duration} min</>}
                      {pitch.credits_used && <><span className="mx-2 text-slate-700">·</span>{pitch.credits_used} credit</>}
                    </p>
                  </div>

                  {/* Right */}
                  <div className="flex items-center gap-4 shrink-0">

                    <div className="text-right">
                      <p className="text-xs uppercase tracking-widest text-slate-600 mb-0.5">Score</p>
                      <p className="text-3xl font-brand font-black text-pitch-cyan leading-none">
                        {averageScore ?? "—"}
                        <span className="text-sm font-normal text-slate-600 ml-0.5">/5</span>
                      </p>
                    </div>

                    {overallRating && (
                      <div style={{
                        background: rs.bg,
                        border: `1px solid ${rs.border}`,
                        borderRadius: 99,
                        padding: "5px 14px",
                      }}>
                        <span style={{ color: rs.color, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                          {overallRating}
                        </span>
                      </div>
                    )}

                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      className="text-slate-600 group-hover:text-slate-400 transition-colors">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>

                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}