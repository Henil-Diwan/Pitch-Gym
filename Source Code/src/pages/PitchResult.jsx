import { useEffect, useMemo, useState } from "react";
import Spinner from "@/components/ui/Spinner";
import { useNavigate, useParams } from "react-router-dom";
import supabase from "@/db/supabase";
import {
  parseStructuredOutput,
  getMetricCards,
  getAverageScore,
  getOverallRating,
  getStrengths,
  getWeaknesses,
  getConcernBlock,
  getImprovementList,
  getRatingStyle,
} from "@/lib/pitchParser";

import { SectionCard } from "../components/ui/SectionCard";



export default function PitchResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pitch, setPitch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadPitch(); }, [id]);

  async function loadPitch() {
    try {
      const { data, error } = await supabase
        .from("user_pitches")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      setPitch(data);
    } catch (err) {
      console.error("Failed to load pitch:", err);
    } finally {
      setLoading(false);
    }
  }

  const structured  = useMemo(() => parseStructuredOutput(pitch?.pitch_structured_output), [pitch]);
  const metrics     = useMemo(() => getMetricCards(structured), [structured]);
  const avgScore    = useMemo(() => getAverageScore(structured), [structured]);
  const overallRating = useMemo(() => getOverallRating(structured), [structured]);
  const strengths   = useMemo(() => getStrengths(structured), [structured]);
  const weaknesses  = useMemo(() => getWeaknesses(structured), [structured]);
  const concern     = useMemo(() => getConcernBlock(structured), [structured]);
  const improvements= useMemo(() => getImprovementList(structured), [structured]);

  if (loading) return (
    <div className="max-w-6xl mx-auto pt-32 px-6">
      <Spinner label="Loading report" />
    </div>
  );
  if (!pitch)  return <div className="max-w-6xl mx-auto pt-32 px-6 text-white">Pitch report not found.</div>;

  const ratingStyle = getRatingStyle(overallRating);

  return (
    <div className="max-w-6xl mx-auto pt-32 px-6 pb-20 space-y-6">

      {/* ── BACK ── */}
      <button
        onClick={() => navigate("/history")}
        className="flex items-center gap-2 text-slate-500 hover:text-white text-sm font-semibold transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back to History
      </button>

      {/* ── HERO HEADER ── */}
      <div className="bg-[#07132b] border border-white/8 rounded-[2rem] p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-8">

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-slate-500">Pitch Report</p>
          <h1 className="text-4xl md:text-5xl font-brand font-extrabold text-white tracking-tight leading-tight">
            {pitch.pitch_type || "Pitch Session"}
          </h1>
          <p className="text-slate-500 text-sm">
            {new Date(pitch.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            {" · "}
            {new Date(pitch.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>

        {/* Score + Rating */}
        <div className="flex items-center gap-6 shrink-0">
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Avg Score</p>
            <p className="text-6xl font-brand font-black text-pitch-cyan leading-none">{avgScore ?? "—"}</p>
            <p className="text-slate-600 text-sm mt-1">out of 5</p>
          </div>
          {overallRating && (
            <div style={{
              background: ratingStyle.bg,
              border: `1px solid ${ratingStyle.border}`,
              borderRadius: 16,
              padding: "12px 20px",
              textAlign: "center",
            }}>
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Rating</p>
              <p style={{ color: ratingStyle.color, fontSize: 22, fontWeight: 800, letterSpacing: "-0.3px" }}>
                {overallRating}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── METRIC CARDS ── */}
      {metrics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {metrics.map((metric) => (
            <div key={metric.key} className="bg-[#07132b] border border-white/8 rounded-[1.5rem] p-6 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">{metric.label}</p>
                <p className="text-3xl font-brand font-black text-pitch-cyan leading-none">{metric.score ?? "—"}</p>
              </div>
              {/* Score bar */}
              <div className="w-full bg-white/5 h-1.5 rounded-full">
                <div
                  className="bg-pitch-cyan h-1.5 rounded-full"
                  style={{ width: `${((metric.score ?? 0) / 5) * 100}%` }}
                />
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">{metric.analysis}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── STRENGTHS ── */}
      {strengths.length > 0 && (
        <SectionCard title="Strengths" accent="#34d399">
          <div className="space-y-5">
            {strengths.map((item, i) => (
              <div key={i} className="flex gap-4">
                <span className="text-emerald-400 mt-0.5 shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </span>
                <div className="space-y-1">
                  <p className="text-white font-semibold text-sm">{item.point}</p>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.evidence}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* ── WEAKNESSES ── */}
      {weaknesses.length > 0 && (
        <SectionCard title="Weaknesses / Risks" accent="#f87171">
          <div className="space-y-5">
            {weaknesses.map((item, i) => (
              <div key={i} className="flex gap-4">
                <span className="text-red-400 mt-0.5 shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </span>
                <div className="space-y-1">
                  <p className="text-white font-semibold text-sm">{item.point}</p>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.evidence}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* ── KEY CONCERN ── */}
      {concern && (
        <SectionCard title="Key Concern" accent="#fbbf24">
          <div className="bg-amber-400/5 border border-amber-400/15 rounded-2xl p-5">
            {typeof concern === "string" ? (
              <p className="text-slate-300 leading-relaxed text-sm">{concern}</p>
            ) : concern.exists ? (
              <p className="text-slate-300 leading-relaxed text-sm">{concern.description || "No description available."}</p>
            ) : (
              <p className="text-slate-500 text-sm">No major concern identified.</p>
            )}
          </div>
        </SectionCard>
      )}

      {/* ── IMPROVEMENTS ── */}
      {improvements.length > 0 && (
        <SectionCard title="How to Improve" accent="#22d3ee">
          <div className="space-y-3">
            {improvements.map((item, i) => (
              <div key={i} className="flex gap-4 items-start">
                <span className="text-pitch-cyan font-black text-sm shrink-0 w-6 text-right">{i + 1}.</span>
                <p className="text-slate-300 leading-relaxed text-sm">{item}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* ── CALL DETAILS ── */}
      <SectionCard title="Call Details">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Duration", value: pitch.duration_seconds ? `${Math.round(Number(pitch.duration_seconds))} sec` : "N/A" },
            { label: "Credits Used", value: pitch.credits_used ?? "N/A" },
            { label: "Cost", value: typeof pitch.cost === "number" ? `$${pitch.cost.toFixed(4)}` : "N/A" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/3 rounded-2xl p-4">
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">{label}</p>
              <p className="text-white font-semibold text-lg">{value}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── RECORDING ── */}
      {pitch.recording_url && (
        <SectionCard title="Recording">
          <audio controls className="w-full" style={{ accentColor: "#22d3ee" }}>
            <source src={pitch.recording_url} />
          </audio>
        </SectionCard>
      )}

      {/* ── TRANSCRIPT ── */}
      {pitch.pitch_transcript && (
        <SectionCard title="Transcript">
          <pre className="whitespace-pre-wrap text-slate-400 leading-relaxed font-sans text-sm">
            {pitch.pitch_transcript}
          </pre>
        </SectionCard>
      )}

    </div>
  );
}